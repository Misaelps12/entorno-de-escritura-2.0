// src/App.jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import Underline from '@tiptap/extension-underline'

import MenuBar from "./componente/menuBars/MenuBar.jsx";
import PantallaInicio from "./componente/PantallaInicio.jsx";

// Importamos funciones de Tauri
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile, readDir, exists, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

import './App.css'

// TipTap v3: Solo necesitamos TextStyleKit para fuentes y tamaños
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'

import { useEffect } from 'react';


function App() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [libroActivoId, setLibroActivoId] = useState(null);
  const [libros, setLibros] = useState([
    { id: 1, titulo: 'Los 6 Guardianes', contenido: '<h1>Los 6 Guardianes</h1><p>Había una vez...</p>' },
    { id: 2, titulo: 'Borrador de Ideas', contenido: '<h1>Borrador de Ideas</h1><p>Comienza a escribir aquí...</p>' },
  ]);

  const editor = useEditor({
    extensions: [
      StarterKit, 
      Underline, 
      TextStyleKit, 
      Highlight.configure({ multicolor: true }),
      Color,
    ],
    content: '<h1>Elige un libro</h1><p>Selecciona un libro en la biblioteca para comenzar.</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[800px] px-8 py-10',
      },
    },
  });

  // --- FUNCIONES DE PERSISTENCIA EN DISCO ---

  // Obtener la carpeta de datos de la app
  const obtenerCarpetaLibros = async () => {
    try {
      const dataDir = await appDataDir();
      const librosDir = `${dataDir}libros`;
      
      // Crear carpeta si no existe
      if (!(await exists(librosDir))) {
        await mkdir(librosDir, { recursive: true });
      }
      
      return librosDir;
    } catch (err) {
      console.error('Error al obtener carpeta:', err);
      return null;
    }
  };

  // Guardar un libro individual a disco
  const guardarLibroADisco = async (libro) => {
    try {
      const librosDir = await obtenerCarpetaLibros();
      if (!librosDir) return false;

      const nombreArchivo = `${librosDir}/${libro.id}-${libro.titulo.replace(/\s+/g, '_')}.json`;
      const datosLibro = {
        id: libro.id,
        titulo: libro.titulo,
        contenido: libro.contenido,
        fechaActualizacion: new Date().toISOString(),
      };

      await writeTextFile(nombreArchivo, JSON.stringify(datosLibro, null, 2));
      console.log(`✓ Libro guardado: ${libro.titulo}`);
      return true;
    } catch (err) {
      console.error('Error al guardar libro:', err);
      return false;
    }
  };

  // Cargar todos los libros desde disco
  const cargarLibrosDelDisco = async () => {
    try {
      const librosDir = await obtenerCarpetaLibros();
      if (!librosDir) return null;

      if (!(await exists(librosDir))) {
        console.log('Carpeta de libros no existe, usando valores por defecto');
        return null;
      }

      const archivos = await readDir(librosDir);
      const librosEnDisco = [];

      for (const archivo of archivos) {
        if (archivo.name.endsWith('.json')) {
          try {
            const contenido = await readTextFile(`${librosDir}/${archivo.name}`);
            const libro = JSON.parse(contenido);
            librosEnDisco.push(libro);
          } catch (err) {
            console.error(`Error al leer ${archivo.name}:`, err);
          }
        }
      }

      // Si encontramos libros, los retornamos; si no, retornamos null para usar los por defecto
      return librosEnDisco.length > 0 ? librosEnDisco : null;
    } catch (err) {
      console.error('Error al cargar libros:', err);
      return null;
    }
  };

  // --- LÓGICA DE ENTORNOS SEPARADOS ---

  const guardarLibroActualEnEstado = () => {
    if (libroActivoId === null || !editor) return;

    const contenidoActual = editor.getHTML();
    setLibros((librosPrevios) => {
      const librosActualizados = librosPrevios.map((libro) =>
        libro.id === libroActivoId ? { ...libro, contenido: contenidoActual } : libro
      );

      // Guardar en disco
      const libroActualizado = librosActualizados.find((l) => l.id === libroActivoId);
      if (libroActualizado) {
        guardarLibroADisco(libroActualizado);
      }

      return librosActualizados;
    });
  };

  const abrirEntorno = (idLibro) => {
    if (!editor) return;

    // Guardamos el libro actual antes de cambiar a otro
    if (libroActivoId !== null) {
      guardarLibroActualEnEstado();
    }

    const libro = libros.find((libro) => libro.id === idLibro);
    if (!libro) return;

    setLibroActivoId(idLibro);
    editor.commands.setContent(libro.contenido || `<h1>${libro.titulo}</h1><p>Comienza a escribir aquí...</p>`);
    setVistaActiva('editor');
  };

  const cerrarEntorno = () => {
    // Guardamos el contenido actual antes de volver
    if (libroActivoId !== null) {
      guardarLibroActualEnEstado();
    }
    
    // Volvemos a la pantalla de inicio
    setLibroActivoId(null);
    setVistaActiva('inicio');
  };

  // Cargar libros al iniciar la aplicación
  useEffect(() => {
    const cargarLibros = async () => {
      const librosDelDisco = await cargarLibrosDelDisco();
      if (librosDelDisco && librosDelDisco.length > 0) {
        setLibros(librosDelDisco);
      } else {
        // Si no hay libros en disco, guardar los por defecto
        const librosDefault = [
          { id: 1, titulo: 'Los 6 Guardianes', contenido: '<h1>Los 6 Guardianes</h1><p>Había una vez...</p>' },
          { id: 2, titulo: 'Borrador de Ideas', contenido: '<h1>Borrador de Ideas</h1><p>Comienza a escribir aquí...</p>' },
        ];
        
        for (const libro of librosDefault) {
          await guardarLibroADisco(libro);
        }
      }
    };

    cargarLibros();
  }, []);

  const manejarApertura = async () => {
    if (!editor) return;
    try {
      const seleccion = await open({
        multiple: false,
        filters: [{ name: 'Documento de Texto', extensions: ['html', 'txt'] }]
      });
      if (seleccion) {
        const contenido = await readTextFile(seleccion);
        editor.commands.setContent(contenido);
      }
    } catch (err) {
      console.error("Error al abrir:", err);
    }
  };

  const manejarGuardado = async () => {
    if (!editor) return;

    // 1. Guardar en el estado de la app (libros)
    guardarLibroActualEnEstado();

    // 2. Opcionalmente, permitir guardar como archivo externo
    try {
      const path = await save({
        filters: [{ name: 'Documento HTML', extensions: ['html'] }]
      });
      if (path) {
        await writeTextFile(path, editor.getHTML());
        console.log('✓ Archivo exportado:', path);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  if (!editor) return null;

  if (vistaActiva === 'inicio') {
    return (
      <PantallaInicio 
        alAbrirLibro={abrirEntorno}
      />
    );
  }

  const libroActivo = libros.find((libro) => libro.id === libroActivoId);

  // PANTALLA DEL EDITOR
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      <div className="sticky top-0 z-50 shadow-sm">
        {/* 3. AGREGAMOS ALVOLVER: Para poder regresar al menú principal */}
        <MenuBar 
          editor={editor} 
          alGuardar={manejarGuardado} 
          alAbrir={manejarApertura} 
          alVolver={cerrarEntorno} 
        />
      </div>

      <div className="flex-grow flex justify-center py-12 px-4 sm:px-8">
        <div className="w-full max-w-[850px] bg-white rounded-xl shadow-xl border border-slate-200/60 overflow-hidden">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200/60 px-6 py-2 text-xs text-slate-500 flex justify-between items-center z-40 relative">
        <div className="flex items-center gap-4">
          {/* Mostramos el nombre del libro que seleccionamos */}
          <span>Libro: <strong className="text-slate-700">{libroActivo?.titulo || 'Sin libro'}</strong></span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{editor.getText().trim().split(/\s+/).filter(word => word.length > 0).length} palabras</span>
        </div>
        <div>
          <span>Entorno de Escritura v1.0</span>
        </div>
      </div>

    </div>
  )
}

export default App;
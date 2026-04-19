// src/App.jsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState, useEffect } from 'react'
import Underline from '@tiptap/extension-underline'

import MenuBar from "./componente/menuBars/MenuBar.jsx";
import PantallaInicio from "./componente/PantallaInicio.jsx";

// Importamos funciones de Tauri v2
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile, readDir, exists, mkdir } from '@tauri-apps/plugin-fs';
import { documentDir, join } from '@tauri-apps/api/path';

import './App.css'

// TipTap v3
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'

function App() {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [libroActivoId, setLibroActivoId] = useState(null);
  const [libros, setLibros] = useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit, 
      Underline, 
      TextStyleKit, 
      Highlight.configure({ multicolor: true }),
      Color,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[800px] px-8 py-10',
      },
    },
  });

  // ==========================================
  // 1. MOTOR DE DISCO DURO (TAURI FS)
  // ==========================================

  const obtenerCarpetaLibros = async () => {
    const base = await documentDir();
    const ruta = await join(base, 'MisNovelas');
    if (!(await exists(ruta))) {
      await mkdir(ruta);
    }
    return ruta;
  };

  const cargarBiblioteca = async () => {
    try {
      const rutaNovelas = await obtenerCarpetaLibros();
      const archivos = await readDir(rutaNovelas);
      
      const librosCargados = [];
      for (const archivo of archivos) {
        if (archivo.name.endsWith('.json')) {
          const rutaCompleta = await join(rutaNovelas, archivo.name);
          const contenidoStr = await readTextFile(rutaCompleta);
          librosCargados.push(JSON.parse(contenidoStr));
        }
      }

      if (librosCargados.length === 0) {
        // Libros por defecto si la carpeta está vacía
        const ejemplos = [
          { id: 1, titulo: 'Los 6 Guardianes', contenido: '<h1>Los 6 Guardianes</h1><p>Gantetsu miró a Kasumi...</p>' },
          { id: 2, titulo: 'Borrador de Ideas', contenido: '<h1>Borrador</h1><p>Ideas para el siguiente arco...</p>' }
        ];
        for (const lib of ejemplos) {
          await guardarLibroADisco(lib);
        }
        setLibros(ejemplos);
      } else {
        setLibros(librosCargados);
      }
    } catch (err) {
      console.error("Error al cargar biblioteca:", err);
    }
  };

  const guardarLibroADisco = async (libro) => {
    try {
      const rutaNovelas = await obtenerCarpetaLibros();
      const nombreArchivo = `${libro.id}_${libro.titulo.replace(/\s+/g, '_')}.json`;
      const rutaFinal = await join(rutaNovelas, nombreArchivo);
      await writeTextFile(rutaFinal, JSON.stringify(libro, null, 2));
    } catch (err) {
      console.error("Error al guardar en disco:", err);
    }
  };

  // Cargar libros apenas se abre la aplicación
  useEffect(() => {
    cargarBiblioteca();
  }, []);


  // ==========================================
  // 2. LÓGICA DE NAVEGACIÓN Y ENTORNOS
  // ==========================================

  const abrirEntorno = (idLibro) => {
    const libro = libros.find(l => l.id === idLibro);
    if (libro && editor) {
      setLibroActivoId(idLibro);
      editor.commands.setContent(libro.contenido);
      setVistaActiva('editor');
    }
  };

  const cerrarEntorno = async () => {
    if (libroActivoId !== null && editor) {
      const contenidoActual = editor.getHTML();
      
      // Actualiza React
      const nuevosLibros = libros.map(l => 
        l.id === libroActivoId ? { ...l, contenido: contenidoActual } : l
      );
      setLibros(nuevosLibros);

      // ¡Guarda en Disco Duro automáticamente!
      const libroAGuardar = nuevosLibros.find(l => l.id === libroActivoId);
      await guardarLibroADisco(libroAGuardar);
    }
    
    setLibroActivoId(null);
    setVistaActiva('inicio');
  };

  const manejarAperturaExterna = async () => { /* ... tu código de abrir externo ... */ };
  const manejarGuardadoExterno = async () => { /* ... tu código de exportar externo ... */ };

  if (!editor) return null;


  // ==========================================
  // 3. INTERFAZ GRÁFICA (UI)
  // ==========================================

  // PANTALLA 1: Menú Principal
  if (vistaActiva === 'inicio') {
    return (
      // Asegúrate de que tu PantallaInicio reciba 'libros' para poder dibujarlos
      <PantallaInicio libros={libros} alAbrirLibro={abrirEntorno} /> 
    );
  }

  const libroActivo = libros.find((libro) => libro.id === libroActivoId);

  // PANTALLA 2: El Editor de Texto
  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <div className="flex-none shadow-sm z-50">
        <MenuBar 
          editor={editor} 
          alGuardar={cerrarEntorno} 
          alAbrir={manejarAperturaExterna} 
          alVolver={cerrarEntorno} 
        />
      </div>

      {/* ÁREA DE TRABAJO (Aquí dividimos la pantalla en dos) */}
      <div className="flex-grow flex flex-row overflow-hidden">
        
        {/* --- PANEL LATERAL (Sidebar) --- */}
        <div className="w-64 bg-slate-50 border-r border-slate-200/60 p-4 overflow-y-auto hidden md:block">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Base de Datos</h3>
          <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200 text-sm text-slate-600 mb-2 cursor-pointer hover:border-blue-400">
            Ficha: Mizuki (Uchiha)
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200 text-sm text-slate-600 mb-2 cursor-pointer hover:border-blue-400">
            Ficha: Gantetsu (18 años)
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200 text-sm text-slate-600 cursor-pointer hover:border-blue-400">
            Ficha: Kasumi (18 años)
          </div>
        </div>

        {/* --- LA HOJA DE PAPEL --- */}
        <div className="flex-grow flex justify-center py-8 px-4 sm:px-8 overflow-y-auto bg-slate-100/50">
          <div className="w-full max-w-[850px] h-fit bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden mb-12">
            <EditorContent editor={editor} />
          </div>
        </div>

      </div>

      {/* BARRA DE ESTADO (Footer) */}
      <div className="flex-none bg-white border-t border-slate-200/60 px-6 py-2 text-xs text-slate-500 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
          <span>Libro: <strong className="text-slate-700">{libroActivo?.titulo || 'Sin libro'}</strong></span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{editor.getText().trim().split(/\s+/).filter(word => word.length > 0).length} palabras</span>
        </div>
        <div>Entorno de Escritura v1.0</div>
      </div>

    </div>
  )
}

export default App;
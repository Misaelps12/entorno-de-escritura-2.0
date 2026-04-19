// src/components/MenuBar.jsx
import { useEditorState } from '@tiptap/react'
import { menuBarStateSelector } from './MenuBarState.jsx'
import { TamañosFuente, TiposDeColores, TiposGrafias } from '../../utils/editor-config.js'
export default function MenuBar({ editor, alGuardar, alAbrir, alVolver }) {
  if (!editor) {
    return null;
  }

  // AQUÍ CONECTAMOS EL FILTRO DE RENDIMIENTO
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  const getBtnClass = (isActive, isDisabled = false) => {
    const base = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ";
    if (isDisabled) return base + "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400";
    if (isActive) return base + "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg transform hover:scale-105";
    return base + "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md";
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-4">

      {/* Grupo Izquierdo: Herramientas de edición */}
      <div className="flex flex-wrap items-center gap-3">

        {/* ===== GRUPO 1: FORMATO DE TEXTO ===== 
            Contiene: Negrita, Cursiva, Tachado, Subrayado
            Usa: toggleBold(), toggleItalic(), toggleStrike(), toggleUnderline()
        */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200/60">

          {/* BOTÓN NEGRITA - Atajo: Ctrl+B */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editorState.canBold}
            className={getBtnClass(editorState.isBold, !editorState.canBold)}
            title="Negrita (Ctrl+B)"
          >
            <span className="font-bold">B</span>
          </button>

          {/* BOTÓN CURSIVA - Atajo: Ctrl+I */}
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editorState.canItalic}
            className={getBtnClass(editorState.isItalic, !editorState.canItalic)}
            title="Cursiva (Ctrl+I)"
          >
            <span className="italic">I</span>
          </button>

          {/* BOTÓN TACHADO - Tacha el texto seleccionado */}
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editorState.canStrike}
            className={getBtnClass(editorState.isStrike, !editorState.canStrike)}
            title="Tachado"
          >
            <span className="line-through">S</span>
          </button>

          {/* BOTÓN SUBRAYADO - Atajo: Ctrl+U */}
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editorState.canUnderline}
            className={getBtnClass(editorState.isUnderline, !editorState.canUnderline)}
            title="Subrayado (Ctrl+U)"
          >
            <span className="underline">U</span>
          </button>
        </div>

        {/* Separador Visual entre grupos */}
        <div className="w-px h-8 bg-slate-300"></div>

        {/* ===== GRUPO 2: TÍTULOS Y PÁRRAFOS ===== 
            Contiene: Botón Párrafo y Selector de Títulos (H1-H6)
            Usa: setParagraph(), setHeading({ level: 1-6 })
        */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200/60">

          {/* BOTÓN PÁRRAFO - Resetea cualquier título a párrafo normal */}
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={getBtnClass(editorState.isParagraph)}
            title="Párrafo"
          >
            📄
          </button>

          {/* SELECTOR DE TÍTULOS (H1 a H6) - Elige el nivel de título */}
          <select
            onChange={(e) => {
              if (e.target.value === '') {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().setHeading({ level: parseInt(e.target.value) }).run();
              }
            }}
            value={editor.getAttributes('heading').level || ''}
            className="px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-700"
          >
            <option value="">Título por defecto</option>
            <option value="1">Título 1</option>
            <option value="2">Título 2</option>
            <option value="3">Título 3</option>
            <option value="4">Título 4</option>
            <option value="5">Título 5</option>
            <option value="6">Título 6</option>
          </select>
        </div>

        {/* Separador Visual entre grupos */}
        <div className="w-px h-8 bg-slate-300"></div>


        {/* ===== GRUPO 5: FUENTE Y TAMAÑO ===== 
            Contiene: Selector de Tipo de Fuente, Selector de Tamaño de Fuente
            Usa: setFontFamily(), setFontSize(), unsetFontSize()
        */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200/60">

          {/* SELECTOR DE TIPO DE FUENTE - Elige el tipo/familia de fuente (Arial, Georgia, etc.) */}
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            value={editor.getAttributes('textStyle').fontFamily || ''}
            className="px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-700"
          >
            {/* Opciones de fuentes*/}
            {TiposGrafias.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.etiqueta}
              </option>
            ))}
          </select>

          {/* Separador pequeño dentro del grupo 5 */}
          <div className="w-px h-6 bg-slate-300"></div>

          {/* SELECTOR DE TAMAÑO DE FUENTE - Elige el tamaño en pixeles (8px, 16px, 24px, etc.) */}
          <select
            onChange={(e) => {
              if (e.target.value === '') {
                editor.chain().focus().unsetFontSize().run();
              } else {
                editor.chain().focus().setFontSize(e.target.value).run();
              }
            }}
            value={editor.getAttributes('textStyle').fontSize || ''}
            className="px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-700 w-24"
          >
            {TamañosFuente.map((tamaño) => (
              <option key={tamaño.value} value={tamaño.value}>
                {tamaño.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {/* Separador pequeño dentro del grupo 5 */}
        <div className="w-px h-6 bg-slate-300"></div>

        {/* ===== GRUPO 6: RESALTADO ===== */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200/60">
          <select
            onChange={(e) => {
              if (e.target.value === '') {
                editor.chain().focus().unsetHighlight().run();
              } else {
                editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
              }
            }}
            value={editorState.isHighlight ? editor.getAttributes('highlight').color : ''}
            className="px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-700 w-24"
          >
            <option value="">Resaltado</option>

            {TiposDeColores.map((color) => (
              <option key={color.value} value={color.value}>
                {color.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== GRUPO 7: COLOR DE LETRA ===== */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-200/60 items-center px-3">
          
          {/* El input nativo de color */}
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editorState.currentColor || '#000000'}
            className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
            title="Cambiar color de texto"
          />
          
          {/* Un botoncito para borrar el color y volver a negro */}
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Quitar color"
          >
            Restablecer
          </button>
        </div>



      {/* ===== GRUPO DERECHO: BOTÓN DE GUARDAR ===== 
          Acción: Guarda el archivo en formato HTML
          Usa: alGuardar (función pasada como prop)
      */}
      <div className="flex gap-3">
        <button 
          onClick={alAbrir}
          className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>📂</span>
        </button>


        <button
          onClick={alGuardar}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>💾</span>
          Guardar
        </button>

        {/* ===== BOTÓN VOLVER A LA BIBLIOTECA ===== */}
        <button 
          onClick={alVolver}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          title="Volver a la Biblioteca"
        >
          <span>←</span>
          Volver
        </button>
      </div>
    </div>
  );
}
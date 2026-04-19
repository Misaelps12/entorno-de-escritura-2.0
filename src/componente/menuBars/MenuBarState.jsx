// src/components/menuBarState.js

export function menuBarStateSelector(ctx) {
  return {
    // Formato de texto
    isBold: ctx.editor.isActive('bold') ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive('italic') ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    isStrike: ctx.editor.isActive('strike') ?? false,
    canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
    isCode: ctx.editor.isActive('code') ?? false,
    canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
    isHighlight: ctx.editor.isActive('highlight') ?? false,
    canHighlight: ctx.editor.can().chain().toggleHighlight().run() ?? false,

    // Títulos y Párrafos
    isParagraph: ctx.editor.isActive('paragraph') ?? false,
    isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
    isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
    isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
    isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
    isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
    isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,

    // Listas y Bloques
    isBulletList: ctx.editor.isActive('bulletList') ?? false,
    isOrderedList: ctx.editor.isActive('orderedList') ?? false,
    isBlockquote: ctx.editor.isActive('blockquote') ?? false,
    
    // Historial
    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,

    isUnderline: ctx.editor.isActive('underline') ?? false,
    canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,

    currentFont: ctx.editor.getAttributes('textStyle').fontFamily || '',
    currentSize: ctx.editor.getAttributes('textStyle').fontSize || '',

    currentColor: ctx.editor.getAttributes('textStyle').color || '',
  }
}
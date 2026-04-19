// src/components/PantallaInicio.jsx
export default function PantallaInicio({ alAbrirLibro }) {
  // Por ahora simulamos que tienes estos proyectos guardados
  const misLibros = [
    { id: 1, titulo: "Los 6 Guardianes", ultimaEdicion: "Hoy, 14:30", color: "from-blue-500 to-indigo-600" },
    { id: 2, titulo: "Borrador de Ideas", ultimaEdicion: "Ayer", color: "from-emerald-500 to-teal-600" }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-10 font-sans flex flex-col items-center">
      
      <div className="w-full max-w-5xl">
        {/* Cabecera */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Mi Biblioteca</h1>
            <p className="text-slate-500 mt-2">¿En qué mundo vamos a trabajar hoy?</p>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center gap-2">
            <span>+</span> Nuevo Libro
          </button>
        </div>

        {/* Rejilla de Libros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {misLibros.map((libro) => (
            <div 
              key={libro.id}
              onClick={() => alAbrirLibro(libro.id)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 transition-all cursor-pointer transform hover:-translate-y-1 group"
            >
              <div className={`h-32 rounded-xl bg-gradient-to-br ${libro.color} mb-4 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity`}>
                <span className="text-4xl">📚</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{libro.titulo}</h2>
              <p className="text-sm text-slate-500 mt-1">Última edición: {libro.ultimaEdicion}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
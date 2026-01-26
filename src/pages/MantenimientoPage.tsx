import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ComponentStatus = 'en_proceso' | 'pendiente'
type TaskStatus = 'completada' | 'pendiente'

interface ComponentTask {
  id: string
  descripcion: string
  estado: TaskStatus
}

interface ComponenteCritico {
  id: string
  nombre: string
  codigo: string
  cliente: string
  imagen: string
  estado: ComponentStatus
  tareas: ComponentTask[]
}

function MantenimientoPage() {
  const navigate = useNavigate()
  // const { id } = useParams() // Unused for now

  const [componentes, setComponentes] = useState<ComponenteCritico[]>([
    {
      id: '1',
      nombre: 'Camisa',
      codigo: '#VIG-9982',
      cliente: 'Minera Escondida',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgLYzit4J5mzIBZFQoPN_ujHSVagKGH1_L9ziiwKaCj-zFY8Q5kdERDFYTFtVJC1yxCDMq-z-uoKaEMj_ts6e4kUcPQSjMd6uQvaPx_BWTMq8im9g3Wq7QPizEyirF3Euaq3Crrq9Lhm0BIMKiBs3aAFGJS3KTRdmvZj3UH5M4vCWUiiYr9-cpJpUl4kyXW_elJ8MN3dTQ5mgAI2Ue_3qLeQApsclEe16HaD7fLUPSMLbaxWSXKC724cPt0Ci7DR04FITHOVVqXBo',
      estado: 'en_proceso',
      tareas: [
        { id: '1', descripcion: 'Limpieza Química', estado: 'completada' as TaskStatus },
        { id: '2', descripcion: 'Inspección de Superficie', estado: 'completada' as TaskStatus },
        { id: '3', descripcion: 'Pulido de Camisa', estado: 'pendiente' as TaskStatus },
        { id: '4', descripcion: 'Cambio Kit de Sellos', estado: 'pendiente' as TaskStatus }
      ]
    },
    {
      id: '2',
      nombre: 'Tapas',
      codigo: '#VIG-4011',
      cliente: 'Anglo American',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq6HrNQhcpJdagfhhBHaXwhVOhQRaVsRHSsl7yksqD94MSc2ikNDt2T7U3K2WwZijr3t9masQ5xRYIS_doWDRuYZAQPi2i72qL9Je_pbysmwszyqcRZYbM8q2bzEMkuvDZaCpfFdQIq59ml7ArQtweCj2ufzFZeMqoReXeGA5uIqfQDoQr3pGWjiZsxRyS8oW-DU2djdZjKwNwjE6cM6YXWwlzoZb7dwEZBGKmDtWnPLTIN95B7YG8iOPUEcAtCDj1FahRyeT6iI',
      estado: 'pendiente',
      tareas: [
        { id: '1', descripcion: 'Desengrasado', estado: 'pendiente' as TaskStatus },
        { id: '2', descripcion: 'Rectificado Rosca', estado: 'pendiente' as TaskStatus }
      ]
    }
  ])

  const handleBack = () => {
    navigate('/tareas')
  }

  const handleToggleTask = (componenteId: string, taskId: string) => {
    const nuevosComponentes = componentes.map(comp => {
      if (comp.id === componenteId) {
        return {
          ...comp,
          tareas: comp.tareas.map(tarea => {
            if (tarea.id === taskId) {
              return {
                ...tarea,
                estado: (tarea.estado === 'completada' ? 'pendiente' : 'completada') as TaskStatus
              }
            }
            return tarea
          })
        }
      }
      return comp
    })
    setComponentes(nuevosComponentes)
  }

  const handleListoPruebas = (componenteId: string) => {
    const componente = componentes.find(c => c.id === componenteId)
    if (!componente) return

    const tareasPendientes = componente.tareas.filter(t => t.estado === 'pendiente')
    if (tareasPendientes.length > 0) {
      alert('Aún hay tareas pendientes en este componente')
      return
    }

    alert(`Componente ${componente.nombre} listo para pruebas`)
  }

  // Calcular progreso general
  const totalTareas = componentes.reduce((acc, comp) => acc + comp.tareas.length, 0)
  const tareasCompletadas = componentes.reduce(
    (acc, comp) => acc + comp.tareas.filter(t => t.estado === 'completada').length,
    0
  )
  const progreso = totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm pt-4 pb-2 px-4 shadow-sm dark:shadow-none border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4 relative">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">arrow_back_ios_new</span>
          </button>
          <div className="text-center flex-1">
            <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-slate-800/90 dark:bg-slate-800 rounded-full px-2 py-0.5 border border-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[0.6rem] font-bold text-white tracking-wider uppercase">Sincronizado</span>
            </div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">
              Proceso de Mantención
            </h1>
            <p className="text-[0.65rem] font-bold text-primary tracking-[0.2em] uppercase">
              Vignola Industrial
            </p>
          </div>
          <button className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-primary">search</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 px-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado de Taller</span>
            <span className="text-xs font-bold text-primary italic">{tareasCompletadas}/{totalTareas} COMPLETADOS</span>
          </div>
          <div className="h-2 w-full bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Componentes Críticos</h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Asignados para hoy</p>
        </div>

        {/* Component Cards */}
        {componentes.map((componente) => (
          <div
            key={componente.id}
            className={`bg-white dark:bg-surface-card rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 ${
              componente.estado === 'pendiente' ? 'opacity-90' : ''
            }`}
          >
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden group">
              <img
                alt={`${componente.nombre} - Hydraulic Component`}
                className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ${
                  componente.estado === 'pendiente' ? 'filter grayscale contrast-125' : ''
                }`}
                src={componente.imagen}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-surface-card dark:via-transparent dark:to-transparent opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full uppercase shadow-md border text-[0.65rem] font-bold"
                style={{
                  backgroundColor: componente.estado === 'en_proceso' ? '#EAB308' : 'rgba(107, 114, 128, 0.8)',
                  color: componente.estado === 'en_proceso' ? 'black' : 'white',
                  borderColor: componente.estado === 'en_proceso' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(156, 163, 175, 0.3)'
                }}
              >
                {componente.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
              </div>

              {/* Component Info Overlay */}
              <div className="absolute bottom-2 left-4 right-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase drop-shadow-md">
                  {componente.nombre} - ID: {componente.codigo}
                </h3>
                <p className="text-xs font-bold text-primary italic uppercase drop-shadow-sm">
                  Cliente: {componente.cliente}
                </p>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="p-4 space-y-4">
              {/* Task List */}
              <div className="space-y-3">
                {componente.tareas.map((tarea) => (
                  <div
                    key={tarea.id}
                    onClick={() => handleToggleTask(componente.id, tarea.id)}
                    className="flex items-center space-x-3 group cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-colors ${
                      tarea.estado === 'completada'
                        ? 'bg-primary'
                        : 'border-2 border-slate-400 dark:border-slate-600 group-hover:border-primary'
                    }`}>
                      {tarea.estado === 'completada' && (
                        <span className="material-symbols-outlined text-white text-sm">check</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      tarea.estado === 'completada'
                        ? 'text-slate-700 dark:text-slate-200 font-bold group-hover:text-primary'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    }`}>
                      {tarea.descripcion}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleListoPruebas(componente.id)}
                disabled={componente.estado === 'pendiente'}
                className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] mt-4 ${
                  componente.estado === 'pendiente'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                    : 'bg-primary hover:bg-blue-700 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {componente.estado === 'pendiente' ? 'block' : 'verified'}
                </span>
                <span className="tracking-wide text-sm">
                  {componente.estado === 'pendiente' ? 'TAREAS PENDIENTES' : 'LISTO PARA PRUEBAS'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-surface-card/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 pb-safe z-50 max-w-md mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          <button
            onClick={() => navigate('/buscar')}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
            <span className="text-[10px] font-medium">Buscar</span>
          </button>

          <button
            onClick={() => navigate('/tareas')}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-primary transition-colors"
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
            <span className="text-[10px] font-medium">Tareas</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default MantenimientoPage

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type TareaStatus = 'pendiente' | 'en_proceso' | 'completado'

interface TareaMantenimiento {
  id: string
  componente: string
  descripcion: string
  estado: TareaStatus
  evidencia: string[]
}

function MantenimientoPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [tareas, setTareas] = useState<TareaMantenimiento[]>([
    {
      id: '1',
      componente: 'Camisa (Barrel)',
      descripcion: 'Pulido interior para eliminar ralladuras y recuperar rugosidad especificada',
      estado: 'en_proceso',
      evidencia: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop']
    },
    {
      id: '2',
      componente: 'Tapas',
      descripcion: 'Revisión de roscas internas y limpieza de canales de aceite',
      estado: 'pendiente',
      evidencia: []
    },
    {
      id: '3',
      componente: 'Vástago (Rod)',
      descripcion: 'Re-cromado y pulido de zona de trabajo',
      estado: 'pendiente',
      evidencia: []
    },
    {
      id: '4',
      componente: 'Kit de Sellos',
      descripcion: 'Reemplazo completo de sellos dañados',
      estado: 'pendiente',
      evidencia: []
    },
    {
      id: '5',
      componente: 'Pistón',
      descripcion: 'Inspección de desgaste y limpieza de ranuras',
      estado: 'pendiente',
      evidencia: []
    }
  ])

  const handleBack = () => {
    navigate('/tareas')
  }

  const handleGuardar = () => {
    console.log('Guardando estado de mantenimiento:', tareas)
    alert('Progreso guardado exitosamente')
  }

  const handleFinalizar = () => {
    const tareasPendientes = tareas.filter(t => t.estado !== 'completado')
    if (tareasPendientes.length > 0) {
      alert('Aún hay tareas pendientes de completar')
      return
    }
    alert('Mantención finalizada exitosamente')
    navigate('/tareas')
  }

  const handleCompletarTarea = (tareaId: string) => {
    const nuevasTareas = tareas.map(tarea => {
      if (tarea.id === tareaId) {
        return {
          ...tarea,
          estado: tarea.estado === 'completado' ? 'en_proceso' : 'completado' as TareaStatus
        }
      }
      return tarea
    })
    setTareas(nuevasTareas)
  }

  const handleIniciarTarea = (tareaId: string) => {
    const nuevasTareas = tareas.map(tarea => {
      if (tarea.id === tareaId) {
        return { ...tarea, estado: 'en_proceso' as TareaStatus }
      }
      return tarea
    })
    setTareas(nuevasTareas)
  }

  const handleAgregarEvidencia = (tareaId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const nuevasTareas = tareas.map(tarea => {
            if (tarea.id === tareaId) {
              return { ...tarea, evidencia: [...tarea.evidencia, reader.result as string] }
            }
            return tarea
          })
          setTareas(nuevasTareas)
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const tareasCompletadas = tareas.filter(t => t.estado === 'completado').length
  const progreso = (tareasCompletadas / tareas.length) * 100

  const getEstadoBadge = (estado: TareaStatus) => {
    switch (estado) {
      case 'completado':
        return {
          label: 'Completado',
          bg: 'bg-green-500/10',
          color: 'text-green-500',
          border: 'border-green-500/30'
        }
      case 'en_proceso':
        return {
          label: 'En Proceso',
          bg: 'bg-primary/10',
          color: 'text-primary',
          border: 'border-primary/30'
        }
      default:
        return {
          label: 'Pendiente',
          bg: 'bg-slate-500/10',
          color: 'text-slate-500',
          border: 'border-slate-500/30'
        }
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-border-dark">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="text-white flex size-10 shrink-0 items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="flex-1 px-2">
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight uppercase">Proceso de Mantención</h2>
            <p className="text-text-muted-dark text-[10px] uppercase tracking-widest font-semibold">Orden #9942</p>
          </div>
          <button
            onClick={handleGuardar}
            className="flex items-center justify-center rounded bg-slate-700 dark:bg-slate-800 p-2"
          >
            <span className="material-symbols-outlined text-white">save</span>
          </button>
        </div>
      </header>

      {/* Cylinder Info Card */}
      <div className="p-4">
        <div className="bg-surface-dark border border-border-dark rounded-xl p-4 flex gap-4">
          <div className="bg-primary/10 p-3 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">build_circle</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-base font-bold">Cilindro Telescópico</h3>
            <p className="text-text-muted-dark text-sm mt-1">Cliente: Minera Escondida</p>
            <p className="text-text-muted-dark text-xs">Modelo: CAT-320D • Carrera: 1200mm</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-4 pb-4">
        <div className="bg-surface-dark border border-border-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">progress_activity</span>
              <span className="text-white text-sm font-bold">Progreso de Mantención</span>
            </div>
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
              {tareasCompletadas}/{tareas.length} pasos
            </span>
          </div>
          <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          <p className="text-text-muted-dark text-xs mt-2 text-right">
            {progreso.toFixed(0)}% completado
          </p>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 pb-2 pt-2">
        <h3 className="text-white text-lg font-bold">Tareas de Mantenimiento</h3>
        <p className="text-text-muted-dark text-xs mt-1">
          Complete cada tarea y agregue evidencia fotográfica
        </p>
      </div>

      {/* Tasks List */}
      <main className="px-4 space-y-4">
        {tareas.map((tarea, index) => {
          const estadoBadge = getEstadoBadge(tarea.estado)

          return (
            <div
              key={tarea.id}
              className={`bg-surface-dark border border-border-dark rounded-xl overflow-hidden ${
                tarea.estado === 'completado' ? 'opacity-75' : ''
              }`}
            >
              {/* Header */}
              <div className="p-4 flex items-start gap-3 border-b border-border-dark">
                <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 shrink-0 mt-1">
                  <span className="text-primary text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-white text-base font-bold">{tarea.componente}</h4>
                      <p className="text-text-muted-dark text-sm mt-1">{tarea.descripcion}</p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${estadoBadge.bg} ${estadoBadge.color} ${estadoBadge.border}`}
                    >
                      {estadoBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-800/50 flex gap-2">
                {tarea.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleIniciarTarea(tarea.id)}
                                                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-bold py-3 text-sm active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      INICIAR
                    </button>
                  </>
                )}

                {tarea.estado === 'en_proceso' && (
                  <>
                    <button
                      onClick={() => handleCompletarTarea(tarea.id)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-sm active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      COMPLETAR
                    </button>
                    <button
                                                      onClick={() => handleAgregarEvidencia(tarea.id)}
                      className="w-12 flex items-center justify-center rounded-lg border border-border-dark text-primary hover:bg-primary/10 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined">add_a_photo</span>
                    </button>
                  </>
                )}

                {tarea.estado === 'completado' && (
                  <div className="flex-1 flex items-center justify-center gap-2 text-green-500 font-medium text-sm">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Tarea Completada
                  </div>
                )}
              </div>

              {/* Evidence Section */}
              {tarea.evidencia.length > 0 && (
                <div className="p-4 border-t border-border-dark">
                  <p className="text-text-muted-dark text-xs font-bold uppercase tracking-wider mb-2">
                    Evidencia Fotográfica
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {tarea.evidencia.map((foto, fotoIndex) => (
                      <div
                        key={fotoIndex}
                        className="relative size-20 shrink-0 rounded-lg overflow-hidden border border-border-dark"
                      >
                        <img
                          alt={`Evidencia ${fotoIndex + 1}`}
                          className="object-cover w-full h-full"
                          src={foto}
                        />
                      </div>
                    ))}
                    <button
                                                      onClick={() => handleAgregarEvidencia(tarea.id)}
                      className="size-20 shrink-0 rounded-lg border-2 border-dashed border-border-dark flex flex-col items-center justify-center text-text-muted-dark hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </main>

      {/* Spacer for fixed nav */}
      <div className="h-20"></div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-40">
        <button
          onClick={handleFinalizar}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">task_alt</span>
          Finalizar Mantención
        </button>
      </div>
    </div>
  )
}

export default MantenimientoPage

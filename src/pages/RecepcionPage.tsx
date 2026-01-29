import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { authService } from '../services/api'
import { BottomNavigation } from '../components/layout/BottomNavigation'

function RecepcionPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Form state
  const [nombreCliente, setNombreCliente] = useState('')
  const [ordenTrabajo, setOrdenTrabajo] = useState('')
  const [contacto, setContacto] = useState('')
  const [planta, setPlanta] = useState('')
  const [numeroSAP, setNumeroSAP] = useState('')
  const [numeroCilindros, setNumeroCilindros] = useState('')
  const [tipoComponente, setTipoComponente] = useState('Cilindro Hidráulico')
  const [prioridad, setPrioridad] = useState<'Normal' | 'Urgente'>('Normal')
  const [diametroCamisa, setDiametroCamisa] = useState('')
  const [diametroVastago, setDiametroVastago] = useState('')
  const [largoCarrera, setLargoCarrera] = useState('')
  const [fotoArmado, setFotoArmado] = useState<File | null>(null)
  const [fotoDespiece, setFotoDespiece] = useState<File | null>(null)
  const [previewArmado, setPreviewArmado] = useState<string | null>(null)
  const [previewDespiece, setPreviewDespiece] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Prueba de Presión
  const [activarPruebaPresion, setActivarPruebaPresion] = useState(false)
  const [presionPrueba, setPresionPrueba] = useState('')
  const [fugaInterna, setFugaInterna] = useState(false)
  const [fugaExterna, setFugaExterna] = useState(false)
  const [observacionesPrueba, setObservacionesPrueba] = useState('')
  const [fallasDetectadas, setFallasDetectadas] = useState('')
  const [fotosPrueba, setFotosPrueba] = useState<string[]>([])
  const [fotosFugaInterna, setFotosFugaInterna] = useState<string[]>([])
  const [fotosFugaExterna, setFotosFugaExterna] = useState<string[]>([])

  const handleCerrar = () => {
    navigate('/')
  }

  const handleCapturarFoto = async (tipo: 'armado' | 'despiece') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const preview = reader.result as string

          if (tipo === 'armado') {
            setFotoArmado(file)
            setPreviewArmado(preview)
          } else {
            setFotoDespiece(file)
            setPreviewDespiece(preview)
          }
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const handleGuardar = async () => {
    if (!fotoArmado) {
      alert('Debes capturar la foto obligatoria de Armado antes de guardar')
      return
    }

    if (activarPruebaPresion && !presionPrueba) {
      alert('Debes registrar la presión de prueba cuando está activada')
      return
    }

    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoading(true)

      let user = authService.getCurrentUser()
      if (!user) {
        alert('Debes estar autenticado para guardar')
        return
      }

      // Validar que el user.id sea un UUID válido (corrección para usuarios con ID antiguo)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      console.log('Usuario actual:', user)
      console.log('¿Es UUID válido?', uuidRegex.test(user.id))

      if (!uuidRegex.test(user.id)) {
        console.log('ID no válido, generando nuevo UUID...')
        // Generar nuevo UUID válido y actualizar el usuario
        const newUserId = crypto.randomUUID()
        console.log('Nuevo UUID:', newUserId)
        user = { ...user, id: newUserId }
        localStorage.setItem('user', JSON.stringify(user))

        // Actualizar en la base de datos
        try {
          await supabaseService.createOrUpdateUsuario(user)
          console.log('Usuario actualizado en BD correctamente')
        } catch (error) {
          console.warn('No se pudo actualizar el usuario en BD:', error)
        }
      }

      console.log('Usuario final antes de guardar inspección:', user)

      // Verificar/crear usuario en la base de datos y obtener el usuario actualizado
      let usuarioActualizado = user
      try {
        await supabaseService.createOrUpdateUsuario(user)
        console.log('Usuario verificado/creado en BD correctamente')

        // Obtener el usuario actualizado desde la BD para tener el ID correcto
        const usuarioBD = await supabaseService.getUsuarioByEmail(user.email)
        if (usuarioBD) {
          console.log('Usuario obtenido de BD:', usuarioBD)
          usuarioActualizado = usuarioBD
          // Actualizar localStorage con el usuario correcto de la BD
          localStorage.setItem('user', JSON.stringify(usuarioBD))
        }
      } catch (error: any) {
        console.error('Error al verificar usuario en BD:', error)
        alert('Error de autenticación. Por favor cierra sesión y vuelve a iniciar sesión.')
        setLoading(false)
        return
      }

      // Subir fotos a Supabase Storage (con manejo de errores)
      let fotoArmadoUrl = ''
      let fotoDespieceUrl = ''

      try {
        if (fotoArmado) {
          fotoArmadoUrl = await supabaseService.uploadFoto(fotoArmado, id, 'armado')
        }
      } catch (error: any) {
        console.warn('No se pudo subir foto de armado, continuando...', error.message)
        fotoArmadoUrl = '' // Se podrá agregar después
      }

      try {
        if (fotoDespiece) {
          fotoDespieceUrl = await supabaseService.uploadFoto(fotoDespiece, id, 'despiece')
        }
      } catch (error: any) {
        console.warn('No se pudo subir foto de despiece, continuando...', error.message)
        fotoDespieceUrl = '' // Se podrá agregar después
      }

      // Crear objeto de cilindro con los datos del formulario (solo campos que existen en la tabla)
      const cilindroData = {
        id_codigo: `CIL-${Date.now()}`, // Generar ID único
        tipo: tipoComponente as 'Buzo' | 'Cuña Flap' | 'Oleohidráulico' | 'Cilindro Hidráulico' | 'Cilindro Neumático' | 'Vástago' | 'Camisa' | 'Bomba',
        fabricante: 'Parker', // Valor por defecto, se puede cambiar en el futuro
        diametro_camisa: diametroCamisa || '0',
        diametro_vastago: diametroVastago || '0',
        carrera: largoCarrera || '0'
      }

      // Primero crear el cilindro en la base de datos
      const cilindroCreado = await supabaseService.createCilindro(cilindroData)
      console.log('Cilindro creado:', cilindroCreado)

      // Crear objeto con información adicional del cliente
      const infoRecepcion = {
        cliente: nombreCliente,
        planta: planta,
        contacto: contacto,
        prioridad: prioridad,
        numeroSAP: numeroSAP,
        numeroCilindros: numeroCilindros || '1'
      }

      // Crear nueva inspección con todos los datos
      // (El UUID ya fue generado en DashboardPage, así que siempre es una inspección nueva)
      await supabaseService.createInspeccion({
        id,
        cilindro_id: cilindroCreado.id_codigo, // Usar el ID del cilindro creado
        usuario_id: usuarioActualizado.id, // Usar el ID del usuario de la BD
        sap_cliente: ordenTrabajo,
        nombre_cliente: nombreCliente || undefined,
        contacto_cliente: contacto || undefined,
        planta: planta || undefined,
        foto_armado_url: fotoArmadoUrl,
        foto_despiece_url: fotoDespieceUrl || '',
        notas_recepcion: JSON.stringify(infoRecepcion), // Guardar info del cliente como JSON
        presion_prueba: 0,
        fuga_interna: false,
        fuga_externa: false,
        estado_inspeccion: 'borrador',
        etapas_completadas: ['recepcion'], // Inicializar etapas completadas
        created_at: new Date().toISOString()
      })

      // Si la prueba de presión está activa, guardar los datos
      if (activarPruebaPresion) {
        try {
          await supabaseService.savePruebas(id, {
            presion_objetivo: parseFloat(presionPrueba),
            sostenimiento: 0, // No aplica para inspección
            presion_inicial: parseFloat(presionPrueba),
            presion_final: parseFloat(presionPrueba),
            fuga_vastago: fugaInterna,
            fuga_piston: fugaExterna,
            deformacion: false,
            observaciones: fallasDetectadas ? `${fallasDetectadas}\n\n${observacionesPrueba}` : observacionesPrueba,
            fotos_pruebas: [
              ...fotosPrueba,
              ...fotosFugaInterna,
              ...fotosFugaExterna
            ]
          })

          // Actualizar inspección con datos de prueba
          await supabaseService.updateInspeccion(id, {
            etapas_completadas: ['recepcion', 'pruebas_presion'],
            presion_prueba: parseFloat(presionPrueba),
            fuga_interna: fugaInterna,
            fuga_externa: fugaExterna,
            notas_pruebas: observacionesPrueba
          })
        } catch (error) {
          console.warn('Error guardando prueba de presión, continuando...', error)
        }
      }

      // Guardar datos adicionales del cilindro en localStorage para uso futuro
      localStorage.setItem(`cilindro_${id}`, JSON.stringify(cilindroData))

      // Mostrar mensaje de éxito
      alert('✅ Recepción guardada exitosamente')

      // Navegar directamente a Peritaje
      navigate(`/inspeccion/${id}/peritaje`)
    } catch (error: any) {
      console.error('Error guardando recepción:', error)
      alert(`Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto bg-background-light dark:bg-background-dark">

      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-background-dark p-4 shadow-sm dark:shadow-none border-b border-gray-200 dark:border-border-dark/50">
        <button
          onClick={handleCerrar}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-white">close</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Nueva Recepción</h2>
        <div className="hidden w-10 items-center justify-end">
          {/* Placeholder for balance if needed */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-2 space-y-6">
        {/* Section: Información del Cliente */}
        <section>
          <div className="flex items-center gap-2 py-4">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Información del Cliente</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* Cliente Autocomplete */}
            <label className="flex flex-col flex-1 group">
              <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Nombre del Cliente</p>
              <div className="flex w-full items-center rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="w-full min-w-0 flex-1 border-none bg-transparent h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-0 text-slate-900 dark:text-white"
                  placeholder="Buscar cliente..."
                />
                <div className="flex items-center justify-center px-4 text-gray-400 dark:text-text-muted-dark">
                  <span className="material-symbols-outlined">search</span>
                </div>
              </div>
            </label>

            <div className="flex flex-row gap-4 flex-wrap">
              {/* Orden de Trabajo */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Orden de Trabajo</p>
                <input
                  type="number"
                  value={ordenTrabajo}
                  onChange={(e) => setOrdenTrabajo(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Ej: 45092"
                />
              </label>

              {/* Contacto */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Contacto</p>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Nombre"
                />
              </label>

              {/* Planta (Opcional) */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Planta <span className="text-xs font-normal text-gray-400">(Opcional)</span></p>
                <input
                  type="text"
                  value={planta}
                  onChange={(e) => setPlanta(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Nombre planta"
                />
              </label>

              {/* N° SAP */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">N° SAP</p>
                <input
                  type="text"
                  value={numeroSAP}
                  onChange={(e) => setNumeroSAP(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Ej: 4500012345"
                />
              </label>

              {/* Código de cilindro */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Código de cilindro</p>
                <input
                  type="number"
                  value={numeroCilindros}
                  onChange={(e) => setNumeroCilindros(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Ej: 1"
                  min="1"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>

        {/* Section: Especificaciones del Cilindro */}
        <section>
          <div className="flex items-center gap-2 py-4">
            <span className="material-symbols-outlined text-primary text-[20px]">fluid</span>
            <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Especificaciones del Cilindro</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* Tipo y Prioridad Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo Selector */}
              <label className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Tipo de Componente</p>
                <div className="relative">
                  <select
                    value={tipoComponente}
                    onChange={(e) => setTipoComponente(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 pl-4 pr-10 text-base font-normal focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  >
                    <option>Cilindro Hidráulico</option>
                    <option>Cilindro Neumático</option>
                    <option>Vástago</option>
                    <option>Camisa</option>
                    <option>Bomba</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-text-muted-dark">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </label>

              {/* Prioridad Toggle */}
              <div className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Prioridad</p>
                <div className="flex h-12 w-full items-center rounded-xl bg-gray-200 dark:bg-surface-dark/50 p-1 border border-gray-300 dark:border-border-dark">
                  <button
                    onClick={() => setPrioridad('Normal')}
                    className={`flex-1 h-full rounded-lg text-sm font-semibold transition-all ${
                      prioridad === 'Normal'
                        ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setPrioridad('Urgente')}
                    className={`flex-1 h-full rounded-lg text-sm font-medium transition-all ${
                      prioridad === 'Urgente'
                        ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Urgente
                  </button>
                </div>
              </div>
            </div>

            {/* Dimensiones */}
            <div className="flex gap-4 flex-wrap">
              <label className="flex flex-col flex-1 min-w-[150px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Diámetro camisa (mm)</p>
                <input
                  type="number"
                  value={diametroCamisa}
                  onChange={(e) => setDiametroCamisa(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col flex-1 min-w-[150px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Diámetro vástago (mm)</p>
                <input
                  type="number"
                  value={diametroVastago}
                  onChange={(e) => setDiametroVastago(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col flex-1 min-w-[150px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Largo carrera (mm)</p>
                <input
                  type="number"
                  value={largoCarrera}
                  onChange={(e) => setLargoCarrera(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>

        {/* Section: Prueba de Presión */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">science</span>
              <h2 className="text-[22px] font-bold leading-tight">Prueba de Presión</h2>
            </div>
            <button
              onClick={() => setActivarPruebaPresion(!activarPruebaPresion)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                activarPruebaPresion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  activarPruebaPresion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {activarPruebaPresion && (
            <div className="space-y-4 mt-4">
              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">info</span>
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    Registra los resultados de las pruebas de presión hidráulica realizadas durante la inspección.
                  </p>
                </div>
              </div>

              {/* Presión de Prueba */}
              <div>
                <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Presión de Prueba</h3>
                <div className="bg-white dark:bg-surface-card rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <label className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-text-muted-dark">Presión (bar)</p>
                    <input
                      type="number"
                      value={presionPrueba}
                      onChange={(e) => setPresionPrueba(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base"
                      placeholder="Ej: 250"
                    />
                  </label>
                </div>
              </div>

              {/* Detección de Fugas */}
              <div>
                <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Detección de Fugas</h3>
                <div className="space-y-3">
                  {/* Fuga Interna */}
                  <button
                    onClick={() => setFugaInterna(!fugaInterna)}
                    className={`w-full bg-white dark:bg-surface-card rounded-xl p-4 border flex items-center justify-between transition-all ${
                      fugaInterna
                        ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[24px] ${fugaInterna ? 'text-red-500' : 'text-slate-400'}`}>
                        {fugaInterna ? 'warning' : 'check_circle'}
                      </span>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-white">Fuga Interna</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pistón o válvula interna</p>
                      </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full transition-all ${
                      fugaInterna ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                        fugaInterna ? 'translate-x-7' : 'translate-x-1'
                      }`} style={{ transform: `translateX(${fugaInterna ? '1.75rem' : '0.25rem'})` }}></div>
                    </div>
                  </button>

                  {/* Fuga Externa */}
                  <button
                    onClick={() => setFugaExterna(!fugaExterna)}
                    className={`w-full bg-white dark:bg-surface-card rounded-xl p-4 border flex items-center justify-between transition-all ${
                      fugaExterna
                        ? 'border-orange-500 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[24px] ${fugaExterna ? 'text-orange-500' : 'text-slate-400'}`}>
                        {fugaExterna ? 'warning' : 'check_circle'}
                      </span>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-white">Fuga Externa</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Vástago o sellos</p>
                      </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full transition-all ${
                      fugaExterna ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                        fugaExterna ? 'translate-x-7' : 'translate-x-1'
                      }`} style={{ transform: `translateX(${fugaExterna ? '1.75rem' : '0.25rem'})` }}></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Evidencia de Fuga Interna */}
              {fugaInterna && (
                <div>
                  <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Evidencia - Fuga Interna</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {fotosFugaInterna.map((foto, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/10 group">
                        <img src={foto} alt={`Fuga Interna ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const nuevasFotos = fotosFugaInterna.filter((_, i) => i !== index)
                            setFotosFugaInterna(nuevasFotos)
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}

                    {fotosFugaInterna.length < 6 && (
                      <button
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.capture = 'environment'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setFotosFugaInterna([...fotosFugaInterna, reader.result as string])
                              }
                              reader.readAsDataURL(file)
                            }
                          }
                          input.click()
                        }}
                        className="aspect-square rounded-xl border-2 border-dashed border-red-300 dark:border-red-600 flex flex-col items-center justify-center gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-red-400 text-[28px]">add_a_photo</span>
                        <span className="text-xs text-red-500 font-medium">Agregar Fuga</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Evidencia de Fuga Externa */}
              {fugaExterna && (
                <div>
                  <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Evidencia - Fuga Externa</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {fotosFugaExterna.map((foto, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10 group">
                        <img src={foto} alt={`Fuga Externa ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const nuevasFotos = fotosFugaExterna.filter((_, i) => i !== index)
                            setFotosFugaExterna(nuevasFotos)
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}

                    {fotosFugaExterna.length < 6 && (
                      <button
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.capture = 'environment'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setFotosFugaExterna([...fotosFugaExterna, reader.result as string])
                              }
                              reader.readAsDataURL(file)
                            }
                          }
                          input.click()
                        }}
                        className="aspect-square rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-600 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-orange-400 text-[28px]">add_a_photo</span>
                        <span className="text-xs text-orange-500 font-medium">Agregar Fuga</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Observaciones</h3>
                <div className="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-slate-700">
                  <textarea
                    value={observacionesPrueba}
                    onChange={(e) => setObservacionesPrueba(e.target.value)}
                    className="w-full bg-transparent border-0 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none"
                    placeholder="Agrega observaciones sobre las pruebas realizadas..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Fallas Detectadas */}
              <div>
                <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Fallas Detectadas</h3>
                <div className="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-slate-700">
                  <textarea
                    value={fallasDetectadas}
                    onChange={(e) => setFallasDetectadas(e.target.value)}
                    className="w-full bg-transparent border-0 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none"
                    placeholder="Describe cualquier falla o anomalía detectada..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Evidencia Fotográfica de Prueba */}
              <div>
                <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Evidencia Fotográfica</h3>
                <div className="grid grid-cols-3 gap-3">
                  {fotosPrueba.map((foto, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const nuevasFotos = fotosPrueba.filter((_, i) => i !== index)
                          setFotosPrueba(nuevasFotos)
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}

                  {fotosPrueba.length < 6 && (
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.capture = 'environment'
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setFotosPrueba([...fotosPrueba, reader.result as string])
                            }
                            reader.readAsDataURL(file)
                          }
                        }
                        input.click()
                      }}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-[28px]">add_a_photo</span>
                      <span className="text-xs text-slate-500 font-medium">Agregar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section: Evidencia Fotográfica */}
        <section>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">add_a_photo</span>
              <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Evidencia Fotográfica</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Foto 1 obligatoria</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Foto Armado */}
            <button
              onClick={() => handleCapturarFoto('armado')}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-border-dark bg-gray-50 dark:bg-surface-dark/30 p-4 transition-all hover:border-primary dark:hover:border-primary hover:bg-primary/5 active:scale-[0.98] h-40"
            >
              {previewArmado ? (
                <>
                  <img
                    src={previewArmado}
                    alt="Foto de armado"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-2">Recapturar</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-text-muted-dark group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Armado</p>
                    <p className="text-xs text-slate-500 dark:text-text-muted-dark mt-1">Estado inicial</p>
                  </div>
                </>
              )}
            </button>

            {/* Foto Despiece */}
            <button
              onClick={() => handleCapturarFoto('despiece')}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-border-dark bg-gray-50 dark:bg-surface-dark/30 p-4 transition-all hover:border-primary dark:hover:border-primary hover:bg-primary/5 active:scale-[0.98] h-40"
            >
              {previewDespiece ? (
                <>
                  <img
                    src={previewDespiece}
                    alt="Foto de despiece"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[24px]">build</span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-2">Recapturar</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-text-muted-dark group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">build</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Despiece</p>
                    <p className="text-xs text-slate-500 dark:text-text-muted-dark mt-1">Componentes</p>
                  </div>
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-xs text-center text-slate-400 dark:text-text-muted-dark/60">
            Las fotos se subirán automáticamente al guardar la orden.
          </p>
        </section>
      </main>

      {/* Fixed Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-border-dark z-50 max-w-md mx-auto">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="flex-1 rounded-xl bg-primary h-14 text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Guardar Recepción
              </>
            )}
          </button>
        </div>
      </div>

      <BottomNavigation />

      {/* Background Pattern Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
    </div>
  )
}

export default RecepcionPage

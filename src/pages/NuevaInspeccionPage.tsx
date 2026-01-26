import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

function NuevaInspeccionPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Crear nueva inspección y redirigir a recepción
    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }, [navigate])

  return null
}

export default NuevaInspeccionPage

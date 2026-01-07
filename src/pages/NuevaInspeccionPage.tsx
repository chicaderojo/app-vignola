import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function NuevaInspeccionPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirigir al dashboard
    navigate('/')
  }, [navigate])

  return null
}

export default NuevaInspeccionPage

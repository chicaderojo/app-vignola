import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import PeritajePDFDocument from '../components/pdf/PeritajePDFDocument'
import { Inspeccion, InspeccionDetalle } from '../types'

interface ComponentePeritaje {
  id: string
  nombre: string
  estado: 'pending' | 'bueno' | 'mantencion' | 'cambio'
  observaciones: string
  fotos: string[]
  expandido: boolean
}

interface InspeccionCompleta {
  inspeccion: Inspeccion
  detalles: InspeccionDetalle[]
}

/**
 * Genera un PDF de peritaje con datos de inspección y componentes
 * NO incluye pruebas hidráulicas (esas se agregan después)
 */
export const generatePeritajePDF = async (
  inspeccionData: InspeccionCompleta,
  componentesUI: ComponentePeritaje[]
): Promise<void> => {
  try {
    // Preparar datos para el PDF
    const pdfData = {
      inspeccion: inspeccionData.inspeccion,
      detalles: inspeccionData.detalles,
      componentes: componentesUI,
      fechaEmision: new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      horaEmision: new Date().toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Crear documento PDF
    const doc = <PeritajePDFDocument data={pdfData} />

    // Generar blob
    const blob = await pdf(doc).toBlob()

    // Guardar archivo
    const cilindro = inspeccionData.inspeccion.cilindro as any
    const codigoCilindro = cilindro?.id_codigo || inspeccionData.inspeccion.cilindro_id
    const filename = `Peritaje_${codigoCilindro}_${Date.now()}.pdf`
    saveAs(blob, filename)

  } catch (error) {
    console.error('Error en generatePeritajePDF:', error)
    throw error
  }
}

/**
 * Genera un PDF completo con peritaje + pruebas hidráulicas
 * (para uso futuro en página de Detalles)
 */
export const generateReporteCompletoPDF = async (
  _inspeccionData: InspeccionCompleta
): Promise<void> => {
  // Implementación futura
  throw new Error('No implementado aún')
}

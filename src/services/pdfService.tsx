import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import PeritajePDFDocument from '../components/pdf/PeritajePDFDocument'
import InformeTecnicoPDFDocument from '../components/pdf/InformeTecnicoPDFDocument'
import PDFCompletoDocument from '../components/pdf/PDFCompletoDocument'
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

/**
 * Genera un Informe Técnico PDF completo con imágenes
 * Incluye fotos de armado/despiece, peritaje de componentes y pruebas hidráulicas
 */
export const generateInformeTecnicoPDF = async (
  inspeccionData: InspeccionCompleta,
  incluirImagenes: boolean = true
): Promise<void> => {
  try {
    // Preparar datos para el PDF
    const pdfData = {
      inspeccion: inspeccionData.inspeccion,
      detalles: inspeccionData.detalles,
      fechaEmision: new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      incluirImagenes
    }

    // Crear documento PDF
    const doc = <InformeTecnicoPDFDocument data={pdfData} />

    // Generar blob con mejor calidad de imagen
    const blob = await pdf(doc).toBlob()

    // Guardar archivo
    const cilindro = inspeccionData.inspeccion.cilindro as any
    const codigoCilindro = cilindro?.id_codigo || inspeccionData.inspeccion.cilindro_id
    const filename = `INFORME_TECNICO_${codigoCilindro}_${Date.now()}.pdf`
    saveAs(blob, filename)

  } catch (error) {
    console.error('Error en generateInformeTecnicoPDF:', error)
    throw error
  }
}

/**
 * Genera un PDF COMPLETO con Inspección (50%) + Mantención (100%)
 * Incluye TODO el flujo completo: recepción, pruebas presión, peritaje, mantención, pruebas mantención
 */
export const generatePDFCompleto = async (
  inspeccionData: InspeccionCompleta,
  mantencionData?: {
    componentes: Array<{
      id: string
      nombre: string
      accion: 'brunido' | 'rectificado' | 'soldadura' | 'cambio_total' | 'ninguna'
      detallesTecnicos: string
      fotoAntes: string | null
      fotoDespues: string | null
    }>
    verificaciones: {
      limpieza: boolean
      lubricacion: boolean
      pruebaPresion: boolean
    }
  },
  pruebaMantencionData?: {
    presion: number
    tiempo: number
    fuga_interna: boolean
    fuga_externa: boolean
    fallas: string
    observaciones: string
    fotos: string[]
  },
  incluirImagenes: boolean = true,
  esReingreso: boolean = false
): Promise<void> => {
  try {
    // Preparar datos para el PDF completo
    const pdfData = {
      inspeccion: inspeccionData.inspeccion,
      detalles: inspeccionData.detalles,
      mantencion: mantencionData,
      pruebaMantencion: pruebaMantencionData,
      fechaEmision: new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      incluirImagenes,
      esReingreso
    }

    // Crear documento PDF completo
    const doc = <PDFCompletoDocument data={pdfData} />

    // Generar blob con mejor calidad de imagen
    const blob = await pdf(doc).toBlob()

    // Guardar archivo con nombre distintivo
    const cilindro = inspeccionData.inspeccion.cilindro as any
    const codigoCilindro = cilindro?.id_codigo || inspeccionData.inspeccion.cilindro_id
    const filename = `INFORME_COMPLETO_${codigoCilindro}_${Date.now()}.pdf`
    saveAs(blob, filename)

  } catch (error) {
    console.error('Error en generatePDFCompleto:', error)
    throw error
  }
}

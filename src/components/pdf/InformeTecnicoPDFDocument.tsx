import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer'
import { Inspeccion } from '../../types'

interface InformePDFData {
  inspeccion: Inspeccion
  detalles: Array<{
    componente: string
    estado: 'Bueno' | 'Cambio' | 'Mantención'
    detalle_tecnico?: string
    observaciones?: string
  }>
  fechaEmision: string
  incluirImagenes: boolean
}

interface Props {
  data: InformePDFData
}

// Estilos del documento
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #1E40AF',
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 15,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'bold',
  },
  metaInfo: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 5,
  },

  // Secciones
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
    borderBottom: '1pt solid #E2E8F0',
    paddingBottom: 5,
    textTransform: 'uppercase',
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#1E293B',
  },

  // Imágenes
  imageSection: {
    marginVertical: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  imageContainer: {
    width: '48%',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderRadius: 5,
  },
  imageCaption: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5,
    color: '#64748B',
    fontStyle: 'italic',
  },

  // Tabla
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1pt solid #E2E8F0',
    alignItems: 'flex-start',
  },
  tableCellNum: {
    width: 30,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tableCellComp: {
    flex: 2,
    paddingRight: 10,
  },
  tableCellStatus: {
    width: 80,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusBueno: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  statusMantencion: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusCambio: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  tableCellObs: {
    flex: 2,
    color: '#64748B',
    fontSize: 9,
  },

  // Pruebas Hidráulicas
  pruebasCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 6,
    borderLeft: '4pt solid #0284C7',
  },
  pruebasText: {
    fontSize: 9,
    color: '#0C4A6E',
    lineHeight: 1.5,
  },

  // Conclusiones
  conclusionBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
  },
  conclusionText: {
    fontSize: 10,
    color: '#1E293B',
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: '1pt solid #E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94A3B8',
  },
})

const InformeTecnicoPDFDocument: React.FC<Props> = ({ data }) => {
  // Parsear información de recepción
  let infoRecepcion: any = null
  if (data.inspeccion.notas_recepcion) {
    try {
      infoRecepcion = JSON.parse(data.inspeccion.notas_recepcion)
    } catch (e) {
      console.warn('No se pudo parsear notas_recepcion:', e)
    }
  }

  const cilindro = data.inspeccion.cilindro as any

  // Obtener nombre del cliente
  const nombreCliente = infoRecepcion?.cliente || data.inspeccion.nombre_cliente || cilindro?.cliente?.nombre || 'No especificado'

  // Mapear estado de orden
  const getEstadoOrden = () => {
    if (data.inspeccion.estado_inspeccion === 'sincronizada' || data.inspeccion.estado_inspeccion === 'completa') {
      return 'Finalizado'
    }
    return 'En Inspección'
  }

  const estadoOrden = getEstadoOrden()

  // Mapear estado de componentes
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'Bueno': return 'BUENO'
      case 'Mantención': return 'MANTENCIÓN'
      case 'Cambio': return 'CAMBIO'
      default: return 'PENDIENTE'
    }
  }

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'Bueno': return styles.statusBueno
      case 'Mantención': return styles.statusMantencion
      case 'Cambio': return styles.statusCambio
      default: return {}
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>VI</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Vignola Industrial</Text>
              <Text style={styles.reportTitle}>INFORME TÉCNICO DE INSPECCIÓN</Text>
              <Text style={styles.metaInfo}>
                Fecha de emisión: {data.fechaEmision}
              </Text>
            </View>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.metaInfo}>Estado de la orden: {estadoOrden}</Text>
            <Text style={styles.metaInfo}>OT: {data.inspeccion.sap_cliente || 'N/A'}</Text>
          </View>
        </View>

        {/* Datos del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{nombreCliente}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>OT SAP:</Text>
              <Text style={styles.value}>{data.inspeccion.sap_cliente || 'N/A'}</Text>
            </View>
            {infoRecepcion?.planta && (
              <View style={styles.infoItem}>
                <Text style={styles.label}>Planta:</Text>
                <Text style={styles.value}>{infoRecepcion.planta}</Text>
              </View>
            )}
            {infoRecepcion?.contacto && (
              <View style={styles.infoItem}>
                <Text style={styles.label}>Contacto:</Text>
                <Text style={styles.value}>{infoRecepcion.contacto}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Datos del Cilindro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cilindro</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Código:</Text>
              <Text style={styles.value}>{cilindro?.id_codigo || data.inspeccion.cilindro_id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{cilindro?.tipo || 'No especificado'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Fabricante:</Text>
              <Text style={styles.value}>{cilindro?.fabricante || 'No especificado'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Diám. Camisa:</Text>
              <Text style={styles.value}>{cilindro?.diametro_camisa || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Diám. Vástago:</Text>
              <Text style={styles.value}>{cilindro?.diametro_vastago || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Carrera:</Text>
              <Text style={styles.value}>{cilindro?.carrera || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* EVIDENCIA FOTOGRÁFICA */}
        {data.incluirImagenes && (data.inspeccion.foto_armado_url || data.inspeccion.foto_despiece_url) && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Evidencia Fotográfica</Text>
            <View style={styles.imageGrid}>
              {data.inspeccion.foto_armado_url && (
                <View style={styles.imageContainer}>
                  <Image style={styles.image} src={data.inspeccion.foto_armado_url} />
                  <Text style={styles.imageCaption}>Foto de Armado</Text>
                </View>
              )}
              {data.inspeccion.foto_despiece_url && (
                <View style={styles.imageContainer}>
                  <Image style={styles.image} src={data.inspeccion.foto_despiece_url} />
                  <Text style={styles.imageCaption}>Foto de Despiece</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Peritaje de Componentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peritaje de Componentes</Text>

          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>#</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Componente</Text>
            <Text style={[styles.tableHeaderText, { width: 80 }]}>Estado</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Observaciones</Text>
          </View>

          {/* Filas de componentes */}
          {data.detalles.map((det, index) => (
            <View key={det.componente} style={styles.tableRow}>
              <Text style={styles.tableCellNum}>{index + 1}</Text>
              <Text style={styles.tableCellComp}>{det.componente}</Text>
              <View style={styles.tableCellStatus}>
                <View style={[styles.statusBadge, getStatusStyle(det.estado)]}>
                  <Text>{getEstadoLabel(det.estado)}</Text>
                </View>
              </View>
              <Text style={styles.tableCellObs}>
                {det.observaciones || det.detalle_tecnico || 'Sin observaciones'}
              </Text>
            </View>
          ))}

          {data.detalles.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ flex: 1, textAlign: 'center', color: '#94A3B8', padding: 20 }}>
                No hay componentes evaluados
              </Text>
            </View>
          )}
        </View>

        {/* Pruebas Hidráulicas si existen */}
        {(data.inspeccion.presion_prueba !== undefined || data.inspeccion.fuga_interna !== undefined || data.inspeccion.fuga_externa !== undefined) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pruebas Hidráulicas</Text>
            <View style={styles.pruebasCard}>
              {data.inspeccion.presion_prueba !== undefined && (
                <Text style={styles.pruebasText}>
                  • Presión de prueba: {data.inspeccion.presion_prueba} bar
                </Text>
              )}
              {data.inspeccion.fuga_interna !== undefined && (
                <Text style={styles.pruebasText}>
                  • Fuga interna: {data.inspeccion.fuga_interna ? 'Detectada' : 'No detectada'}
                </Text>
              )}
              {data.inspeccion.fuga_externa !== undefined && (
                <Text style={styles.pruebasText}>
                  • Fuga externa: {data.inspeccion.fuga_externa ? 'Detectada' : 'No detectada'}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Conclusiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conclusiones y Recomendaciones</Text>
          <View style={styles.conclusionBox}>
            <Text style={styles.conclusionText}>
              Estado final de la orden: {estadoOrden}
            </Text>
            {data.detalles.filter(d => d.estado === 'Cambio').length > 0 && (
              <Text style={styles.conclusionText}>
                • Se detectaron {data.detalles.filter(d => d.estado === 'Cambio').length} componente(s) que requieren cambio.
              </Text>
            )}
            {data.detalles.filter(d => d.estado === 'Mantención').length > 0 && (
              <Text style={styles.conclusionText}>
                • Se detectaron {data.detalles.filter(d => d.estado === 'Mantención').length} componente(s) que requieren mantención.
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Vignola Industrial - Servicio Técnico Hidráulico</Text>
          <Text>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  )
}

export default InformeTecnicoPDFDocument

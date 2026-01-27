import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from '@react-pdf/renderer'
import { Inspeccion } from '../../types'

interface PDFData {
  inspeccion: Inspeccion
  detalles: Array<{
    componente: string
    estado: 'Bueno' | 'Cambio' | 'Mantención'
    detalle_tecnico?: string
    observaciones?: string
  }>
  componentes: Array<{
    nombre: string
    estado: 'pending' | 'bueno' | 'mantencion' | 'cambio'
    observaciones: string
    fotos: string[]
  }>
  fechaEmision: string
  horaEmision: string
}

interface Props {
  data: PDFData
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
  dateInfo: {
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

  // Info Cards
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: '35%',
    fontWeight: 'bold',
    color: '#475569',
  },
  infoValue: {
    flex: 1,
    color: '#1E293B',
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

  // Observaciones
  observacionesBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    borderLeft: '4pt solid #F59E0B',
  },
  observacionesText: {
    fontSize: 9,
    color: '#78350F',
    lineHeight: 1.5,
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

const PeritajePDFDocument: React.FC<Props> = ({ data }) => {
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

  // Filtrar componentes evaluados (no pending)
  const componentesEvaluados = data.componentes.filter(c => c.estado !== 'pending')

  // Mapear estado de UI a estado de BD
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'bueno': return 'BUENO'
      case 'mantencion': return 'MANTENCIÓN'
      case 'cambio': return 'CAMBIO'
      default: return 'PENDIENTE'
    }
  }

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'bueno': return styles.statusBueno
      case 'mantencion': return styles.statusMantencion
      case 'cambio': return styles.statusCambio
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
              <Text style={styles.reportTitle}>REPORTE DE PERITAJE</Text>
              <Text style={styles.dateInfo}>
                Fecha: {data.fechaEmision}   Hora: {data.horaEmision}
              </Text>
            </View>
          </View>
        </View>

        {/* Datos del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>
                {infoRecepcion?.cliente || cilindro?.cliente?.nombre || 'No especificado'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Planta:</Text>
              <Text style={styles.infoValue}>
                {infoRecepcion?.planta || 'No especificado'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contacto:</Text>
              <Text style={styles.infoValue}>
                {infoRecepcion?.contacto || 'No especificado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Datos del Cilindro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cilindro</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Código:</Text>
              <Text style={styles.infoValue}>
                {cilindro?.id_codigo || data.inspeccion.cilindro_id}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>
                {cilindro?.tipo || 'No especificado'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fabricante:</Text>
              <Text style={styles.infoValue}>
                {cilindro?.fabricante || 'No especificado'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diám. Camisa:</Text>
              <Text style={styles.infoValue}>
                {cilindro?.diametro_camisa || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diám. Vástago:</Text>
              <Text style={styles.infoValue}>
                {cilindro?.diametro_vastago || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Carrera:</Text>
              <Text style={styles.infoValue}>
                {cilindro?.carrera || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Orden de Trabajo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orden de Trabajo</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SAP Cliente:</Text>
              <Text style={styles.infoValue}>
                {data.inspeccion.sap_cliente || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>OT Inspección:</Text>
              <Text style={styles.infoValue}>
                #{data.inspeccion.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

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
          {componentesEvaluados.map((comp, index) => (
            <View key={comp.nombre} style={styles.tableRow}>
              <Text style={styles.tableCellNum}>{index + 1}</Text>
              <Text style={styles.tableCellComp}>{comp.nombre}</Text>
              <View style={styles.tableCellStatus}>
                <View style={[styles.statusBadge, getStatusStyle(comp.estado)]}>
                  <Text>{getEstadoLabel(comp.estado)}</Text>
                </View>
              </View>
              <Text style={styles.tableCellObs}>
                {comp.observaciones || 'Sin observaciones'}
              </Text>
            </View>
          ))}

          {componentesEvaluados.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={{ flex: 1, textAlign: 'center', color: '#94A3B8', padding: 20 }}>
                No hay componentes evaluados
              </Text>
            </View>
          )}
        </View>

        {/* Observaciones Generales */}
        {infoRecepcion?.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones Generales</Text>
            <View style={styles.observacionesBox}>
              <Text style={styles.observacionesText}>
                {infoRecepcion.observaciones}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Vignola Industrial - Servicio Técnico Hidráulico</Text>
          <Text>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PeritajePDFDocument

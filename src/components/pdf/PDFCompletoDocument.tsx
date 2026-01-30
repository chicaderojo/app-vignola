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

interface ComponenteMantencion {
  id: string
  nombre: string
  accion: 'brunido' | 'rectificado' | 'soldadura' | 'cambio_total' | 'ninguna'
  detallesTecnicos: string
  fotoAntes: string | null
  fotoDespues: string | null
}

interface PruebaMantencion {
  presion: number
  tiempo: number
  fuga_interna: boolean
  fuga_externa: boolean
  fallas: string
  observaciones: string
  fotos: string[]
}

interface PDFCompletoData {
  inspeccion: Inspeccion
  detalles: Array<{
    componente: string
    estado: 'Bueno' | 'Cambio' | 'Mantención'
    detalle_tecnico?: string
    observaciones?: string
    fotos_urls?: string[]
  }>
  mantencion?: {
    componentes: ComponenteMantencion[]
    verificaciones: {
      limpieza: boolean
      lubricacion: boolean
      pruebaPresion: boolean
    }
  }
  pruebaMantencion?: PruebaMantencion
  fechaEmision: string
  incluirImagenes: boolean
  esReingreso?: boolean
}

interface Props {
  data: PDFCompletoData
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

  // Sección Mantención (verde)
  sectionTitleMantencion: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 10,
    borderBottom: '1pt solid #166534',
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

  // Fotos ANTES/DESPUÉS
  fotoAntesDespuesGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  fotoAntesDespuesContainer: {
    flex: 1,
  },
  fotoAntesDespuesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 5,
    textAlign: 'center',
  },
  fotoAntesDespuesImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    borderRadius: 4,
    border: '1pt solid #E2E8F0',
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

  // Tabla Mantención (verde)
  tableHeaderMantencion: {
    flexDirection: 'row',
    backgroundColor: '#166534',
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderTextMantencion: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },

  // Acción Badge
  accionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
  },
  accionBrunido: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  accionRectificado: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
  },
  accionSoldadura: {
    backgroundColor: '#FED7AA',
    color: '#9A3412',
  },
  accionCambioTotal: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  accionNinguna: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },

  // Pruebas
  pruebasCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 6,
    borderLeft: '4pt solid #0284C7',
    marginBottom: 10,
  },
  pruebasCardMantencion: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 6,
    borderLeft: '4pt solid #166534',
  },
  pruebasText: {
    fontSize: 9,
    color: '#0C4A6E',
    lineHeight: 1.5,
  },
  pruebasTextMantencion: {
    fontSize: 9,
    color: '#14532D',
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
    marginBottom: 5,
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

const PDFCompletoDocument: React.FC<Props> = ({ data }) => {
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

  // Estado final
  const esCompleto = data.mantencion && data.pruebaMantencion
  const estadoOrden = esCompleto ? 'COMPLETADO (100%)' : 'En Progreso'

  // Mapear estado de componentes (peritaje)
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

  // Mapear acción de mantención
  const getAccionLabel = (accion: string) => {
    switch (accion) {
      case 'brunido': return 'BRUÑIDO'
      case 'rectificado': return 'RECTIFICADO'
      case 'soldadura': return 'SOLDADURA'
      case 'cambio_total': return 'CAMBIO TOTAL'
      default: return 'SIN ACCIÓN'
    }
  }

  const getAccionStyle = (accion: string) => {
    switch (accion) {
      case 'brunido': return styles.accionBrunido
      case 'rectificado': return styles.accionRectificado
      case 'soldadura': return styles.accionSoldadura
      case 'cambio_total': return styles.accionCambioTotal
      default: return styles.accionNinguna
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
              <Text style={styles.reportTitle}>INFORME COMPLETO: INSPECCIÓN + MANTENCIÓN</Text>
              <Text style={styles.metaInfo}>
                Fecha de emisión: {data.fechaEmision}
              </Text>
            </View>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.metaInfo}>Estado final: {estadoOrden}</Text>
            <Text style={styles.metaInfo}>OT: {data.inspeccion.sap_cliente || 'N/A'}</Text>
          </View>
        </View>

        {/* =============================================
            PARTE 1: RECEPCIÓN (50%)
            ============================================= */}

        {/* Datos del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I. Recepción - Datos del Cliente</Text>
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
          <Text style={styles.sectionTitle}>II. Recepción - Datos del Cilindro</Text>
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

        {/* Evidencia Fotográfica - Armado/Despiece */}
        {data.incluirImagenes && (data.inspeccion.foto_armado_url || data.inspeccion.foto_despiece_url) && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>III. Evidencia Fotográfica - Recepción</Text>
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

        {/* Pruebas de Presión (INSPECCIÓN) */}
        {(data.inspeccion.presion_prueba !== undefined || data.inspeccion.fuga_interna !== undefined) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>IV. Pruebas de Presión (Inspección)</Text>
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

        {/* Peritaje de Componentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>V. Peritaje de Componentes (Inspección)</Text>

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

        {/* Evidencia Fotográfica de Componentes (Peritaje) */}
        {data.detalles.some((det: any) => det.fotos_urls && det.fotos_urls.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VI. Evidencia Fotográfica - Peritaje</Text>

            {data.detalles.map((det: any) => {
              const fotosUrls = det.fotos_urls || []
              if (fotosUrls.length === 0) return null

              return (
                <View key={det.componente} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 }}>
                    {det.componente} - {getEstadoLabel(det.estado)}
                  </Text>
                  <View style={styles.imageGrid}>
                    {fotosUrls.map((url: string, idx: number) => (
                      <View key={idx} style={styles.imageContainer}>
                        <Image style={styles.image} src={url} />
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* =============================================
            PARTE 2: MANTENCIÓN (50% restante)
            ============================================= */}

        {data.mantencion && (
          <>
            {/* Registro de Mantención */}
            <View style={styles.section} break>
              <Text style={styles.sectionTitleMantencion}>VII. Registro de Mantención (50% restante)</Text>

              {/* Tabla de acciones de mantención */}
              <View style={styles.tableHeaderMantencion}>
                <Text style={styles.tableHeaderTextMantencion}>#</Text>
                <Text style={[styles.tableHeaderTextMantencion, { flex: 2 }]}>Componente</Text>
                <Text style={[styles.tableHeaderTextMantencion, { width: 90 }]}>Acción</Text>
                <Text style={[styles.tableHeaderTextMantencion, { flex: 2 }]}>Detalles Técnicos</Text>
              </View>

              {data.mantencion.componentes
                .filter(c => c.accion !== 'ninguna')
                .map((comp, index) => (
                  <View key={comp.id} style={styles.tableRow}>
                    <Text style={styles.tableCellNum}>{index + 1}</Text>
                    <Text style={styles.tableCellComp}>{comp.nombre}</Text>
                    <View style={styles.tableCellStatus}>
                      <View style={[styles.accionBadge, getAccionStyle(comp.accion)]}>
                        <Text>{getAccionLabel(comp.accion)}</Text>
                      </View>
                    </View>
                    <Text style={styles.tableCellObs}>
                      {comp.detallesTecnicos || 'Sin detalles'}
                    </Text>
                  </View>
                ))}

              {data.mantencion.componentes.filter(c => c.accion !== 'ninguna').length === 0 && (
                <View style={styles.tableRow}>
                  <Text style={{ flex: 1, textAlign: 'center', color: '#94A3B8', padding: 20 }}>
                    No se registraron acciones de mantención
                  </Text>
                </View>
              )}
            </View>

            {/* Verificaciones Rápidas */}
            {data.mantencion.verificaciones && (
              <View style={styles.section}>
                <Text style={styles.sectionTitleMantencion}>VIII. Verificaciones de Mantención</Text>
                <View style={styles.pruebasCardMantencion}>
                  <Text style={styles.pruebasTextMantencion}>
                    • Limpieza: {data.mantencion.verificaciones.limpieza ? '✓ OK' : 'Pendiente'}
                  </Text>
                  <Text style={styles.pruebasTextMantencion}>
                    • Lubricación: {data.mantencion.verificaciones.lubricacion ? '✓ OK' : 'Pendiente'}
                  </Text>
                  <Text style={styles.pruebasTextMantencion}>
                    • Prueba de Presión: {data.mantencion.verificaciones.pruebaPresion ? '✓ OK' : 'Pendiente'}
                  </Text>
                </View>
              </View>
            )}

            {/* Fotos ANTES/DESPUÉS de Mantención */}
            {data.incluirImagenes && data.mantencion.componentes.some(c => c.fotoAntes || c.fotoDespues) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitleMantencion}>IX. Evidencia Fotográfica - Mantención</Text>

                {data.mantencion.componentes
                  .filter(c => c.accion !== 'ninguna' && (c.fotoAntes || c.fotoDespues))
                  .map((comp) => (
                    <View key={comp.id} style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>
                        {comp.nombre} - {getAccionLabel(comp.accion)}
                      </Text>

                      <View style={styles.fotoAntesDespuesGrid}>
                        {/* Foto ANTES */}
                        {comp.fotoAntes && (
                          <View style={styles.fotoAntesDespuesContainer}>
                            <Text style={styles.fotoAntesDespuesLabel}>ANTES</Text>
                            <Image style={styles.fotoAntesDespuesImage} src={comp.fotoAntes} />
                          </View>
                        )}

                        {/* Foto DESPUÉS */}
                        {comp.fotoDespues && (
                          <View style={styles.fotoAntesDespuesContainer}>
                            <Text style={styles.fotoAntesDespuesLabel}>DESPUÉS</Text>
                            <Image style={styles.fotoAntesDespuesImage} src={comp.fotoDespues} />
                          </View>
                        )}
                      </View>

                      {comp.detallesTecnicos && (
                        <Text style={{ fontSize: 8, color: '#64748B', fontStyle: 'italic', marginTop: 5 }}>
                          {comp.detallesTecnicos}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            )}
          </>
        )}

        {/* Pruebas de Mantención */}
        {data.pruebaMantencion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleMantencion}>X. Pruebas Finales de Mantención</Text>
            <View style={styles.pruebasCardMantencion}>
              <Text style={styles.pruebasTextMantencion}>
                • Presión de prueba: {data.pruebaMantencion.presion} bar
              </Text>
              <Text style={styles.pruebasTextMantencion}>
                • Tiempo de prueba: {data.pruebaMantencion.tiempo} minutos
              </Text>
              <Text style={styles.pruebasTextMantencion}>
                • Fuga interna: {data.pruebaMantencion.fuga_interna ? 'Detectada' : 'No detectada'}
              </Text>
              <Text style={styles.pruebasTextMantencion}>
                • Fuga externa: {data.pruebaMantencion.fuga_externa ? 'Detectada' : 'No detectada'}
              </Text>
              {data.pruebaMantencion.fallas && (
                <Text style={styles.pruebasTextMantencion}>
                  • Fallas detectadas: {data.pruebaMantencion.fallas || 'Ninguna'}
                </Text>
              )}
              {data.pruebaMantencion.observaciones && (
                <Text style={styles.pruebasTextMantencion}>
                  • Observaciones: {data.pruebaMantencion.observaciones}
                </Text>
              )}
            </View>

            {/* Fotos de pruebas de mantención */}
            {data.incluirImagenes && data.pruebaMantencion.fotos && data.pruebaMantencion.fotos.length > 0 && (
              <View style={styles.imageGrid}>
                {data.pruebaMantencion.fotos.map((url, idx) => (
                  <View key={idx} style={styles.imageContainer}>
                    <Image style={styles.image} src={url} />
                    <Text style={styles.imageCaption}>Foto prueba {idx + 1}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Conclusiones Finales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>XI. Conclusiones Finales</Text>
          <View style={styles.conclusionBox}>
            <Text style={styles.conclusionText}>
              Estado final del cilindro: {estadoOrden}
            </Text>

            {data.detalles.filter(d => d.estado === 'Cambio').length > 0 && (
              <Text style={styles.conclusionText}>
                • Inspección: Se detectaron {data.detalles.filter(d => d.estado === 'Cambio').length} componente(s) que requieren cambio.
              </Text>
            )}

            {data.detalles.filter(d => d.estado === 'Mantención').length > 0 && (
              <Text style={styles.conclusionText}>
                • Inspección: Se detectaron {data.detalles.filter(d => d.estado === 'Mantención').length} componente(s) que requieren mantención.
              </Text>
            )}

            {data.mantencion && data.mantencion.componentes.filter(c => c.accion !== 'ninguna').length > 0 && (
              <Text style={styles.conclusionText}>
                • Mantención: Se realizaron {data.mantencion.componentes.filter(c => c.accion !== 'ninguna').length} acción(es) de reparación.
              </Text>
            )}

            {data.pruebaMantencion && !data.pruebaMantencion.fuga_interna && !data.pruebaMantencion.fuga_externa && (
              <Text style={styles.conclusionText}>
                ✓ Pruebas finales: Aprobadas sin fugas detectadas.
              </Text>
            )}

            {esCompleto && (
              <Text style={[styles.conclusionText, { fontWeight: 'bold', color: '#166534', marginTop: 8 }]}>
                ✅ EL CILINDRO HA COMPLETADO EL PROCESO DE INSPECCIÓN Y MANTENCIÓN AL 100%.
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Vignola Industrial - Servicio Técnico Hidráulico</Text>
          <Text>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  )
}

export default PDFCompletoDocument

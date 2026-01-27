import { Inspeccion, InspeccionDetalle } from '../types'

interface InfoRecepcion {
  cliente: string
  planta: string
  contacto: string
  prioridad: string
}

interface ReporteData {
  inspeccion: Inspeccion
  detalles: InspeccionDetalle[]
  infoRecepcion?: InfoRecepcion
}

/**
 * Servicio para generar informes técnicos de inspección de cilindros hidráulicos
 * siguiendo el estándar industrial de Vignola Maestranza Concepción
 */
export const reportGenerator = {
  /**
   * Genera el contenido markdown completo del informe técnico
   */
  generarInformeMarkdown(data: ReporteData): string {
    const { inspeccion, detalles, infoRecepcion } = data
    const cilindro = inspeccion.cilindro
    const usuario = inspeccion.usuario

    // Parsear información de recepción si existe
    let recepcion: InfoRecepcion | null = null
    if (inspeccion.notas_recepcion) {
      try {
        recepcion = JSON.parse(inspeccion.notas_recepcion)
      } catch (e) {
        console.warn('No se pudo parsear notas_recepcion:', e)
      }
    }

    const fechaEmision = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    const fechaInspeccion = new Date(inspeccion.created_at).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // ===== ENCABEZADO =====
    let markdown = `# INFORME DE INSPECCIÓN TÉCNICA\n\n`
    markdown += `## CILINDRO HIDRÁULICO - ${cilindro?.id_codigo || inspeccion.cilindro_id}\n\n`
    markdown += `**Vignola Maestranza Concepción**\n`
    markdown += `Especialistas en Hidráulica Industrial\n\n`
    markdown += `---\n\n`

    // ===== DATOS DEL CLIENTE =====
    markdown += `### 1. DATOS DEL CLIENTE Y SOLICITUD\n\n`
    markdown += `| **Cliente** | ${recepcion?.cliente || cilindro?.cliente?.nombre || 'N/A'} |\n`
    markdown += `| **Planta/Ubicación** | ${recepcion?.planta || 'N/A'} |\n`
    markdown += `| **Contacto** | ${recepcion?.contacto || 'N/A'} |\n`
    markdown += `| **Orden de Trabajo** | ${inspeccion.sap_cliente} |\n`
    markdown += `| **Prioridad** | ${recepcion?.prioridad || 'Normal'} |\n`
    markdown += `| **Fecha Emisión** | ${fechaEmision} |\n\n`

    // ===== OBJETIVO Y ALCANCE =====
    markdown += `### 2. OBJETIVO Y ALCANCE\n\n`
    markdown += `El presente informe tiene por objetivo registrar los resultados de la inspección técnica `
    markdown += `realizada al cilindro hidráulico identificado precedentemente, de acuerdo a lo establecido `
    markdown += `en la norma **ISO 6020/2** para cilindros hidráulicos de montaje por tornillos.\n\n`
    markdown += `El peritaje incluye:\n`
    markdown += `- Inspección visual dimensional de componentes\n`
    markdown += `- Verificación de estado superficial y desgaste\n`
    markdown += `- Evaluación de elementos de estanqueidad (sellos y retenes)\n`
    markdown += `${inspeccion.presion_prueba > 0 ? '- Prueba hidrostática de estanqueidad a presión de prueba' : '- Análisis de reparabilidad'}\n\n`

    // ===== DESCRIPCIÓN GENERAL DEL CILINDRO =====
    markdown += `### 3. DESCRIPCIÓN GENERAL DEL EQUIPO\n\n`
    markdown += `| **Parámetro** | **Valor** | **Unidad** |\n`
    markdown += `|:-------------|:---------|:-----------|\n`
    markdown += `| **Código Identificación** | ${cilindro?.id_codigo || inspeccion.cilindro_id} | - |\n`
    markdown += `| **Tipo de Cilindro** | ${cilindro?.tipo || 'No especificado'} | - |\n`
    markdown += `| **Fabricante** | ${cilindro?.fabricante || 'Parker'} | - |\n`
    markdown += `| **Diámetro Camisa ($\\phi D$)** | ${cilindro?.diametro_camisa || 'N/A'} | mm |\n`
    markdown += `| **Diámetro Vástago ($\\phi d$)** | ${cilindro?.diametro_vastago || 'N/A'} | mm |\n`
    markdown += `| **Carrera ($L$)** | ${cilindro?.carrera || 'N/A'} | mm |\n`
    markdown += `| **Área Pistón ($A_p$)** | ${cilindro?.diametro_camisa ? Math.round(Math.PI * Math.pow(parseFloat(cilindro.diametro_camisa) / 2, 2)) : 'N/A'} | cm² |\n`
    markdown += `| **Área Vástago ($A_v$)** | ${cilindro?.diametro_vastago ? Math.round(Math.PI * Math.pow(parseFloat(cilindro.diametro_vastago) / 2, 2)) : 'N/A'} | cm² |\n\n`

    // ===== RESUMEN DE INSPECCIÓN =====
    markdown += `### 4. RESUMEN DE INSPECCIÓN DE COMPONENTES\n\n`
    markdown += `| **Componente** | **Estado** | **Detalle Técnico** | **Acción Propuesta** |\n`
    markdown += `|:-------------|:----------|:-------------------|:---------------------|\n`

    const componentesConEstado = detalles.filter(d => d.estado !== 'Bueno')

    if (componentesConEstado.length === 0) {
      markdown += `| *Todos los componentes* | *Buen estado* | *Sin observaciones* | *Mantención preventiva* |\n\n`
    } else {
      componentesConEstado.forEach(det => {
        const estadoIcon = det.estado === 'Cambio' ? '❌' : det.estado === 'Mantención' ? '⚠️' : '✅'
        markdown += `| ${det.componente} | ${estadoIcon} **${det.estado}** | ${det.detalle_tecnico || '-'} | ${det.accion_propuesta || '-'} |\n`
      })
      markdown += `\n`
    }

    // ===== PLAN DE RECUPERACIÓN =====
    markdown += `### 5. PLAN DE RECUPERACIÓN Y REPARACIÓN\n\n`

    const componentesCambio = detalles.filter(d => d.estado === 'Cambio')
    const componentesMantencion = detalles.filter(d => d.estado === 'Mantención')

    if (componentesCambio.length > 0) {
      markdown += `#### 5.1 Componentes a Cambiar\n\n`
      componentesCambio.forEach(det => {
        markdown += `**${det.componente}**: ${det.detalle_tecnico || 'Falla detectada'}\n`
        markdown += `- Acción: ${det.accion_propuesta || 'Fabricar/Cambiar'}\n\n`
      })
    }

    if (componentesMantencion.length > 0) {
      markdown += `#### 5.2 Componentes para Mantención\n\n`
      componentesMantencion.forEach(det => {
        markdown += `**${det.componente}**: ${det.detalle_tecnico || 'Desgaste detectado'}\n`
        markdown += `- Acción: ${det.accion_propuesta || 'Proceso de recuperación'}\n\n`
      })
    }

    if (componentesCambio.length === 0 && componentesMantencion.length === 0) {
      markdown += `El equipo se encuentra en buen estado operativo. Se recomienda mantención preventiva.\n\n`
    }

    // ===== REGISTRO DETALLADO DE HALLAZGOS =====
    markdown += `### 6. REGISTRO DETALLADO DE HALLAZGOS\n\n`

    // Buscar componentes específicos comunes
    const vastago = detalles.find(d => d.componente.toLowerCase().includes('vastago'))
    const camisa = detalles.find(d => d.componente.toLowerCase().includes('camisa'))
    const piston = detalles.find(d => d.componente.toLowerCase().includes('piston'))
    const sellos = detalles.find(d => d.componente.toLowerCase().includes('sello'))
    const tapas = detalles.find(d => d.componente.toLowerCase().includes('tapa'))

    if (vastago) {
      markdown += `#### 6.1 Vástago\n\n`
      markdown += `**Estado**: ${vastago.estado}\n`
      markdown += `**Hallazgo**: ${vastago.detalle_tecnico || 'Sin anomalías significativas'}\n`
      if (vastago.accion_propuesta) {
        markdown += `**Trabajo recomendado**: ${vastago.accion_propuesta}\n`
      }
      markdown += `\n`
    }

    if (camisa) {
      markdown += `#### 6.2 Camisa (Carcasa)\n\n`
      markdown += `**Estado**: ${camisa.estado}\n`
      markdown += `**Hallazgo**: ${camisa.detalle_tecnico || 'Superficie interior en condiciones normales'}\n`
      if (camisa.accion_propuesta) {
        markdown += `**Trabajo recomendado**: ${camisa.accion_propuesta}\n`
      }
      markdown += `\n`
    }

    if (piston) {
      markdown += `#### 6.3 Pistón\n\n`
      markdown += `**Estado**: ${piston.estado}\n`
      markdown += `**Hallazgo**: ${piston.detalle_tecnico || 'Elemento sin anomalías'}\n`
      if (piston.accion_propuesta) {
        markdown += `**Trabajo recomendado**: ${piston.accion_propuesta}\n`
      }
      markdown += `\n`
    }

    if (sellos) {
      markdown += `#### 6.4 Sistema de Estanqueidad (Sellos y Retenes)\n\n`
      markdown += `**Estado**: ${sellos.estado}\n`
      markdown += `**Hallazgo**: ${sellos.detalle_tecnico || 'Elementos de sello en estado compatible con servicio'}\n`
      if (sellos.accion_propuesta) {
        markdown += `**Trabajo recomendado**: ${sellos.accion_propuesta}\n`
      }
      markdown += `\n`
    }

    if (tapas) {
      markdown += `#### 6.5 Tapas y Elementos de Sujeción\n\n`
      markdown += `**Estado**: ${tapas.estado}\n`
      markdown += `**Hallazgo**: ${tapas.detalle_tecnico || 'Rosca y elementos de fijación en buen estado'}\n`
      if (tapas.accion_propuesta) {
        markdown += `**Trabajo recomendado**: ${tapas.accion_propuesta}\n`
      }
      markdown += `\n`
    }

    // Componentes adicionales
    const otrosComponentes = detalles.filter(d =>
      !vastago?.componente.toLowerCase().includes(d.componente.toLowerCase()) &&
      !camisa?.componente.toLowerCase().includes(d.componente.toLowerCase()) &&
      !piston?.componente.toLowerCase().includes(d.componente.toLowerCase()) &&
      !sellos?.componente.toLowerCase().includes(d.componente.toLowerCase()) &&
      !tapas?.componente.toLowerCase().includes(d.componente.toLowerCase())
    )

    if (otrosComponentes.length > 0) {
      markdown += `#### 6.6 Otros Componentes\n\n`
      otrosComponentes.forEach(det => {
        markdown += `**${det.componente}**: ${det.estado} - ${det.detalle_tecnico || '-'}\n`
        if (det.accion_propuesta) {
          markdown += `- ${det.accion_propuesta}\n`
        }
        markdown += `\n`
      })
    }

    // ===== PRUEBAS HIDRÁULICAS =====
    if (inspeccion.presion_prueba > 0) {
      markdown += `### 7. PRUEBAS HIDRÁULICAS\n\n`
      markdown += `#### 7.1 Condiciones de Ensayo\n\n`
      markdown += `| **Parámetro** | **Valor** |\n`
      markdown += `|:-------------|:---------|\n`
      markdown += `| **Presión de Prueba** | ${inspeccion.presion_prueba} bar |\n`
      markdown += `| **Norma de Referencia** | ISO 6020/2 |\n`
      markdown += `| **Temperatura de Ensayo** | Ambiente (20°C ± 5°C) |\n`
      markdown += `| **Fluido Utilizado** | Aceite hidráulico ISO VG 46/68 |\n\n`

      markdown += `#### 7.2 Resultados de Estanqueidad\n\n`
      markdown += `| **Ensayo** | **Resultado** | **Observaciones** |\n`
      markdown += `|:-----------|:--------------|:----------------|\n`
      markdown += `| **Fuga Interna** | ${inspeccion.fuga_interna ? '❌ DETECTADA' : '✅ NO DETECTADA'} | ${inspeccion.fuga_interna ? 'Se requiere reparación de sistema de sellado' : 'Pistón y camisa en buen estado'} |\n`
      markdown += `| **Fuga Externa** | ${inspeccion.fuga_externa ? '❌ DETECTADA' : '✅ NO DETECTADA'} | ${inspeccion.fuga_externa ? 'Revisar retenes de vástago y conexiones' : 'Sistema de estanqueidad exterior correcto'} |\n\n`
    }

    // ===== CONCLUSIONES Y RECOMENDACIONES =====
    markdown += `### 8. CONCLUSIONES Y RECOMENDACIONES\n\n`

    const componentesMal = detalles.filter(d => d.estado === 'Cambio').length
    const componentesMantencion = detalles.filter(d => d.estado === 'Mantención').length

    if (componentesMal === 0 && componentesMantencion === 0) {
      markdown += `#### 8.1 Estado del Equipo\n\n`
      markdown += `El cilindro inspeccionado se encuentra en **buen estado de conservación**, `
      markdown += `siendo apto para continuar en servicio previa limpieza general y cambio de kit de sellos.\n\n`
    } else if (componentesMal > 0) {
      markdown += `#### 8.1 Estado del Equipo\n\n`
      markdown += `El cilindro presenta **fallas críticas** que impiden su operación segura. `
      markdown += `Se requiere reparación mayor con cambio de componentes criticados.\n\n`
    } else {
      markdown += `#### 8.1 Estado del Equipo\n\n`
      markdown += `El cilindro presenta **desgaste moderado** en componentes específicos. `
      markdown += `Se recomienda realizar mantención correctiva para recuperar condiciones operativas óptimas.\n\n`
    }

    markdown += `#### 8.2 Recomendaciones Técnicas\n\n`
    markdown += `1. Utilizar repuestos originales o certificados por fabricante\n`
    markdown += `2. Seguir especificaciones de torque para apriete de tornillos\n`
    markdown += `3. Reemplazar sellos por nuevos en cada desmontaje\n`
    markdown += `4. Verificar limpieza de fluido hidráulico antes del montaje\n`
    markdown += `5. Realizar prueba de funcionamiento a presión reducida antes de puesto en marcha\n\n`

    // ===== FIRMAS Y RESPONSABLES =====
    markdown += `### 9. RESPONSABLES DE INSPECCIÓN\n\n`
    markdown += `| **Rol** | **Nombre** | **Firma** |\n`
    markdown += `|:--------|:-----------|:----------|\n`
    markdown += `| **Inspector Técnico** | ${usuario?.nombre || 'N/A'} | ________________ |\n`
    markdown += `| **Fecha Inspección** | ${fechaInspeccion} | |\n`
    markdown += `| **Aprobación Jefe Taller** | | ________________ |\n\n`

    // ===== PIE DE PÁGINA =====
    markdown += `---\n\n`
    markdown += `**Vignola Maestranza Concepción**\n`
    markdown += `Especialistas en Mantención y Reparación de Cilindros Hidráulicos\n`
    markdown += `*Documento generado digitalmente el ${fechaEmision}*\n\n`
    markdown += `> Este informe tiene carácter de declaración técnica y es válido solo para el equipo identificado. `
    markdown += `Cualquier reproducción o uso no autorizado está prohibido.\n`

    return markdown
  },

  /**
   * Genera un resumen ejecutivo para vista previa
   */
  generarResumen(data: ReporteData): string {
    const { inspeccion, detalles } = data
    const cilindro = inspeccion.cilindro

    const componentesCambio = detalles.filter(d => d.estado === 'Cambio').length
    const componentesMantencion = detalles.filter(d => d.estado === 'Mantención').length
    const componentesBuenos = detalles.filter(d => d.estado === 'Bueno').length

    let resumen = `**INFORME DE INSPECCIÓN #${inspeccion.id.slice(0, 8).toUpperCase()}\n\n`
    resumen += `Cilindro: ${cilindro?.id_codigo || inspeccion.cilindro_id}\n`
    resumen += `Tipo: ${cilindro?.tipo || 'N/A'}\n`
    resumen += `Orden de Trabajo: ${inspeccion.sap_cliente}\n\n`
    resumen += `**RESUMEN DE ESTADOS:**\n`
    resumen += `✅ Buenos: ${componentesBuenos}\n`
    resumen += `⚠️ Mantención: ${componentesMantencion}\n`
    resumen += `❌ Cambio: ${componentesCambio}\n\n`

    if (inspeccion.presion_prueba > 0) {
      resumen += `**PRUEBAS HIDRÁULICAS:**\n`
      resumen += `Presión: ${inspeccion.presion_prueba} bar\n`
      resumen += `Fuga Interna: ${inspeccion.fuga_interna ? 'Detectada' : 'No detectada'}\n`
      resumen += `Fuga Externa: ${inspeccion.fuga_externa ? 'Detectada' : 'No detectada'}\n`
    }

    return resumen
  },

  /**
   * Exporta el informe como texto plano para procesamiento posterior
   */
  exportarComoTexto(data: ReporteData): string {
    return this.generarInformeMarkdown(data)
  }
}

export default reportGenerator

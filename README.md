# Remix of Campo a Mesa

hola lovable necesito que me ayudes a creear una app te comparto este contexto para que me ayudes a crear esta app que vivira en la appstore, nesesito que el diseno se sienta super lindo agroecologico, familiar que genere cultura y apege a lo emocional y la importancia de los agricultores 

Solución Digital para la Trazabilidad de Cadenas Cortas Agroecológicas

Mecanismo de transparencia, gestión de merma y articulación de actores en Monterrey, México

1. Visión del producto

Este producto digital conecta a tres actores de la cadena agroecológica corta — Productor, Distribuidor y Consumidor — con el propósito de reducir la merma alimentaria, mejorar el control logístico y construir confianza entre quien produce y quien consume.

La guiding policy que rige toda decisión de diseño es:

"Toda decisión de diseño debe reducir la distancia percibida entre el campo y la mesa."

Esto significa que la interfaz nunca debe sentirse como e-commerce genérico. El productor tiene cara, nombre y práctica — no es un SKU. La logística es visible, no un cuarto oscuro. Y la transparencia va antes que la transacción.

Fuente: Humble, J. (2023). What is UX Strategy. The Fountain Institute. El framework Goals → Strategy → Tactics define que la estrategia no es un plan, sino un marco de toma de decisiones que guía el trabajo de UX hacia metas de negocio a través de experiencias que la gente valora.

2. El problema

La cadena agroecológica de Monterrey enfrenta tres problemáticas centrales identificadas mediante investigación de campo y herramientas analíticas:

2.1 Desconexión informativa

El productor no sabe cuánto necesita el mercado. Cosecha de más o de menos, generando sobreproducción o desabasto. Solo el 15-20% de la producción llega al mercado meta. El desfogue se vende a 16-33% del precio real.

Herramienta de detección: SCOR Model (Plan, Source, Make, Deliver, Return) y los 7 Desperdicios Lean (sobreproducción, espera, defecto económico).

2.2 Desconfianza del consumidor

El consumidor no le cree a la etiqueta "agroecológico". Sin certificación formal accesible para pequeños productores, no hay forma de verificar las prácticas. El productor Santiago reporta un 70% de conversión cuando recibe visitas en campo — validando que la evidencia visual directa sí genera confianza, pero ese mecanismo no escala sin tecnología.

Herramienta de detección: Entrevistas de campo con 4 actores (Santiago/productor, Adriana y Ximena/consumidoras, Claudia/distribuidora).

2.3 Merma logística

La cadena de frío y los tiempos de entrega fallan. El distribuidor opera sin visibilidad del volumen real y sin retroalimentación del consumidor. La merma ocurre en el tramo entre el productor y el consumidor final.

Herramienta de detección: PESTEL (contexto externo), mapeo de la cadena con SIPOC.

3. Los tres actores

3.1 Productor (Agricultor agroecológico)

Rol en el sistema: Es el origen de la confianza. Sube evidencia de sus prácticas agroecológicas al perfil de Transparencia — un portafolio vivo del cultivo con fotos, datos de cosecha, temporalidad y notas de voz opcionales. Gestiona un catálogo con disponibilidad real por temporada, no un catálogo estático.

Justificación de su inclusión: Sin el productor, no hay producto. El 70% de conversión en visitas de campo valida que cuando el consumidor ve al productor trabajar, compra. La Transparencia digital replica esa experiencia a escala.

Pantallas clave: Dashboard con KPIs de pedidos, formulario de Transparencia (foto + tipo + cantidad + nota de voz), catálogo de cultivos con fechas estimadas de cosecha, confirmación de entrega con generación de QR, notificaciones de pedidos entrantes.

Perfil del usuario: Baja alfabetización digital, pero alta motivación cuando ve retorno económico directo. El onboarding debe completarse en ≤ 5 minutos hasta el primer cultivo publicado.

3.2 Distribuidor (Logística y entrega)

Rol en el sistema: Es el puente físico entre productor y consumidor. Se activa solo cuando el Productor confirma que puede entregar. Registra trazabilidad en ruta, condiciones de transporte y merma. Su dashboard muestra pedidos pendientes antes de activarse para planificar rutas con anticipación.

Justificación de su inclusión: Es donde ocurre la merma. Si la cadena de frío falla o los tiempos se extienden, la confianza que construyó la Transparencia se pierde en la última milla. Sin control logístico, el sistema no cierra.

Pantallas clave: Dashboard con 4 métricas clave + alerta LPO, ruta del día con mapa, gestión de lotes (frutas/verduras y miel), recolección asignada, registro de merma por tramo, analytics de rendimiento.

Regla de diseño bloqueada: El Distribuidor nunca se activa antes de la confirmación del Productor. Esta secuencia está validada en el Service Blueprint y es irreversible en el diseño.

3.3 Consumidor (Usuario final — hogar)

Rol en el sistema: Es quien valida el ciclo completo. Explora productores por su perfil de Transparencia, ve el Score de confianza antes de comprar, hace pedidos, sigue la entrega en tiempo real y califica al final. Su segundo pedido confirma que el sistema funciona.

Justificación de su inclusión: El consumidor es un comprador de hogar, no un negocio. Esta distinción (definida durante el proceso de diseño) cambió la frecuencia de uso, los flujos de checkout y toda la arquitectura de pantallas. La pantalla de inicio responde tres preguntas en tres segundos: ¿tengo algo en camino? ¿qué hay disponible hoy? ¿quién me lo produce?

Pantallas clave: Home con catálogo temporal de disponibilidad real, perfil del productor con Score de confianza, carrito/checkout con desglose de pago, seguimiento en tiempo real durante entrega, calificación y reporte post-entrega, alertas de temporada.

Fuente de diseño de pantallas: Gibbons, S. (2017). How to Draw a Wireframe (Even if You Can't Draw). Nielsen Norman Group. Bishop, D. en Moggridge, B. (2007). Designing Interactions, Cap. 8.

4. Arquitectura de la aplicación

La arquitectura sigue la metáfora del edificio propuesta por la asesora de tesis y fundamentada en la teoría de arquitectura de información de Peter Morville (2004).

4.1 El Lobby (Pantalla de inicio)

Es el punto de entrada universal. Cualquier persona llega aquí antes de identificarse. Contiene el registro diferenciado por rol y el inicio de sesión. No tiene contenido profundo — solo orienta y pregunta quién eres.

4.2 Ala del Productor

Accesible solo después del login como productor. Contiene: Dashboard con KPIs → Catálogo de cultivos → Transparencia (portafolio vivo) → Confirmación de entrega → Notificaciones. La sección de Transparencia es la más importante porque alimenta el Score de confianza que ve el consumidor.

4.3 Ala del Distribuidor

Accesible solo después del login como distribuidor. Contiene: Ruta del día → Recolección asignada → Trazabilidad en ruta → Registro de merma → Analytics. El distribuidor ve pedidos pendientes antes de que el productor los active para poder planear rutas.

4.4 Ala del Consumidor

Accesible solo después del login como consumidor. Contiene: Home + catálogo temporal → Perfil del productor + Score → Carrito / Checkout → Seguimiento en tiempo real → Calificación + reporte. El catálogo muestra disponibilidad real de temporada, no un inventario estático.

4.5 Conexiones cruzadas entre alas

Las alas no son silos. Los datos fluyen entre ellas a través del sistema:

La Transparencia del Productor alimenta el Perfil que ve el Consumidor.

El checkout del Consumidor dispara la notificación al Productor.

La confirmación del Productor activa al Distribuidor.

La trazabilidad del Distribuidor es visible para el Consumidor.

La calificación del Consumidor retroalimenta el Score del Productor.

Fuente: Morville, P. & Rosenfeld, L. (2006). Information Architecture for the World Wide Web. 3rd ed. O'Reilly Media.

5. Motor de confianza: Transparencia y Score

5.1 El concepto de Transparencia

La Transparencia no es un formulario burocrático — es el storytelling del productor. Es un portafolio vivo del cultivo con evidencia fotográfica y documental que construye confianza antes y durante la compra.

El flujo de valor es:

El Productor sube evidencia (fotos del cultivo, prácticas agroecológicas, datos de cosecha, notas de voz opcionales).

El Sistema calcula automáticamente el Score de Confianza a partir de 4 variables ponderadas.

El Consumidor ve el perfil completo con el Score antes de comprar.

5.2 Score de Confianza

El Score es auto-generado por el sistema. No es manipulable por el productor. Fue elegido sobre alternativas (sello propio, testimonios, certificación externa) mediante argumentación IBIS (Rittel): es verificable, calculado por el sistema, no manipulable, y responde a los dos perfiles de consumidor identificados en las entrevistas de campo (Adriana/48 años y Ximena/29 años).

5.3 Justificación de esta decisión

El insight que la sustenta viene directamente del campo: el consumidor no le cree a la etiqueta "agroecológico" — le cree a la foto del productor en su campo. Santiago reporta 70% de conversión con visitas presenciales. La Transparencia digital replica ese mecanismo a escala.

Fuente: Rittel, H. W. J. & Webber, M. M. (1973). Dilemmas in a general theory of planning. Policy Sciences, 4(2), 155-169. El framework IBIS (Issue-Based Information System) se usó para estructurar la argumentación de esta decisión.

6. Secuencia de interacción

El flujo completo entre actores sigue esta secuencia. Cada paso dispara el siguiente automáticamente — estas reglas están bloqueadas en el diseño:

PasoActorAcciónTrigger1ConsumidorExplora catálogo y perfil de Transparencia del productorManual2ConsumidorConfirma pedido (checkout)Manual→SistemaNotifica automáticamente al Productor sin intervención manualAutomático3ProductorRecibe notificación, confirma que puede entregarManual→SistemaActiva al Distribuidor solo después de confirmación del ProductorAutomático4DistribuidorRecibe asignación de recolección, planea ruta, registra trazabilidadManual5ConsumidorVe seguimiento en tiempo real durante la entregaPasivo6ConsumidorRecibe, califica y retroalimenta el Score del productorManual

Justificación de la secuencia: El Distribuidor se activa solo después de que el Productor confirma. Esto reduce merma porque evita recolecciones innecesarias. El checkout dispara notificación automática para que el productor calibre su cosecha lo antes posible.

Fuente: Gibbons, S. (2017). Service Blueprints: Definition. Nielsen Norman Group.

7. Trazabilidad en tiempo real

7.1 Gap identificado

En el User Journey Map del Consumidor, la curva emocional cae a "Incierto" durante la etapa de Entrega. El consumidor compró con confianza (gracias a Transparencia) pero la pierde durante el transporte porque no sabe dónde está su pedido. Este es el momento donde el Distribuidor está activo pero el Consumidor no tiene visibilidad.

7.2 Solución

Trazabilidad visible en tiempo real para el consumidor: Preparando cosecha → En ruta → Entregado. La curva emocional se recupera porque la incertidumbre se elimina. La logística deja de ser un "cuarto oscuro" y se convierte en una garantía visible.

7.3 QR por lote

Cada lote tiene un código QR único que, al escanearse, muestra: productor de origen, fecha de siembra, fecha de cosecha, hora de salida del campo, condiciones de transporte, y certificaciones/prácticas agroecológicas. El QR transforma una etiqueta pasiva en una experiencia de storytelling por producto.

Fuente: Kaplan, K. (2016). When and How to Create Customer Journey Maps. Nielsen Norman Group. El gap emocional fue detectado mediante esta metodología.

8. Wins incorporados de soluciones exitosas

Los siguientes wins provienen del análisis de 5 plataformas exitosas en el espacio de trazabilidad alimentaria y reducción de merma. Cada uno fue evaluado por su compatibilidad con la arquitectura existente del producto.

8.1 Urgencia temporal en el catálogo

Inspiración: Too Good To Go (Copenhague, 2016 — 120M usuarios, 500M+ comidas salvadas, crecimiento del 67% en 2025).

Win: Mostrar al consumidor indicadores de disponibilidad dinámica: cuántos días quedan antes de la cosecha, cuántas unidades quedan disponibles, y ventanas de pedido con tiempo límite. La presión temporal suave reduce la indecisión del consumidor y permite al productor cosechar solo lo comprometido.

Dónde vive en la app: Catálogo del Consumidor (Ala del Consumidor → Home). Cada producto muestra un badge de "Cosecha en 3 días" o "Últimas 5 unidades". No requiere input adicional del productor — se calcula desde los datos de temporada ya existentes en el catálogo.

Empate con KPI: ≥ 60% pedidos con anticipación ≥ 48h antes de cosecha. La urgencia visual dispara pedidos anticipados.

Diferencia con TGTG: TGTG es reactivo (rescata comida que ya sobró). Tu producto es preventivo (sincroniza demanda antes de que ocurra la merma). El win se adopta pero la lógica es inversa.

8.2 Compras comunitarias consolidadas

Inspiración: Nilus (Argentina, 2016 — opera en México, Argentina y Puerto Rico; reconocida por Naciones Unidas como top 20 startup de triple impacto global).

Win: Agrupar automáticamente pedidos de consumidores de la misma colonia o zona en un solo punto de entrega. Esto reduce viajes del distribuidor, baja el costo de envío por persona, y crea efecto de red local ("si mi vecina ya compra, yo también").

Dónde vive en la app: Checkout del Consumidor (paso 2 de la secuencia). Después de seleccionar productos, el sistema sugiere: "3 vecinos de tu zona también pidieron esta semana — ¿quieres agrupar la entrega y ahorrar $X en envío?" Si acepta, el sistema consolida el pedido y el Distribuidor recibe una sola ruta optimizada.

Empate con blueprint: Reduce la merma en el tramo Distribuidor → Consumidor porque menos viajes = menos tiempo en tránsito = mejor cadena de frío. También alimenta el KPI de fidelización porque el efecto comunitario genera compromiso social.

Diferencia con Nilus: Nilus es solidario (donación de excedentes a comedores). Tu producto es comercial (venta directa productor-consumidor). El win de consolidación logística se adapta al modelo de mercado.

8.3 Transparencia de precios (desglose visible)

Inspiración: Open Food Network (Australia/global — plataforma open-source, crecimiento de 850% durante COVID, opera en 20+ países).

Win: Mostrar al consumidor cuánto de su pago llega directamente al productor. Un desglose simple y visible: "De tus $100, $72 van directo a Santiago en Ramos Arizpe". Elimina la sospecha de intermediación excesiva.

Dónde vive en la app: Perfil del Productor (visible al Consumidor) y pantalla de Checkout. No requiere input manual del productor — el sistema calcula el desglose automáticamente basado en la estructura de costos configurada.

Empate con guiding policy: Reducir la distancia percibida entre campo y mesa incluye la distancia económica. Cuando el consumidor sabe que el grueso de su dinero llega al productor, la relación se siente directa.

Diferencia con OFN: OFN es una plataforma horizontal (cualquier productor en cualquier país). Tu producto es vertical y contextualizado a la cadena agroecológica de Monterrey. La transparencia de precios se aplica al mismo principio pero en un contexto de relación más íntima entre productor y consumidor.

8.4 Modelo de suscripción (canasta recurrente)

Inspiración: Misfits Market (EE.UU., 2018 — 11M órdenes entregadas, $526.5M en funding, opera en 44 estados).

Win: Ofrecer al consumidor la opción de suscribirse a una canasta semanal de un productor específico. El consumidor no decide cada vez qué comprar — recibe una selección curada basada en la temporada. Esto resuelve el problema de sincronización: el productor sabe con certeza cuántas canastas tiene comprometidas, y cosecha exactamente eso.

Dónde vive en la app: Perfil del Productor (opción "Suscríbete a la canasta semanal de Santiago") y Dashboard del Productor (sección "Suscripciones activas"). El sistema genera pedidos automáticos cada semana y notifica al consumidor 48h antes: "Tu canasta de esta semana incluye jitomate, chile y cilantro. ¿Confirmas?"

Empate con KPIs: Dispara directamente el KPI de fidelización (≤ 30 días entre primer y segundo pedido) porque el ciclo se automatiza. También alimenta el KPI de anticipación (≥ 48h antes de cosecha) porque los pedidos recurrentes son predecibles por definición.

Diferencia con Misfits: Misfits rescata productos "feos" con defectos estéticos. Tu suscripción es de producto fresco y directo, curado por el productor según lo que tiene de temporada. El productor tiene agencia sobre el contenido de la canasta.

8.5 Historia del lote (storytelling granular)

Inspiración: Farmonaut / Farm to Plate (plataformas enterprise de trazabilidad agrícola con QR y blockchain).

Win: Cada lote tiene su propia mini-historia trazable. Cuando el consumidor escanea el QR, no solo ve "esto viene de Santiago" sino un timeline completo: "Sembrado el 15 de marzo → Cosechado el 2 de mayo → Salió del campo a las 7:00am → Llegó a tu zona a las 11:00am". El QR pasa de ser una etiqueta pasiva a una experiencia de conexión con el origen.

Dónde vive en la app: Flujo de QR Scan (accesible sin registro previo). El consumidor abre la cámara, escanea, y ve el timeline del lote con foto del productor, datos de la cosecha, y condiciones de transporte. Incluye un botón de "Reportar en 3 toques" sin necesidad de crear cuenta.

Empate con trazabilidad: Este win es una extensión natural de la trazabilidad que ya está diseñada. Agrega la dimensión temporal (cuándo pasó cada cosa) a la dimensión espacial (dónde está el pedido) que ya cubre el seguimiento en tiempo real.

Diferencia con enterprise: Las soluciones enterprise (Farmonaut, Crop Analytica) están diseñadas para cadenas largas con múltiples intermediarios. Tu QR cuenta la historia de una cadena corta donde el productor tiene nombre y cara — es un storytelling humano, no un registro de compliance.

8.6 Impacto ambiental cuantificado y personal

Inspiración: Patrón cruzado de TGTG (2.7 kg CO₂e por bolsa), Nilus (toneladas rescatadas) y OFN (km recorridos).

Win: Calcular y mostrar al consumidor su impacto acumulado personal: "Con tus 8 pedidos este mes, evitaste X kg de merma y tu comida viajó solo 45 km en promedio vs 800 km del supermercado". El consumidor se convierte en agente consciente, no solo comprador. El dato también retroalimenta al productor: "Tu participación en la plataforma este mes evitó Y kg de desperdicio".

Dónde vive en la app: Dashboard del Consumidor (sección "Mi impacto") y Dashboard del Productor (sección "Tu impacto"). Se calcula automáticamente a partir de datos ya capturados: distancia de entrega (del distribuidor), volumen de pedidos completados, y diferencia vs promedio de merma del mercado convencional.

Empate con guiding policy: La distancia percibida no es solo emocional — también es geográfica y ambiental. Mostrar los kilómetros reales refuerza que el campo está más cerca de lo que parece.

8.7 Comunicación bidireccional productor → consumidor

Inspiración: Ninguna de las 5 apps analizadas tiene este mecanismo. Es una oportunidad de diferenciación única.

Win: Un canal donde el productor le comunica algo directamente al consumidor. No es un chat abierto (demasiado carga operativa) — es una nota contextual por lote o por temporada. Ejemplo: "Esta semana el jitomate salió más chico porque llovió menos, pero está más dulce." Humaniza la relación de una forma que ninguna plataforma enterprise hace.

Dónde vive en la app: Campo opcional en el registro de lote del Productor ("Nota para el consumidor"). Se muestra en el perfil del producto cuando el Consumidor lo ve en el catálogo y en la pantalla de QR scan.

Empate con Transparencia: Este win extiende la Transparencia más allá de la evidencia visual. No solo se muestra qué hace el productor, sino qué piensa sobre lo que produce. Es la capa de humanización que cierra la distancia percibida.

9. Convenciones visuales del sistema

El lenguaje visual es consistente en todos los artefactos UX del proyecto:

ElementoSignificadoTeal (#0F766E)Sistema digital propuesto — acciones automatizadas, procesos internosVerde (#2D6A4F)Productor — acciones, pantallas y datos del agricultorÁmbar/naranja (#D97706)Distribuidor / Apicultor — logística, rutas, trazabilidadRojo claro (#DC2626)Fricción / fallo — puntos de dolor, momentos de rupturaBorde punteado morado (#6D28D9)Proceso automático del sistema (Score, triggers, notificaciones)Amarillo + borde dashedElementos exclusivos del flujo de miel (apicultor, floración)

En los mapas de sitio: rectángulos azules representan acciones, paralelogramos representan notificaciones, rectángulos oscuros representan dashboards, y puntos de color indican la involucración de otro actor.

10. Metodología

La metodología está basada en Rittel, que se aplica cuando el problema es complejo, involucra múltiples actores y no tiene una sola solución correcta. La secuencia de herramientas es acumulativa — cada una alimenta a la siguiente:

#HerramientaQué hizoPor qué se usó1SIPOCVista general de la cadena completaDefine actores, entradas y salidas antes de buscar problemas2SCORIdentifica dónde se rompe la cadenaPlan, Source, Make, Deliver, Return — señala fallas logísticas3PESTELContexto externo del problemaFactores políticos, económicos, sociales, tecnológicos4Lean (7 desperdicios)Qué se pierde operativamenteSobreproducción, espera, defecto económico detectados5Entrevistas de campoPerspectiva humana de los actoresSantiago (productor), Adriana y Ximena (consumidoras), Claudia (distribuidora)6IBIS (Rittel)Argumenta decisiones de diseño¿Cómo generar confianza sin certificación? → Score con 4 variables7Strategy CanvasSintetiza todo en estrategia9 campos incluyendo guiding policy y KPIs medibles8Blueprint + FlowsDiseño del servicio completoAcciones, touchpoints, procesos internos, emociones por actor

Fuente: Rittel, H. W. J. & Webber, M. M. (1973). Dilemmas in a general theory of planning. Policy Sciences, 4(2), 155-169.

11. KPIs estratégicos

Derivados del Strategy Canvas (The Fountain Institute), campo 9:

KPIMetaActorJustificaciónTiempo entre 1° y 2° pedido≤ 30 díasConsumidorValida que la confianza generó fidelizaciónProductores con Transparencia completa≥ 80%ProductorSin transparencia completa no hay score funcionalReducción de merma↓ 30% en 6 mesesSistemaMeta ambiciosa — si no hay línea base, primero medirSatisfacción post-entrega≥ 4.2 / 5ConsumidorEl feedback retroalimenta el score del productorOnboarding del productor≤ 5 minProductorSi el onboarding es largo, el productor abandonaPedidos anticipados≥ 60% con ≥ 48h de anticipaciónSistemaSincroniza demanda y producción = menos merma

12. Artefactos UX construidos

ArtefactoFuente metodológicaPropósitoService BlueprintNN/Group (Gibbons, 2017)Integra acciones, touchpoints, procesos internos, emociones y pain points de los 3 actores en 6 etapasUser Journey MapsKaplan, K. (2016) NN/GroupCurva emocional por actor — identificó el gap de "Incierto" en entregaStrategy CanvasThe Fountain Institute9 campos que sintetizan la estrategia con guiding policy y KPIsMapas de sitio jerárquicosMorville, P. (2004)Arquitectura de información por actor con conexiones cruzadasDiagramas de flujoBishop en Moggridge (2007)Flujo de acciones con decisiones (diamantes), botones etiquetados y branchingWireframes mid-fidelityGibbons (2017) NN/GroupPantallas clave por actor: home, perfil, checkout, QR scan, dashboardSolutions BlueprintStickdorn & Schneider (2011)Mapea cada problema a su intervención digital por actor10 Types of InnovationDoblin (Deloitte)Clasifica cada acción del blueprint en tipo de innovación — Engagement domina

13. Resumen de decisiones clave y justificaciones

#DecisiónJustificaciónFuente1Transparencia como portafolio vivo, no como formulario70% de conversión en visitas de campo valida que la evidencia visual genera ventasEntrevista productor Santiago2Score de confianza auto-generado por el sistemaElegido sobre sello propio y testimonios vía IBIS: es verificable, calculado, no manipulableRittel — IBIS3Distribuidor se activa solo tras confirmación del ProductorEvita recolecciones innecesarias, reduce mermaService Blueprint (NN/Group)4Checkout dispara notificación automática al ProductorCuanto antes sepa el productor del pedido, mejor calibra la cosechaBlueprint etapa 3→45Trazabilidad en tiempo real visible para el ConsumidorSoluciona el gap emocional "Incierto" en User Journey MapKaplan (2016) NN/Group6Catálogo con disponibilidad real por temporadaSincroniza demanda con producción real para reducir mermaStrategy Canvas campo 87Consumidor = usuario final (hogar), no negocioCambió frecuencia de uso, checkout y toda la arquitecturaClarificación durante el proceso de diseño8Urgencia temporal en catálogoReduce indecisión y aumenta pedidos anticipadosWin de Too Good To Go9Compras comunitarias consolidadasReduce viajes, baja costos, crea efecto de red localWin de Nilus10Desglose visible de pago al productorElimina sospecha de intermediación, refuerza confianzaWin de Open Food Network11Suscripción a canasta semanal recurrenteAutomatiza fidelización y predice demanda para el productorWin de Misfits Market12Historia del lote con timeline en QRTransforma el QR de etiqueta pasiva a experiencia de storytellingWin de Farmonaut13Impacto ambiental personal cuantificadoConvierte al consumidor en agente conscientePatrón cruzado TGTG + Nilus + OFN14Nota del productor al consumidor por loteHumaniza la relación con comunicación contextual directaDiferenciador único — ninguna app analizada lo tiene

14. Benchmarking: Apps de referencia

AppPaísMétrica claveWin principalDiferencia con este proyectoToo Good To GoDinamarca / Global120M usuarios, 500M+ comidas salvadasUrgencia temporal + modelo win-win-winTGTG es reactivo (rescata excedentes). Este proyecto es preventivo (sincroniza antes de la merma)NilusArgentina / LATAMOpera en México, Argentina, Puerto Rico. Top 20 startup triple impacto (ONU)Tres actores + tracking en tiempo real + compras consolidadasNilus es solidario (donación). Este proyecto es comercial (venta directa) con capa de Transparencia y ScoreOpen Food NetworkAustralia / GlobalCrecimiento 850% en COVID. Opera en 20+ paísesTransparencia de precios + storytelling del productor + open sourceOFN es horizontal (cualquier productor). Este proyecto es vertical, contextualizado a MonterreyMisfits MarketEE.UU.11M órdenes, $526.5M fundingSuscripción + rescate de producto "feo"Misfits rescata excedentes con defectos. Este proyecto vende producto fresco directoFarmonautIndia / Global200K+ usuarios, 100+ empresasQR + blockchain + trazabilidad enterpriseFarmonaut es enterprise para cadenas largas. Este proyecto es para cadenas cortas con relación humana

15. Contexto de la cadena

15.1 Monterrey — Frutas y verduras

Productores como Santiago en Ramos Arizpe (~100 km de Monterrey) cultivan orgánicos sin certificación formal. La distribución ocurre a través de un conector distribuidor que lleva el producto al consumidor final en la zona metropolitana.

15.2 Galeana / Allende — Miel agroecológica

Apicultores en la región producen miel agroecológica. El flujo de miel tiene elementos exclusivos: floración, humedad, cristalización. En los artefactos UX, estos elementos se marcan con amarillo y borde dashed para distinguirlos del flujo de frutas y verduras.

15.3 Baja California (versión paralela)

Existe un scope paralelo del proyecto para la región de Baja California, con los mismos principios de diseño pero adaptados al contexto agrícola local.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b31f6501-7ec3-4f08-8f9d-be2cdc40a8c2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

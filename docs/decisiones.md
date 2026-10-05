# Decisiones de flujo — Milpa

Reglas acordadas para que las pantallas de los tres roles cuenten la misma historia. Si un prompt contradice algo de aquí, manda este documento.

## Estados del pedido

Una sola lista para consumidor, productor y distribuidor:

| Estado | Quién lo provoca | Qué ve el consumidor |
|---|---|---|
| `nuevo` | Consumidor paga en el checkout | "Pedido realizado" |
| `aceptado` | Productor toca "Puedo entregar" | "Aceptado por el productor" |
| `empacado` | Productor registra cadena de frío y genera el QR | "Empacado" |
| `en_recoleccion` | Distribuidor confirma la recolección de todos los lotes del pedido (o los recibe en su local) | "Recolectado" |
| `en_ruta` | Distribuidor termina las recolecciones y toca "Salir a entregar" | "En camino" |
| `entregado` | Distribuidor confirma la entrega | "Entregado" |
| `recibido` | Consumidor confirma "Sí, ya tengo mi canasta" (o pasan 24 h) | "Recibido" |
| `calificado` | Consumidor envía feedback | "Calificado" |

Los tres roles y la página de trazabilidad usan el mismo texto (`STATUS_LABEL`) y el mismo bloque **Estado del pedido** (`src/components/EstadoPedido.tsx`): estado actual, hora y "Sigue:" con el siguiente paso (`siguientePaso` en `src/lib/orders.ts`). Ninguna pantalla inventa su propio nombre para un estado; los títulos del productor siguen la tabla ("Pedido recolectado" en `en_recoleccion`, "Pedido en camino" solo en `en_ruta`). Las etiquetas de estado van en pasado: dicen lo que ya pasó, no lo que está pasando.

Donde aparece el nombre del productor se dice su papel ("Cultivado por …").

Desvíos: `rechazado` (productor toca "No esta vez") y `con_problema` (distribuidor reporta un problema en la recolección).

## Traslado del campo al distribuidor

El productor elige al empacar: "Yo lo llevo al local del distribuidor" o "El distribuidor recoge en mi campo". Si lo lleva el productor, esa parada no aparece en la ruta de recolección.

## QR

Un QR por **pedido** (`MLP-0518`). Dentro muestra cada **lote** que trae la canasta, uno por productor (`LT-0518`). La página pública `/lote/:id` es solo de consulta: trazabilidad y score, sin calificar.

La página pública se titula **Trazabilidad del pedido** y muestra: pedido y lotes, quién cultivó cada lote (con su score de confianza y prácticas), cadena de frío (temperatura al empacar y al recolectar, tipo de empaque), el recorrido con sus horas y las incidencias (problema al recolectar, merma). No muestra quién compró ni la dirección de entrega. Se abre desde el QR del productor, la Trazabilidad del distribuidor y los Pedidos del consumidor. También acepta el número de lote (`/lote/LT-0601`). En el prototipo el QR es un dibujo, no se puede escanear con la cámara; el acceso es el enlace.

## Notificaciones

Los tres roles tienen una campanita en el encabezado con el número de avisos sin ver; lleva a la pantalla **Notificaciones**. Los avisos no se guardan aparte: se derivan del historial de cada pedido (`src/lib/notificaciones.ts`), así siempre coinciden con lo que pasó. Al abrir la pantalla se marcan como vistos.

La pantalla agrupa **por pedido, no por acción**: una sección por pedido (la de actividad más reciente arriba). La vista previa muestra el número de pedido, su estado actual (`STATUS_LABEL`), la última novedad y cuántas hay sin ver. Al abrirla aparecen "Sigue:", todas sus novedades (con el detalle, p. ej. dónde recoger) y **un solo botón** a la pantalla del pedido de ese rol, con el título de esa pantalla como etiqueta. Las secciones con novedades sin ver se abren solas. Los avisos que no son de un pedido (reservas, cosechas compartidas) van en "Otros avisos".

| Rol | Le avisa |
|---|---|
| Productor | pedido nuevo, problema en la recolección, pedido recolectado, entregado, pago liberado (ya con la aportación de socio descontada), calificación recibida (alerta si es de 2★ o menos o trae merma), nueva reserva de cosecha compartida |
| Consumidor | pedido aceptado o rechazado, empacado, en revisión por un problema, en camino (con su código de entrega), entregado, nueva cosecha compartida si ya compró antes |
| Distribuidor | pedido confirmado, recolección lista (campo o local), consumidor confirmó la entrega |

Cada aviso lleva a la pantalla donde se atiende. Son avisos dentro de la app; push, WhatsApp o correo necesitan backend.

## Entrega

La marca el distribuidor (`entregado`) y el consumidor la confirma (`recibido`). Si el consumidor no confirma en 24 h, se da por recibida. Pick up o domicilio viene del pedido; el distribuidor no lo elige.

## Ruta del distribuidor

Todo sale de los pedidos (`src/lib/orders.ts` y `src/lib/distribucion.ts`); no hay datos de ruta aparte.

1. **Iniciar ruta** → paradas de recolección: una por productor con pedidos empacados. Si el productor lleva el producto, la parada es "Recibir en local" y no cuenta como viaje.
2. En cada parada: confirmar llegada → escanear el QR de cada pedido → temperatura → "¿Producto en buen estado?". Si no, se reporta el problema con motivo y foto: el pedido pasa a `con_problema`, el productor lo ve y lo deja listo otra vez.
3. **Salir a entregar** → los pedidos pasan a `en_ruta` y el consumidor ve su **código de entrega** (4 dígitos) arriba en Pedidos y como aviso en Mercado. Si tiene varios pedidos abiertos, Pedidos muestra primero el que va en camino.
4. En cada entrega el distribuidor pide el código. A domicilio además captura firma; para recoger confirma que llegó el consumidor y verifica su identidad. Si el pago es en efectivo, lo cobra ahí.
5. Después de cada entrega: "¿Hubo merma?" con kg, motivo, lote y foto. El % de merma del distribuidor se calcula solo (kg perdidos / kg entregados).
6. El consumidor confirma, escanea el QR (ve lote, empaque y temperaturas reales) y califica. Esa calificación suma una reseña al productor y libera su pago.

Mapa de la ruta: mapa real de OpenStreetMap (Leaflet) con la ruta por calles de OSRM; si OSRM no responde se dibuja un trazo aproximado. Los pines llevan el número y color de la lista (verde recolección, terracota entrega) y la línea sale del local. Las coordenadas viven en `src/lib/data.ts` (campos de productores) y `src/lib/distribucion.ts` (direcciones del demo). "Abrir en navegación" manda esas mismas coordenadas a Google Maps.

Finanzas del distribuidor: gana la logística ($18) por pedido entregado; del efectivo que cobra liquida el resto a productores y Milpa.

## Score de confianza (sobre 10)

Validación por sistema en 3 capas, como en el modelo de negocio (`src/lib/score.ts`):

- **Calificación de consumidores · 40 %**: promedio de las últimas 20 reseñas, incluida la merma que reporta el consumidor.
- **Productor nuevo**: mientras tenga menos de 10 reseñas no muestra score; lleva una estampa roja "Nuevo" sobre su foto y ve su avance (x/10 reseñas). Al registrarse como nuevo debe subir entre 5 y 15 fotos de su campo.
- **Consistencia de datos · 30 %**: información básica completa (datos de contacto, identificación, historia, ubicación, cuenta de cobro, acuerdo de socio y fotos del campo). Completarla da el 30 % del score.
- El score del productor se muestra con una sola tarjeta (`src/components/ScoreCard.tsx`) en Inicio y en Transparencia; debe coincidir con el que ve el consumidor.
- Los nombres de los enlaces y accesos coinciden con el título de la pantalla a la que llevan (Transparencia, Catálogo, Pedidos, Finanzas).
- **Registro del distribuidor · 30 %**: entregas a tiempo y estado del producto al recolectar.
- Colores: verde ≥ 8, amarillo ≥ 5, rojo < 5. Siempre se muestra como `9.4/10`. El mercado muestra primero a los productores con mejor score.
- Solo califica quien compró, y solo dentro de la app.

## Pagos

- El consumidor paga producto + logística ($18) + plataforma ($10). El pago se reparte en automático (Conekta, split payment).
- Modelo B2B2C: el productor es **socio** de Milpa y aporta un porcentaje de cada venta (`APORTACION_SOCIO`, 10 % por ahora). Se retiene en automático en el split de cada pago; de las ventas en efectivo se descuenta del siguiente pago digital. Sin cuotas fijas ni pagos por adelantado. Lo acepta al registrarse.
- El productor puede recibir por varios métodos a la vez: CLABE (con banco y titular), CoDi y efectivo al recolectar.
- El distribuidor recibe la logística por transferencia (CLABE o tarjeta, con banco y titular) o CoDi; si el consumidor paga en efectivo, lo cobra al entregar. En el registro la sección "Cuenta de cobro" se muestra abierta con transferencia preseleccionada y el titular propuesto con su nombre.
- Al productor se le paga cuando el consumidor confirma que recibió (o pasan 24 h).
- Cosecha compartida: planes de 8, 12 y 24 semanas, sin descuento.

## Cuentas

Los tres roles registran nombre, correo, teléfono y contraseña. La contraseña no se guarda en el prototipo.

Productores: puede haber varias cuentas en el mismo navegador (`milpa-productores`). Registrarse crea una cuenta nueva sin borrar las demás. El inicio de sesión identifica la cuenta por correo o teléfono, o eligiéndola de la lista "Cuentas en este dispositivo"; la contraseña no se verifica en el prototipo. La cuenta de ejemplo (Ezequiel Martínez, 24 reseñas, perfil al 100 %) siempre está disponible.

El productor además sube una **identificación oficial** (INE, pasaporte o licencia) para verificar que es la persona correcta. En el prototipo solo se guarda el tipo y el estado ("en revisión"); la foto no se almacena en el navegador. Con backend, la verificación la hace Milpa antes de activar los pagos.

Para transferencias se acepta CLABE (18 dígitos) o tarjeta de débito (16), con banco y titular.

## Demo

No hay backend. El estado (carrito, pedidos, productor) se guarda en el navegador y se comparte entre roles: lo que hace el consumidor aparece al entrar como productor o distribuidor en el mismo navegador.

## Navegación

El botón de regresar va siempre arriba a la izquierda, sobre el título (`back` en `AppShell`). La X de cerrar un flujo (p. ej. confirmar la llegada) es otra cosa y se queda a la derecha.

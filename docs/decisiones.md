# Decisiones de flujo — Milpa

Reglas acordadas para que las pantallas de los tres roles cuenten la misma historia. Si un prompt contradice algo de aquí, manda este documento.

## Estados del pedido

Una sola lista para consumidor, productor y distribuidor:

| Estado | Quién lo provoca | Qué ve el consumidor |
|---|---|---|
| `nuevo` | Consumidor paga en el checkout | "Pedido recibido" |
| `aceptado` | Productor toca "Puedo entregar" | "Aceptado por el productor" |
| `empacado` | Productor registra cadena de frío y genera el QR | "Empacando" |
| `en_recoleccion` | Distribuidor confirma recolección (o el productor entrega en el local) | "Recolectado" |
| `en_ruta` | Distribuidor inicia la ruta | "En camino" |
| `entregado` | Distribuidor confirma la entrega | "Entregado" |
| `recibido` | Consumidor confirma "Sí, ya tengo mi canasta" (o pasan 24 h) | "Recibido" |
| `calificado` | Consumidor envía feedback | "Calificado" |

Desvíos: `rechazado` (productor toca "No esta vez") y `con_problema` (distribuidor reporta un problema en la recolección).

## Traslado del campo al distribuidor

El productor elige al empacar: "Yo lo llevo al local del distribuidor" o "El distribuidor recoge en mi campo". Si lo lleva el productor, esa parada no aparece en la ruta de recolección.

## QR

Un QR por **pedido** (`MLP-0518`). Dentro muestra cada **lote** que trae la canasta, uno por productor (`LT-0518`). La página pública `/lote/:id` es solo de consulta: trazabilidad y score, sin calificar.

## Entrega

La marca el distribuidor (`entregado`) y el consumidor la confirma (`recibido`). Si el consumidor no confirma en 24 h, se da por recibida. Pick up o domicilio viene del pedido; el distribuidor no lo elige.

## Score de confianza (sobre 10)

Validación por sistema en 3 capas, como en el modelo de negocio (`src/lib/score.ts`):

- **Calificación de consumidores · 40 %**: promedio de las últimas 20 reseñas, incluida la merma que reporta el consumidor.
- **Productor nuevo**: mientras tenga menos de 10 reseñas no muestra score; lleva una estampa roja "Nuevo" sobre su foto y ve su avance (x/10 reseñas). Al registrarse como nuevo debe subir entre 5 y 15 fotos de su campo.
- **Consistencia de datos · 30 %**: perfil completo, fotos con fecha y ubicación, temporadas reales.
- **Registro del distribuidor · 30 %**: entregas a tiempo y estado del producto al recolectar.
- Colores: verde ≥ 8, amarillo ≥ 5, rojo < 5. Siempre se muestra como `9.4/10`. El mercado muestra primero a los productores con mejor score.
- Solo califica quien compró, y solo dentro de la app.

## Pagos

- El consumidor paga producto + logística ($18) + plataforma ($10). El pago se reparte en automático (Conekta, split payment).
- Modelo B2B2C: el productor es **socio** de Milpa y aporta un porcentaje de cada venta (`APORTACION_SOCIO`, 10 % por ahora). Se retiene en automático en el split de cada pago; de las ventas en efectivo se descuenta del siguiente pago digital. Sin cuotas fijas ni pagos por adelantado. Lo acepta al registrarse.
- El productor puede recibir por varios métodos a la vez: CLABE (con banco y titular), CoDi y efectivo al recolectar.
- El distribuidor recibe la logística a su CLABE o CoDi; si el consumidor paga en efectivo, lo cobra al entregar.
- Al productor se le paga cuando el consumidor confirma que recibió (o pasan 24 h).
- Cosecha compartida: planes de 8, 12 y 24 semanas, sin descuento.

## Cuentas

Los tres roles registran nombre, correo, teléfono y contraseña. La contraseña no se guarda en el prototipo.

El productor además sube una **identificación oficial** (INE, pasaporte o licencia) para verificar que es la persona correcta. En el prototipo solo se guarda el tipo y el estado ("en revisión"); la foto no se almacena en el navegador. Con backend, la verificación la hace Milpa antes de activar los pagos.

Para transferencias se acepta CLABE (18 dígitos) o tarjeta de débito (16), con banco y titular.

## Demo

No hay backend. El estado (carrito, pedidos, productor) se guarda en el navegador y se comparte entre roles: lo que hace el consumidor aparece al entrar como productor o distribuidor en el mismo navegador.

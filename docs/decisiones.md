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

- Calificación de consumidores 40 %: promedio de las últimas 20 reseñas. Con menos de 5 reseñas el productor muestra "Nuevo".
- Perfil completo 30 %, entregas a tiempo 20 %, merma 10 %.
- Para la merma solo cuenta la que **reporta el consumidor** al recibir.
- Colores: verde ≥ 8, amarillo ≥ 5, rojo < 5. Siempre se muestra como `9.4/10`.
- Solo califica quien compró, y solo dentro de la app.

## Demo

No hay backend. El estado (carrito, pedidos, productor) se guarda en el navegador y se comparte entre roles: lo que hace el consumidor aparece al entrar como productor o distribuidor en el mismo navegador.

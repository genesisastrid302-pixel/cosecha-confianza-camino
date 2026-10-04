- Keep catalog crop facts in `src/lib/data.ts` so market, detail, and cart read the same product information.
- Keep the temporary shopping basket in a client-only cart module so navigation preserves selections without requiring account storage.- Keep producer profile, crops and cosechas compartidas in the client-only `src/lib/producer-store.ts` (localStorage) until a backend exists — prototype has no accounts yet.

- Follow `docs/decisiones.md` for order states, QR, delivery and trust-score rules; it overrides older prompts.
- Keep orders in the client-only `src/lib/orders.ts` (localStorage) so consumer, producer and distributor screens share the same demo state.
- Derive the distributor route, KPIs and finances from orders through `src/lib/distribucion.ts`; do not add separate hardcoded route data.
- Keep link labels equal to the title of the screen they open.
- Derive notifications from order history through `src/lib/notificaciones.ts`; do not store them separately.
- Keep the public QR page (`/lote/$id`) read-only and free of buyer name and delivery address.

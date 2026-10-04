- Keep catalog crop facts in `src/lib/data.ts` so market, detail, and cart read the same product information.
- Keep the temporary shopping basket in a client-only cart module so navigation preserves selections without requiring account storage.- Keep producer profile, crops and cosechas compartidas in the client-only `src/lib/producer-store.ts` (localStorage) until a backend exists — prototype has no accounts yet.

- Follow `docs/decisiones.md` for order states, QR, delivery and trust-score rules; it overrides older prompts.
- Keep orders in the client-only `src/lib/orders.ts` (localStorage) so consumer, producer and distributor screens share the same demo state.

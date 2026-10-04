import { addResena } from "@/lib/producer-store";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getProducer, products, unitLabel } from "@/lib/data";
import { formatTime, updateOrder, useOrders } from "@/lib/orders";
import { nombreCorto, useDistributor } from "@/lib/accounts";
import { LinkTrazabilidad } from "@/components/LinkTrazabilidad";
import { AppShell } from "@/components/AppShell";
import { consumidorTabs } from "@/components/tabs";
import santiago from "@/assets/producer-santiago.jpg";
import {
  ArrowLeft, Camera, CheckCircle2, Star, Sparkles, Thermometer, Leaf, Package, Heart, X,
  QrCode, Snowflake, CalendarDays, MapPin, Sprout, Truck, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/consumidor/recibir")({
  head: () => ({ meta: [{ title: "Confirmar entrega · Milpa" }] }),
  component: Recibir,
});

type Step = "confirm" | "scan" | "rate" | "thanks";

const aspects = [
  { id: "frescura", label: "Frescura", icon: Leaf },
  { id: "empaque", label: "Empaque", icon: Package },
  { id: "temperatura", label: "Temperatura", icon: Thermometer },
] as const;

function Recibir() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("confirm");
  const [scanned, setScanned] = useState(false);
  const [overall, setOverall] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [tipMerma, setTipMerma] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Pedido real: primero el que ya confirmó y le falta calificar; si no, el que el distribuidor
  // marcó como entregado (si no hay ninguno, se muestra el ejemplo)
  const orders = useOrders();
  const [orderId, setOrderId] = useState<string | null>(null);
  const order =
    orders.find((o) => o.id === orderId) ?? orders.find((o) => o.status === "recibido") ?? orders.find((o) => o.status === "entregado");
  const distribuidor = nombreCorto(useDistributor().nombre).split(" ")[0];
  const productores = order ? [...new Set(order.items.map((i) => i.producerSlug))].map(getProducer) : [getProducer("santiago")];
  const primer = productores[0].name.split(" ")[0];
  const pedidoId = order?.id ?? "MLP-0518";
  const lotes = order ? Object.values(order.lots).join(", ") : "LT-0518";
  const resumen = order
    ? order.items.map((i) => `${i.quantity} ${unitLabel(i.unit, i.quantity)} ${i.name.toLowerCase()}`).join(" · ")
    : "2 kg jitomate · 1 manojo cilantro";

  // Si ya confirmó que la recibió, entra directo a escanear y calificar
  useEffect(() => {
    if (order?.status === "recibido" && step === "confirm") {
      setOrderId(order.id);
      setStep("scan");
    }
  }, [order?.id, order?.status, step]);

  function onPhotos(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...next]);
  }

  return (
    <AppShell
      tabs={consumidorTabs}
      tone="terracota"
      eyebrow={step === "thanks" ? "Gracias" : "Confirmación de llegada"}
      title={step === "confirm" ? "¿Ya llegó?" : step === "scan" ? "Escanea tu canasta" : step === "rate" ? "¿Cómo te llegó?" : "Cerrado con cariño"}
      right={
        step !== "thanks" && (
          <Link to="/consumidor/pedidos" className="rounded-full bg-secondary p-2">
            <X className="h-4 w-4" />
          </Link>
        )
      }
    >
      <div className="space-y-6 px-5 pb-10">
        {/* Tarjeta del pedido */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex gap-3 p-3">
            <img src={order ? productores[0].photo : santiago} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#{pedidoId}</div>
              <div className="serif text-base leading-tight">
                {order ? `De ${productores.map((x) => x.name.split(" ")[0]).join(" y ")}` : "De Ezequiel · Seis Tierras"}
              </div>
              <div className="text-[11px] text-muted-foreground">{resumen}</div>
            </div>
          </div>
        </div>

        {step === "confirm" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="serif text-xl leading-tight">
                {order?.entrega === "pickup" ? `${distribuidor} te entregó tu canasta` : `${distribuidor} dejó tu canasta en la puerta`}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirma para cerrar el ciclo. Tu retroalimentación llega de regreso al campo.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  if (order) {
                    setOrderId(order.id);
                    updateOrder(order.id, { status: "recibido" });
                  }
                  setStep("scan");
                }}
                className="h-14 w-full rounded-2xl bg-foreground text-background text-base"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Sí, ya tengo mi canasta
              </Button>
              <Button
                variant="ghost"
                className="h-12 w-full rounded-2xl text-muted-foreground"
                onClick={() => navigate({ to: "/consumidor/pedidos" })}
              >
                Aún no llega
              </Button>
            </div>
          </>
        )}

        {step === "scan" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <QrCode className="h-7 w-7 text-primary" />
              </div>
              <div className="serif text-xl leading-tight">Escanea el QR de tu canasta</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Verifica la trazabilidad: lote, cosecha y cadena de frío antes de abrirla.
              </p>
            </div>

            {!scanned ? (
              <>
                <button
                  onClick={() => setScanned(true)}
                  className="relative flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5"
                >
                  <div className="absolute inset-6 rounded-xl border-2 border-primary/30" />
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <QrCode className="h-12 w-12" />
                    <span className="text-xs font-medium uppercase tracking-widest">Tocar para escanear</span>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  className="h-12 w-full rounded-2xl text-muted-foreground"
                  onClick={() => setStep("rate")}
                >
                  Omitir y continuar
                </Button>
              </>
            ) : (
              <>
                <section className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-primary">
                      Pedido {pedidoId} · Lote {lotes} · Verificado
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {order ? (
                      <>
                        <CultivoRow icon={Sprout} label="Cultivo" value={order.items.map((i) => i.name).join(" · ")} />
                        <CultivoRow icon={MapPin} label="Origen" value={productores.map((x) => x.region).join(" · ")} />
                        <CultivoRow
                          icon={CalendarDays}
                          label="Empacado"
                          value={order.empaque ? `${formatTime(order.empaque.registradoEn)} · ${order.empaque.tipo}` : "Sin registro"}
                        />
                        <CultivoRow
                          icon={Snowflake}
                          label="Cadena de frío"
                          value={
                            order.empaque
                              ? `${order.empaque.temperatura} °C al empacar${order.temperaturaRecoleccion !== undefined ? ` · ${order.temperaturaRecoleccion} °C ${order.traslado === "productor_lleva" ? "al recibirlo el distribuidor" : "al recolectar"}` : ""}`
                              : "Sin registro"
                          }
                        />
                        <CultivoRow
                          icon={Truck}
                          label="Trayecto"
                          value={`${order.traslado === "productor_lleva" ? "El productor lo llevó al local" : `Recolectado en campo por ${distribuidor}`} · entregado ${order.entregaRegistro ? formatTime(order.entregaRegistro.at) : ""}`}
                        />
                        <CultivoRow
                          icon={Leaf}
                          label="Prácticas"
                          value={products.find((x) => x.id === order.items[0]?.productId)?.cropPractice ?? "Agroecológico"}
                        />
                      </>
                    ) : (
                      <>
                        <CultivoRow icon={Sprout} label="Cultivo" value="Jitomate heirloom · variedad criolla" />
                        <CultivoRow icon={MapPin} label="Origen" value="Rancho Seis Tierras · Ramos Arizpe, Coah." />
                        <CultivoRow icon={CalendarDays} label="Cosechado" value="Ayer, 6:40 a.m." />
                        <CultivoRow icon={Snowflake} label="Cadena de frío" value="4–7 °C constantes · sin rupturas" />
                        <CultivoRow icon={Truck} label="Trayecto" value="98 km · 1 parada · 3 h 12 min" />
                        <CultivoRow icon={Leaf} label="Prácticas" value="Agroecológico · agua de lluvia captada" />
                      </>
                    )}
                  </div>
                </section>

                {order ? (
                  order.empaque?.condiciones && (
                    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-4">
                      <div className="eyebrow text-primary">Cómo lo guardó {primer}</div>
                      <p className="serif mt-1 text-sm leading-relaxed">{order.empaque.condiciones}</p>
                    </div>
                  )
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-4">
                    <div className="eyebrow text-primary">Nota del productor</div>
                    <p className="serif mt-1 text-sm leading-relaxed">
                      "Este lote se cortó cuando el sol apenas calentaba. Salió más
                      dulce por las lluvias del fin de semana."
                    </p>
                  </div>
                )}

                <LinkTrazabilidad id={pedidoId} />

                <Button
                  onClick={() => setStep("rate")}
                  className="h-14 w-full rounded-2xl bg-foreground text-base text-background"
                >
                  Continuar al feedback
                </Button>
              </>
            )}
          </>
        )}

        {step === "rate" && (
          <>
            {/* Estrellas globales */}
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="eyebrow">¿Cómo te llegó tu canasta?</div>
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setOverall(n)}
                    className="transition active:scale-90"
                    aria-label={`${n} estrellas`}
                  >
                    <Star
                      className={`h-9 w-9 ${
                        n <= overall ? "fill-miel text-miel" : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {overall === 0 && "Toca para calificar"}
                {overall === 1 && "Algo salió mal — cuéntanos"}
                {overall === 2 && "Esperabas más"}
                {overall === 3 && "Aceptable"}
                {overall === 4 && "Muy bien"}
                {overall === 5 && "Perfecto — sabor a casa"}
              </div>
            </section>

            {/* Aspectos */}
            <section>
              <div className="eyebrow">Detalle por aspecto</div>
              <div className="mt-3 space-y-3">
                {aspects.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <a.icon className="h-4 w-4 text-primary" />
                        <span className="serif text-base">{a.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setRatings((r) => ({ ...r, [a.id]: n }))}
                            aria-label={`${a.label} ${n}`}
                          >
                            <Star
                              className={`h-5 w-5 ${
                                n <= (ratings[a.id] ?? 0)
                                  ? "fill-miel text-miel"
                                  : "text-border"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Evidencia */}
            <section>
              <div className="eyebrow">Foto al desempacar (opcional)</div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="mt-3 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-card text-[10px] text-muted-foreground"
                >
                  <Camera className="h-5 w-5 text-primary" />
                  Subir foto
                </button>
                {photos.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/85"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Comentario */}
            <section className="rounded-2xl border-2 border-dashed border-terracota/40 bg-terracota/5 p-4">
              <div className="eyebrow text-terracota">Nota para {primer}</div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Llegó fresco, el cilantro huele riquísimo…"
                className="mt-2 w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
              />
              <div className="mt-1 text-[11px] text-muted-foreground">
                Tu mensaje llega directo al productor.
              </div>
            </section>

            {/* Merma */}
            <button
              onClick={() => setTipMerma((v) => !v)}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                tipMerma ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    tipMerma ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <div className="serif text-base leading-tight">Reportar merma</div>
                  <div className="text-[11px] text-muted-foreground">
                    ¿Algo llegó golpeado o de menos?
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-primary">{tipMerma ? "Sí" : "Agregar"}</span>
            </button>

            <Button
              disabled={overall === 0}
              onClick={() => {
                if (order) {
                  updateOrder(order.id, {
                    status: "calificado",
                    feedback: { estrellas: overall, merma: tipMerma, nota: comment.trim(), at: new Date().toISOString() },
                  });
                }
                addResena();
                setStep("thanks");
              }}
              className="h-14 w-full rounded-2xl bg-foreground text-base text-background disabled:opacity-40"
            >
              Enviar al productor
            </Button>
          </>
        )}

        {step === "thanks" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-9 w-9 fill-terracota text-terracota" />
            </div>
            <div>
              <div className="serif text-2xl leading-tight">Cerraste el ciclo</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {primer} recibe tu nota junto con la cosecha de mañana. Así sigue la
                conversación entre tu mesa y el campo.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-left">
              <Row label="Calificación general" value={`${overall}★`} />
              {aspects.map(
                (a) =>
                  ratings[a.id] && (
                    <Row key={a.id} label={a.label} value={`${ratings[a.id]}★`} />
                  ),
              )}
              {photos.length > 0 && (
                <Row label="Evidencia" value={`${photos.length} foto${photos.length > 1 ? "s" : ""}`} />
              )}
              {tipMerma && <Row label="Merma reportada" value="Sí" />}
            </div>

            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-left">
              <div className="eyebrow text-primary">Impacto de esta canasta</div>
              <p className="serif mt-1 text-sm leading-relaxed">
                Apoyaste 98 km de cadena corta y evitaste ~1.2 kg de empaque
                industrializado. Gracias por sembrar confianza.
              </p>
            </div>

            <Link
              to="/consumidor"
              className="block h-14 rounded-2xl bg-foreground pt-4 text-base text-background"
            >
              Volver al mercado
            </Link>
          </div>
        )}

        {step === "confirm" && (
          <Link
            to="/consumidor/pedidos"
            className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Volver al seguimiento
          </Link>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="serif">{value}</span>
    </div>
  );
}

function CultivoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Leaf;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="serif text-sm leading-snug">{value}</div>
      </div>
    </div>
  );
}

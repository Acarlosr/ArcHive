"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type MeteredTool = {
  name: string;
  description: string;
  price: string;
  status: string;
  method: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
};

type TestState = {
  status: "idle" | "loading" | "ready" | "error";
  title: string;
  details: string;
  payload?: unknown;
};

function hasPayloadContent(payload: unknown) {
  if (payload === null || payload === undefined) {
    return false;
  }

  if (typeof payload === "string") {
    return payload.trim().length > 0;
  }

  if (typeof payload === "object") {
    return Object.keys(payload as Record<string, unknown>).length > 0;
  }

  return true;
}

function getPaymentSummary(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const accepts = Array.isArray(root.accepts) ? root.accepts : [];
  const first = accepts[0] as Record<string, unknown> | undefined;

  if (!first) {
    return null;
  }

  return {
    network: String(first.network ?? "Arc Testnet"),
    amount: String(first.maxAmountRequired ?? first.amount ?? "USDC payment required"),
    asset: String(first.asset ?? "USDC"),
    payTo: String(first.payTo ?? "seller wallet"),
  };
}

function formatPayload(payload: unknown) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export function MeteredToolTester({
  sellerBaseUrl,
  tools,
}: {
  sellerBaseUrl: string;
  tools: MeteredTool[];
}) {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const [results, setResults] = useState<Record<string, TestState>>({});

  const sellerHost = useMemo(() => {
    try {
      return new URL(sellerBaseUrl).host;
    } catch {
      return sellerBaseUrl;
    }
  }, [sellerBaseUrl]);

  async function testTool(tool: MeteredTool) {
    setResults((current) => ({
      ...current,
      [tool.name]: {
        status: "loading",
        title: isPt ? "Verificando rota x402" : "Checking x402 route",
        details: isPt ? "Chamando o serviço seller e lendo o requisito de pagamento." : "Calling the seller service and reading its payment requirement.",
      },
    }));

    try {
      const response = await fetch(`${sellerBaseUrl}${tool.path}`, {
        method: tool.method,
        headers: tool.method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: tool.method === "POST" ? JSON.stringify(tool.body ?? {}) : undefined,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
      const diagnosticPayload = hasPayloadContent(payload)
        ? payload
        : {
            status: response.status,
            statusText: response.statusText,
            method: tool.method,
            endpoint: `${sellerBaseUrl}${tool.path}`,
            seller: new URL(sellerBaseUrl).host,
            expected: isPt ? "autorização de pagamento x402 exigida antes do retorno dos dados" : "x402 payment authorization required before data is returned",
          };

      if (response.status === 402) {
        const payment = getPaymentSummary(payload);

        setResults((current) => ({
          ...current,
          [tool.name]: {
            status: "ready",
            title: isPt ? "pagamento x402 exigido" : "x402 payment required",
            details: payment
              ? isPt
                ? `${tool.price} em ${payment.network}. A autorização do comprador é necessária antes da tool retornar dados.`
                : `${tool.price} on ${payment.network}. Buyer authorization is required before the tool returns data.`
              : isPt
                ? `${tool.price}. A autorização do comprador é necessária antes da tool retornar dados.`
                : `${tool.price}. Buyer authorization is required before the tool returns data.`,
            payload: diagnosticPayload,
          },
        }));
        return;
      }

      if (!response.ok) {
        setResults((current) => ({
          ...current,
          [tool.name]: {
            status: "error",
            title: isPt ? `Seller retornou ${response.status}` : `Seller returned ${response.status}`,
            details: isPt ? "A rota respondeu, mas não com o requisito de pagamento x402 esperado." : "The route responded, but not with the expected x402 payment requirement.",
            payload: diagnosticPayload,
          },
        }));
        return;
      }

      setResults((current) => ({
        ...current,
        [tool.name]: {
          status: "ready",
          title: isPt ? "Resposta da tool recebida" : "Tool response received",
          details: isPt ? "O seller retornou dados. Isso geralmente significa que a requisição já estava autorizada." : "The seller returned data. This usually means the request was already authorized.",
          payload: diagnosticPayload,
        },
      }));
    } catch (error) {
      setResults((current) => ({
        ...current,
        [tool.name]: {
          status: "error",
          title: isPt ? "Não foi possível acessar o seller" : "Unable to reach seller",
          details:
            error instanceof Error
              ? error.message
              : isPt
                ? "O seller pode ainda estar acordando no Render Free. Tente novamente em um minuto."
                : "The seller may still be waking up on Render Free. Try again in a minute.",
        },
      }));
    }
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tools.map((tool) => {
        const result = results[tool.name];
        const isLoading = result?.status === "loading";

        return (
          <article
            key={tool.name}
            className="flex min-h-[330px] flex-col rounded-lg border border-arc-border bg-arc-card/85 p-5 transition-all hover:border-arc-cyan/35 hover:shadow-[0_0_32px_rgba(0,212,255,0.08)]"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-arc-text">{tool.name}</h2>
              <span className="rounded-full border border-arc-cyan/25 bg-arc-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-cyan">
                {tool.status}
              </span>
            </div>

            <p className="text-sm leading-6 text-arc-muted">{tool.description}</p>

            <div className="mt-auto pt-6">
              <div className="mb-4 rounded-md border border-arc-border bg-arc-surface/70 p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
                  {isPt ? "Preço" : "Price"}
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-arc-green">
                  {tool.price}
                </div>
                <div className="mt-1 text-xs text-arc-muted">{isPt ? "por chamada via" : "per call via"} {sellerHost}</div>
              </div>

              <button
                type="button"
                onClick={() => testTool(tool)}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-lg border border-arc-green/30 bg-arc-green/10 px-4 py-2.5 text-sm font-semibold text-arc-green transition-colors hover:bg-arc-green hover:text-arc-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (isPt ? "Testando rota..." : "Testing Route...") : (isPt ? "Testar Tool" : "Test Tool")}
              </button>

              {result ? (
                <div
                  className={`mt-4 rounded-md border p-3 ${
                    result.status === "error"
                      ? "border-red-500/30 bg-red-500/10"
                      : "border-arc-cyan/25 bg-arc-cyan/10"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold ${
                      result.status === "error" ? "text-red-200" : "text-arc-cyan"
                    }`}
                  >
                    {result.title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-arc-muted">{result.details}</p>
                  {result.payload ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-[0.12em] text-arc-dim">
                        {isPt ? "Ver resposta" : "View response"}
                      </summary>
                      <pre className="mt-2 max-h-40 overflow-auto rounded border border-arc-border bg-arc-bg/80 p-2 text-[11px] leading-5 text-arc-muted">
                        {formatPayload(result.payload)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}

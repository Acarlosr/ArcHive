// src/app/pay/[id]/page.tsx
// Public payment page — anyone with the link can pay.
// No account required for the payer.

import { PayCard } from "@/components/PayCard";

interface Props {
  params: { id: string };
}

export default function PayPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-[#080c10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
          <span className="font-display font-bold text-[#e8f0f8] tracking-tight">
            PayVeil
          </span>
          <span className="ml-auto text-xs font-mono text-[#4d6a85]">
            Arc Testnet
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#0d1218] border border-[#1e2d40] rounded-2xl p-6 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          <PayCard linkId={params.id} />
        </div>

        <p className="text-center text-xs text-[#4d6a85] mt-4 font-mono">
          Powered by Arc Unified Balance · Circle CCTP
        </p>
      </div>
    </main>
  );
}

"use client";
// src/components/FeeBreakdown.tsx

import type { SpendEstimate } from "@/lib/arc/unifiedBalance";

interface FeeBreakdownProps {
  amount: string;
  estimate: SpendEstimate | null;
  isLoading: boolean;
}

export function FeeBreakdown({ amount, estimate, isLoading }: FeeBreakdownProps) {
  const rows = [
    {
      label: "Payment amount",
      value: `$${parseFloat(amount).toFixed(2)}`,
      highlight: false,
    },
    {
      label: "Bridge fee (CCTP)",
      value: isLoading
        ? "…"
        : estimate
        ? `$${estimate.fees.gatewayFee}`
        : "—",
      highlight: false,
    },
    {
      label: "PayVeil fee (0.5%)",
      value: isLoading
        ? "…"
        : estimate
        ? `$${estimate.fees.customFee}`
        : "—",
      highlight: false,
    },
    {
      label: "Total you pay",
      value: isLoading
        ? "…"
        : estimate
        ? `$${estimate.totalYouPay}`
        : `~$${parseFloat(amount).toFixed(2)}`,
      highlight: true,
    },
  ];

  return (
    <div className="bg-[#080c10] border border-[#1e2d40] rounded-xl p-4 space-y-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex justify-between items-center text-sm ${
            row.highlight
              ? "border-t border-[#1e2d40] pt-2 mt-2 font-semibold text-[#e8f0f8]"
              : "text-[#8fa8c0]"
          }`}
        >
          <span>{row.label}</span>
          <span
            className={`font-mono text-xs ${
              row.highlight ? "text-[#00e5a0]" : ""
            }`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

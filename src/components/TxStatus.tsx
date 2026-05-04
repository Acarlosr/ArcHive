"use client";
// src/components/TxStatus.tsx

interface TxStatusProps {
  status: "bridging" | "spending" | "confirming" | "success" | "error";
  title: string;
  sub: string;
  txHash: string | null;
  explorerUrl: string | null;
  error: string | null;
}

export function TxStatus({
  status,
  title,
  sub,
  txHash,
  explorerUrl,
  error,
}: TxStatusProps) {
  const isSuccess = status === "success";
  const isError = status === "error";
  const isLoading = !isSuccess && !isError;

  return (
    <div className="flex flex-col items-center py-8 text-center gap-4">
      {/* Icon */}
      {isLoading && (
        <div className="w-14 h-14 rounded-full border-2 border-[#1e2d40] border-t-[#00d4ff] animate-spin" />
      )}
      {isSuccess && (
        <div className="w-14 h-14 rounded-full bg-[#00e5a0]/10 border-2 border-[#00e5a0] flex items-center justify-center text-[#00e5a0] text-2xl animate-[scalePop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
          ✓
        </div>
      )}
      {isError && (
        <div className="w-14 h-14 rounded-full bg-[#ff4d6a]/10 border-2 border-[#ff4d6a] flex items-center justify-center text-[#ff4d6a] text-2xl">
          ✕
        </div>
      )}

      {/* Text */}
      <div>
        <div className="font-bold text-lg text-[#e8f0f8]">{title}</div>
        <div className="text-sm text-[#8fa8c0] mt-1">{sub}</div>
        {error && (
          <div className="text-xs text-[#ff4d6a] mt-2 bg-[#ff4d6a]/10 border border-[#ff4d6a]/20 rounded-lg px-3 py-2 max-w-xs mx-auto">
            {error}
          </div>
        )}
      </div>

      {/* Explorer link */}
      {txHash && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[#00d4ff] hover:underline break-all max-w-xs"
        >
          {txHash.slice(0, 18)}…{txHash.slice(-8)} →
        </a>
      )}
    </div>
  );
}

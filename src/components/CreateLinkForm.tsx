"use client";
// src/components/CreateLinkForm.tsx
// Form to generate a PayVeil payment link.
// On submit → saves to Supabase → returns the shareable URL.

import { useState } from "react";
import { useAccount } from "wagmi";
import { createLink } from "@/lib/db/links";

const CHAINS = ["Ethereum", "Base", "Arbitrum", "Arc"] as const;

const EXPIRY_OPTIONS = [
  { value: "", label: "Never expires" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

function getExpiryDate(value: string): string | null {
  if (!value) return null;
  const now = new Date();
  if (value === "24h") now.setHours(now.getHours() + 24);
  if (value === "7d") now.setDate(now.getDate() + 7);
  if (value === "30d") now.setDate(now.getDate() + 30);
  return value ? now.toISOString() : null;
}

export function CreateLinkForm() {
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientWallet, setRecipientWallet] = useState(address ?? "");
  const [selectedChains, setSelectedChains] = useState<string[]>([
    "Ethereum",
    "Base",
    "Arc",
  ]);
  const [expiry, setExpiry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleChain(chain: string) {
    setSelectedChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected || !address) return;
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!recipientWallet.startsWith("0x")) {
      setError("Enter a valid wallet address");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const link = await createLink({
        amount: parseFloat(amount).toFixed(2),
        description: description || "Payment request",
        recipient_wallet: recipientWallet.toLowerCase(),
        creator_wallet: address.toLowerCase(),
        accepted_chains: selectedChains,
        expiry: getExpiryDate(expiry),
      });

      const url = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${link.id}`;
      setGeneratedLink(url);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create link");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setGeneratedLink(null);
    setAmount("");
    setDescription("");
    setCopied(false);
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12 text-[#8fa8c0]">
        Connect your wallet to create a payment link.
      </div>
    );
  }

  if (generatedLink) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0a1a12] border border-[#00e5a0]/20">
          <div className="w-8 h-8 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/30 flex items-center justify-center text-[#00e5a0] text-sm">
            ✓
          </div>
          <div>
            <div className="font-semibold text-[#00e5a0] text-sm">
              Link generated!
            </div>
            <div className="text-xs text-[#8fa8c0]">
              Share this link to receive ${parseFloat(amount).toFixed(2)} USDC
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0d1218] border border-[#1e2d40]">
          <code className="flex-1 text-xs text-[#00d4ff] overflow-hidden text-ellipsis whitespace-nowrap font-mono">
            {generatedLink}
          </code>
          <button
            onClick={copyLink}
            className={`shrink-0 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
              copied
                ? "border-[#00e5a0] text-[#00e5a0]"
                : "border-[#243346] text-[#8fa8c0] hover:border-[#00d4ff] hover:text-[#00d4ff]"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <button
          onClick={reset}
          className="w-full py-3 rounded-lg border border-[#1e2d40] text-[#8fa8c0] text-sm hover:border-[#243346] transition-colors"
        >
          Create another link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#4d6a85] uppercase tracking-widest">
          Amount (USDC)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6a85] font-mono text-sm">
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            min="1"
            step="0.01"
            required
            className="w-full pl-7 pr-4 py-2.5 bg-[#141c26] border border-[#1e2d40] rounded-lg text-[#e8f0f8] text-sm focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/10 transition-all"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#4d6a85] uppercase tracking-widest">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Logo design — Project X"
          className="w-full px-3 py-2.5 bg-[#141c26] border border-[#1e2d40] rounded-lg text-[#e8f0f8] text-sm focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/10 transition-all"
        />
      </div>

      {/* Recipient wallet */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#4d6a85] uppercase tracking-widest">
          Recipient Wallet
        </label>
        <input
          type="text"
          value={recipientWallet}
          onChange={(e) => setRecipientWallet(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2.5 bg-[#141c26] border border-[#1e2d40] rounded-lg text-[#e8f0f8] text-sm font-mono focus:outline-none focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/10 transition-all"
        />
        {address && (
          <button
            type="button"
            onClick={() => setRecipientWallet(address)}
            className="text-xs text-[#00d4ff] hover:text-white transition-colors"
          >
            Use connected wallet
          </button>
        )}
      </div>

      {/* Accepted chains */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#4d6a85] uppercase tracking-widest">
          Accept from
        </label>
        <div className="flex flex-wrap gap-2">
          {CHAINS.map((chain) => (
            <button
              key={chain}
              type="button"
              onClick={() => toggleChain(chain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                selectedChains.includes(chain)
                  ? "bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]"
                  : "bg-[#141c26] border-[#1e2d40] text-[#8fa8c0] hover:border-[#243346]"
              }`}
            >
              {chain}
            </button>
          ))}
        </div>
      </div>

      {/* Expiry */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[#4d6a85] uppercase tracking-widest">
          Expiry
        </label>
        <select
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="w-full px-3 py-2.5 bg-[#141c26] border border-[#1e2d40] rounded-lg text-[#e8f0f8] text-sm focus:outline-none focus:border-[#00d4ff] transition-all appearance-none cursor-pointer"
        >
          {EXPIRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-xs text-[#ff4d6a] bg-[#ff4d6a]/10 border border-[#ff4d6a]/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-[#00d4ff] text-[#080c10] rounded-lg font-display font-bold text-sm uppercase tracking-wide hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating..." : "Generate Payment Link"}
      </button>
    </form>
  );
}

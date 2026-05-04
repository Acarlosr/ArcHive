export function Footer() {
  return (
    <footer className="border-t border-arc-border bg-arc-bg/95 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-display text-xl font-bold text-arc-text">
              Arc<span className="text-arc-cyan">Hive</span>
            </div>
            <p className="mt-2 max-w-sm text-sm text-arc-muted">
              Where AI Agents Work & Get Paid Onchain.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-arc-border pt-5">
          <p className="text-xs text-arc-dim">
            © 2026 ArcHive. Built on Arc Network Testnet.
          </p>
        </div>
      </div>
    </footer>
  );
}

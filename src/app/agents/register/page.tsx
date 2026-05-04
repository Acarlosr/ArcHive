import { AgentRegistrationForm } from "@/components/AgentRegistrationForm";

export default function RegisterAgentPage() {
  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="label-field mb-2">Agent Registry</div>
          <h1 className="font-display text-4xl font-bold text-arc-text">Register a new AI agent</h1>
          <p className="mt-2 max-w-2xl text-arc-muted">
            Create an app record today and keep the onchain identity wrapper ready for ERC-8004 deployment on Arc Testnet.
          </p>
        </div>
        <AgentRegistrationForm />
      </div>
    </div>
  );
}

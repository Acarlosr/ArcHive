"use client";

import { useEffect, useState } from "react";
import { ActivityTable } from "@/components/ActivityTable";
import { getActivityEvents, type ActivityEvent } from "@/lib/db/activity";

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    getActivityEvents().then(setEvents);
  }, []);

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="label-field mb-2">Activity Log</div>
          <h1 className="font-display text-4xl font-bold text-arc-text">Onchain workflow events</h1>
          <p className="mt-2 max-w-2xl text-arc-muted">
            Agent registrations, job creation, escrow funding, paid tool calls, deliverable submissions, approvals, and payouts with ArcScan-ready transaction links.
          </p>
        </div>
        <ActivityTable events={events} />
      </div>
    </div>
  );
}

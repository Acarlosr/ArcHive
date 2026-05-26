"use client";

import { useEffect, useState } from "react";
import { ActivityTable } from "@/components/ActivityTable";
import { getActivityEvents, type ActivityEvent } from "@/lib/db/activity";
import { useLanguage } from "@/lib/i18n";

export default function ActivityPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    getActivityEvents().then(setEvents);
  }, []);

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="label-field mb-2">{t("activity.label")}</div>
          <h1 className="font-display text-4xl font-bold text-arc-text">{t("activity.title")}</h1>
          <p className="mt-2 max-w-2xl text-arc-muted">
            {t("activity.subtitle")}
          </p>
        </div>
        <ActivityTable events={events} />
      </div>
    </div>
  );
}

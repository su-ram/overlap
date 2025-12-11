import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { AvailabilitySnapshot } from "@/types/event";

type Options = {
  eventId: string;
};

export function useRealtimeAvailability({ eventId }: Options) {
  const [snapshots, setSnapshots] = useState<AvailabilitySnapshot[]>([]);

  useEffect(() => {
    let active = true;

    const fetchInitial = async () => {
      const { data, error } = await supabaseClient
        .from("availability_snapshots")
        .select("*")
        .eq("event_id", eventId);

      if (!active) return;
      if (error) {
        console.warn("Failed to fetch availability", error);
        return;
      }
      setSnapshots(
        (data as any[] | null)?.map((row) => ({
          eventId: row.event_id,
          participantId: row.participant_id,
          slots: row.slots,
        })) ?? [],
      );
    };

    fetchInitial();

    const channel = supabaseClient
      .channel(`availability:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability_snapshots",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (!active) return;
          const row: any = payload.new ?? payload.old;
          if (!row) return;
          setSnapshots((prev) => {
            const rest = prev.filter(
              (p) => !(p.eventId === row.event_id && p.participantId === row.participant_id),
            );
            return [
              ...rest,
              {
                eventId: row.event_id,
                participantId: row.participant_id,
                slots: row.slots,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabaseClient.removeChannel(channel);
    };
  }, [eventId]);

  return { snapshots };
}



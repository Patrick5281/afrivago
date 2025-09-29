import { useEffect } from "react";
import { supabase } from "@/config/supabase-config";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type RealtimePayload<T> = {
  new: T;
  old: T | null;
  eventType: "INSERT" | "UPDATE" | "DELETE";
};

export const useRealtimeSubscription = <T extends Record<string, any>>(
  table: string,
  filter: Record<string, any>,
  callback: (payload: RealtimePayload<T>) => void
) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: Object.entries(filter)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join("&")
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const transformedPayload: RealtimePayload<T> = {
            new: payload.new as T,
            old: payload.old as T | null,
            eventType: payload.eventType,
          };
          callback(transformedPayload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter, callback]);
}; 
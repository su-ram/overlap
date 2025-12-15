import { supabaseClient } from "./supabaseClient";

export const supabase = supabaseClient;

export async function fetchTopTimeslots(
  moimId: string,
  year: number,
  month: number
) {
  const { data, error } = await supabase.rpc(
    "get_top_timeslots",
    {
      p_moim_id: moimId,
      p_year: year,
      p_month: month,
    }
  );

  if (error) throw error;
  return data;
}


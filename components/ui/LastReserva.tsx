import React from "react";

import { createClient } from "@/utils/supabase/server";

export default async function LastReserva() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("reserva").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>;
}
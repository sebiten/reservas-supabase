import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import LastReserva from "@/components/ui/LastReserva";
import Reserva from "@/components/ui/Reserva";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Index() {
  return (
    <>
    <Reserva/>
    <LastReserva/>
    </>
  );
}

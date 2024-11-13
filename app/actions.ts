"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Reserva } from "@/components/ui/Reserva";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export async function subirReserva({
  date,
  name,
  email,
  phone,
  hour,
}: {
  date: Date;
  name: string;
  email: string;
  phone: string;
  hour: any;
}) {
  try {
    // Crear el cliente de Supabase
    const supabase = await createClient();

    // Convertir la fecha a formato 'YYYY-MM-DD'
    const formattedDate = date.toISOString().split("T")[0];

    // Verificar si ya existe una reserva para la misma fecha
    const { data: existingReservation, error: errorFetch } = await supabase
      .from("reserva")
      .select("*")
      .eq("date", formattedDate)
      .eq("hour", hour)
      .limit(1);

    if (errorFetch) {
      throw new Error(
        `Error al verificar reserva existente: ${errorFetch.message}`
      );
    }

    // Si ya existe una reserva, devolver error
    if (existingReservation && existingReservation.length > 0) {
      return {
        success: false,
        message: "Ya existe una reserva para esta fecha.",
      };
    }

    // Insertar la nueva reserva
    const { data, error } = await supabase
      .from("reserva")
      .insert([
        {
          date: formattedDate,
          name,
          email,
          phone,
          hour: String(hour),
        },
      ])
      .select();

    if (error) {
      throw new Error(`Error al insertar reserva: ${error.message}`);
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
export async function obtenerReservas(): Promise<Reserva[]> {
  try {
    const supabase = await createClient();

    // Obtener todas las reservas de la base de datos
    const { data: reservas, error } = await supabase
      .from("reserva")
      .select("*");

    if (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }

    // Convertir las fechas obtenidas en formato string a objetos Date y formatearlas correctamente
    return reservas.map((reserva) => ({
      date: new Date(reserva.date), // Convertir la fecha a un objeto Date
      hour: reserva.hour,
      name: reserva.name,
      email: reserva.email,
      phone: reserva.phone,
    }));
  } catch (err: any) {
    throw new Error(`Error al obtener reservas: ${err.message}`);
  }
}

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

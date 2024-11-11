"use client";
import React from "react";
import { z } from "zod";
import { Calendar } from "./calendar";
import { subirReserva } from "@/app/actions";

// Esquema de validación
const reservationSchema = z.object({
  date: z.date().refine((d) => d >= new Date(), {
    message: "La fecha no puede estar en el pasado",
  }),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Debe ser un correo válido" }),
  phone: z.string().regex(/^\d{10,15}$/, {
    message: "Debe ser un número de teléfono válido (10-15 dígitos)",
  }),
});

export default function Reserva() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessages([]); // Limpiar errores previos

    try {
      // Validar datos
      reservationSchema.parse({ date, name, email, phone });

      // Llamar al Server Action para subir la reserva
      const response = await subirReserva({ date: date!, name, email, phone });

      if (response.success) {
        alert("Reserva creada exitosamente.");
      } else {
        alert(`Error al crear reserva: ${response.message}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorMessages(error.errors.map((err) => err.message));
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label
          htmlFor="selectedDate"
          className="block text-sm font-medium text-gray-700"
        >
          Fecha seleccionada:
        </label>
        <input
          type="text"
          id="selectedDate"
          name="selectedDate"
          value={date ? date.toLocaleDateString() : ""}
          readOnly
          className="mt-1 p-2 border rounded-md w-full"
        />
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 p-2 bg-blue-500 text-white rounded-md"
        >
          Reservar
        </button>
      </form>
      {/* Mensajes de error */}
      {errorMessages.length > 0 && (
        <div className="mt-4 text-red-600">
          <ul>
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { z } from "zod";

export const appointmentSchema = z.object({
  customerId: z.string().uuid("Selecciona un cliente"),
  barberId: z.string().uuid("Selecciona un barbero"),
  serviceId: z.string().uuid("Selecciona un servicio"),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().trim().optional(),
});

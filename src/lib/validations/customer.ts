import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Introduce el nombre del cliente"),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .email("Introduce un email válido")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

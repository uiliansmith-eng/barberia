import { z } from "zod";

export const barberSchema = z.object({
  fullName: z.string().trim().min(2, "Introduce el nombre del barbero"),
  specialty: z.string().trim().optional(),
  commissionPct: z.coerce
    .number()
    .min(0, "La comisión no puede ser negativa")
    .max(100, "La comisión no puede superar el 100%"),
  status: z.enum(["active", "inactive"]),
});

export const scheduleDaySchema = z.object({
  weekday: z.number().min(0).max(6),
  enabled: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

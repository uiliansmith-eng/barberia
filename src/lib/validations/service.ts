import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Introduce el nombre del servicio"),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(5, "La duración mínima es 5 minutos")
    .max(480, "La duración máxima es 480 minutos"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  status: z.enum(["active", "inactive"]),
});

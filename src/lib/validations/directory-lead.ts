import { z } from "zod";

export const directoryLeadSchema = z.object({
  businessName: z.string().trim().min(2, "Introduce el nombre de la barbería"),
  contactName: z.string().trim().min(2, "Introduce tu nombre"),
  phone: z.string().trim().min(6, "Introduce un teléfono válido"),
  email: z.string().trim().email("Introduce un email válido"),
  address: z.string().trim().min(4, "Introduce la dirección (calle y número)"),
  city: z.string().trim().optional(),
  source: z.enum(["owner", "team"]),
  notes: z.string().trim().optional(),
  serviceNames: z.array(z.string().trim()).default([]),
  servicePrices: z.array(z.string().trim()).default([]),
});

import { z } from "zod";

export const onboardingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Introduce el nombre de tu barbería"),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

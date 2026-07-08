import { z } from "zod";

export const inventoryItemSchema = z
  .object({
    name: z.string().trim().min(2, "Introduce el nombre del producto"),
    stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
    unit: z.string().trim().min(1, "Introduce una unidad").default("uds"),
    lowStockThreshold: z.coerce
      .number()
      .int()
      .min(0, "El umbral no puede ser negativo"),
    mediumStockThreshold: z.coerce
      .number()
      .int()
      .min(0, "El umbral no puede ser negativo"),
  })
  .refine((data) => data.mediumStockThreshold >= data.lowStockThreshold, {
    message: "El umbral medio debe ser mayor o igual que el bajo",
    path: ["mediumStockThreshold"],
  });

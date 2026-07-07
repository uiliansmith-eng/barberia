import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Introduce tu nombre completo"),
  email: z.string().trim().email("Introduce un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Introduce un email válido"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

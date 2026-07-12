import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("El correo electronico no es valido."),
    password: z.string().min(1, "La contrasena es requerida.")
  })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

import { z } from 'zod';

// Esquema base para usuario
const userSchema = z.object({
  user_username: z.string()
    .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre de usuario no puede exceder los 50 caracteres" }),
  user_name: z.string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre no puede exceder los 50 caracteres" }),
  user_surname: z.string()
    .min(3, { message: "Los apellidos deben tener al menos 3 caracteres" })
    .max(100, { message: "Los apellidos no pueden exceder los 100 caracteres" }),
  user_dni: z.string()
    .regex(/^[0-9]{8}[A-Za-z]{1}$/, { message: "El DNI debe tener 8 números y 1 letra" }),
  user_password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100, { message: "La contraseña no puede exceder los 100 caracteres" })
});

// Esquema para creación de usuario
export const createUserSchema = userSchema;

// Esquema para actualización de usuario
export const updateUserSchema = userSchema.partial().refine(data => {
  return Object.keys(data).length > 0;
}, { message: "Debe proporcionar al menos un campo para actualizar" });

// Esquema para ID de usuario
export const userIdSchema = z.object({
  id: z.string().regex(/^[0-9]+$/).transform(Number)
});

// Tipo inferido para TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
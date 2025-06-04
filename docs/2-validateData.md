# Integración de Validación de Datos con Zod

Voy a guiarte paso a paso para integrar un sistema de validación de datos usando Zod, que es una de las mejores librerías para validación en TypeScript. Esto se integrará perfectamente con el código que ya tenemos.

## Paso 1: Instalar Zod

Primero, instala Zod como dependencia:

```bash
npm install zod
```

## Paso 2: Crear esquemas de validación

Crea un nuevo archivo `src/validations/userValidation.ts`:

```typescript
import { z } from 'zod';

// Esquema base para usuario
const userSchema = z.object({
  user_name: z.string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(50, { message: "El nombre no puede exceder los 50 caracteres" }),
  user_email: z.string()
    .email({ message: "Debe ser un email válido" }),
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
export const userIdSchema = z.number().int().positive();

// Tipo inferido para TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

## Paso 3: Crear middleware de validación

Crea un nuevo archivo `src/middlewares/validate.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
```

## Paso 4: Actualizar las rutas para usar validación

Modifica `src/routes/userRoutes.ts`:

```typescript
import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { validate } from '../middlewares/validate';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validations/userValidation';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', validate({ params: userIdSchema }), getUser);
router.post('/', validate({ body: createUserSchema }), createUser);
router.put('/:id', validate({ params: userIdSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', validate({ params: userIdSchema }), deleteUser);

export default router;
```

## Paso 5: Actualizar los controladores

Modifica `src/controllers/userController.ts` para usar los tipos de Zod:

```typescript
import { Request, Response } from 'express';
import * as userModel from '../models/user';
import { CreateUserInput, UpdateUserInput } from '../validations/userValidation';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id; // Ya validado por Zod
  try {
    const user = await userModel.getUserById(Number(id));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: CreateUserInput = req.body; // Ya validado por Zod
    const createdUser = await userModel.createUser(userData);
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id; // Ya validado por Zod
  try {
    const userData: UpdateUserInput = req.body; // Ya validado por Zod
    const updatedUser = await userModel.updateUser(Number(id), userData);
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id; // Ya validado por Zod
  try {
    const user = await userModel.getUserById(Number(id));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userModel.deleteUser(Number(id));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
```

## Paso 6: Actualizar el modelo para usar los tipos

Modifica `src/models/user.ts`:

```typescript
import pool from '../db/db';
import { CreateUserInput, UpdateUserInput } from '../validations/userValidation';

export interface User {
  id?: number;
  user_name: string;
  user_password: string;
  user_email: string;
  created_at?: Date;
}

export const createUser = async (user: CreateUserInput): Promise<User> => {
  const { user_name, user_password, user_email } = user;
  const result = await pool.query(
    'INSERT INTO users (user_name, user_password, user_email) VALUES ($1, $2, $3) RETURNING *',
    [user_name, user_password, user_email]
  );
  return result.rows[0];
};

// ... (el resto de las funciones del modelo permanecen igual)
```

## Paso 7: Probar la validación

Ahora puedes probar los endpoints con datos inválidos para ver cómo responde:

### 1. **Crear usuario con email inválido**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"user_name":"test", "user_password":"123", "user_email":"not-an-email"}' http://localhost:3000/api/users
```

Deberías recibir un error 400 con los detalles de validación.

### 2. **Actualizar usuario sin campos**

```bash
curl -X PUT -H "Content-Type: application/json" -d '{}' http://localhost:3000/api/users/1
```

Deberías recibir un error indicando que debes proporcionar al menos un campo.

## Paso 8: Mejoras adicionales (opcionales)

1. **Mensajes de error personalizados**: Puedes personalizar aún más los mensajes de error en los esquemas de Zod.
2. **Validación asíncrona**: Zod soporta validación asíncrona para verificar, por ejemplo, si un email ya existe en la base de datos.
3. **Transformación de datos**: Puedes usar Zod para transformar datos (por ejemplo, trimear strings o convertir a minúsculas).

Ejemplo de validación asíncrona para verificar email único:

```typescript
// En src/validations/userValidation.ts
export const createUserSchema = userSchema.refine(async data => {
  const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [data.user_email]);
  return user.rows.length === 0;
}, { message: "El email ya está en uso" });
```

# Implementación de Autenticación JWT

Guía paso a paso para implementar autenticación JWT que protegerá nuestros endpoints. Integraremos esto con todo el código existente, incluyendo la validación que ya implementamos.

## Paso 1: Instalar dependencias necesarias

```bash

npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

## Paso 2: Configurar variables de entorno adicionales

Actualiza tu archivo .env:

```env
JWT_SECRET=tu_super_secreto_complejo_aqui
JWT_EXPIRES_IN=1h
```

## Paso 3: Crear utilities para autenticación

Crea src/utils/auth.ts:

```typescript

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token: string): { id: number } => {
  return jwt.verify(token, JWT_SECRET) as { id: number };
};
```

## Paso 4: Crear middleware de autenticación

Crea src/middlewares/auth.ts:

```typescript

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Añade el usuario decodificado al request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};
```

## Paso 5: Actualizar el modelo de usuario para usar hashing

Modifica src/models/user.ts:

```typescript

import pool from '../db/db';
import { hashPassword } from '../utils/auth';
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
  const hashedPassword = await hashPassword(user_password);
  
  const result = await pool.query(
    'INSERT INTO users (user_name, user_password, user_email) VALUES ($1, $2, $3) RETURNING *',
    [user_name, hashedPassword, user_email]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
  return result.rows[0] || null;
};

// ... (resto de funciones permanecen igual, pero asegúrate de usar hashPassword en updateUser si actualiza la contraseña)

```

## Paso 6: Crear controladores de autenticación

Crea src/controllers/authController.ts:

```typescript

import { Request, Response } from 'express';
import * as userModel from '../models/user';
import { comparePasswords, generateToken } from '../utils/auth';
import { z } from 'zod';

const loginSchema = z.object({
  user_email: z.string().email(),
  user_password: z.string().min(6)
});

export const login = async (req: Request, res: Response) => {
  try {
    const { user_email, user_password } = loginSchema.parse(req.body);
    const user = await userModel.getUserByEmail(user_email);

    if (!user || !(await comparePasswords(user_password, user.user_password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id);
    
    res.status(200).json({
      id: user.id,
      user_name: user.user_name,
      user_email: user.user_email,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // req.user es añadido por el middleware de autenticación
    const user = await userModel.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // No devolver la contraseña
    const { user_password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};
```

## Paso 7: Crear rutas de autenticación

Crea src/routes/authRoutes.ts:

```typescript

import express from 'express';
import { login, getMe } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
```

## Paso 8: Actualizar rutas de usuario para protegerlas

Modifica src/routes/userRoutes.ts:

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
import { authenticate } from '../middlewares/auth';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validations/userValidation';

const router = express.Router();

// Protege todas las rutas excepto crear usuario
router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, validate({ params: userIdSchema }), getUser);
router.post('/', validate({ body: createUserSchema }), createUser);
router.put('/:id', authenticate, validate({ params: userIdSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', authenticate, validate({ params: userIdSchema }), deleteUser);

export default router;

Paso 9: Actualizar el servidor principal

Modifica src/index.ts para incluir las rutas de autenticación:
typescript

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API de Usuarios con PostgreSQL y Autenticación JWT');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

```

## Paso 10: Probar la autenticación

Registrar un nuevo usuario (ya protegido por validación):

```bash

curl -X POST -H "Content-Type: application/json" -d '{"user_name":"testuser", "user_password":"password123", "user_email":"test@example.com"}' http://localhost:3000/api/users
```

Iniciar sesión para obtener token:

```bash

curl -X POST -H "Content-Type: application/json" -d '{"user_email":"test@example.com", "user_password":"password123"}' http://localhost:3000/api/auth/login
```

Acceder a rutas protegidas (usar el token recibido):

```bash

curl -X GET -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" http://localhost:3000/api/users
```

Obtener información del usuario actual:

```bash

curl -X GET -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" http://localhost:3000/api/auth/me
```

## Paso 11: Mejoras adicionales (opcionales)

- Refresh Tokens: Implementar un sistema de refresh tokens para renovar el JWT sin requerir nuevo login.

- Roles y permisos: Añadir roles de usuario y control de acceso basado en roles.

- Rate limiting: Limitar intentos de login para prevenir ataques de fuerza bruta.

- Logout: Implementar lista negra de tokens para logout anticipado.

- Seguridad adicional: Añadir protección contra CSRF y CORS más estricta.

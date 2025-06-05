# Creación de una API con Node.js, TypeScript y PostgreSQL

Guía paso a paso en la creación de una API RESTful que se conecte a una base de datos PostgreSQL. Comenzaremos desde cero, incluyendo la configuración del proyecto, la conexión a la base de datos y la implementación de los endpoints CRUD para la tabla de usuarios.

## Paso 1: Configuración inicial del proyecto

### 1. Crea una nueva carpeta para tu proyecto y accede a ella

```bash
mkdir api-postgres-users
cd api-postgres-users
```

### 2. Inicializa un nuevo proyecto Node.js

Esto creará un archivo `package.json` con la configuración básica del proyecto.

```bash
npm init -y
```

### 3. Instala TypeScript como dependencia de desarrollo

Esto instalará TypeScript y las definiciones de tipos para Node.js.

```bash
npm install --save-dev typescript @types/node
```

### 4. Crea el archivo de configuración de TypeScript

```bash
npx tsc --init
```

### 5. Edita el archivo `tsconfig.json` generado para que tenga esta configuración

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Paso 2: Instalar dependencias principales

Instala las dependencias necesarias

```bash
npm install express pg cors dotenv
npm install --save-dev @types/express @types/pg @types/cors nodemon ts-node
```

## Paso 3: Configuración de scripts

En tu `package.json`, añade estos scripts:

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "nodemon src/index.ts",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## Paso 4: Estructura de archivos

Crea la siguiente estructura de archivos:

```bash
api-users/
├── src/
│   ├── controllers/
│   ├── db/
│   ├── models/
│   ├── routes/
│   ├── index.ts
├── .env
├── .gitignore
```

## Paso 5: Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_tu_base_de_datos
PORT=3000
```

Añade `.env` y `node_modules/` a tu `.gitignore`.

## Paso 6: Configuración de la base de datos PostgreSQL

### 1. Asegúrate de tener PostgreSQL instalado y funcionando

### 2. Crea una nueva base de datos y la tabla de usuarios

```sql
CREATE DATABASE nombre_de_tu_base_de_datos;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  user_password VARCHAR(100) NOT NULL,
  user_email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Paso 7: Configuración de la conexión a la base de datos

Crea `src/db/db.ts`:

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
```

## Paso 8: Creación del modelo de usuario

Crea `src/models/user.ts`:

```typescript
import pool from '../db/db';

export interface User {
  id?: number;
  user_name: string;
  user_password: string;
  user_email: string;
  created_at?: Date;
}

export const createUser = async (user: User): Promise<User> => {
  const { user_name, user_password, user_email } = user;
  const result = await pool.query(
    'INSERT INTO users (user_name, user_password, user_email) VALUES ($1, $2, $3) RETURNING *',
    [user_name, user_password, user_email]
  );
  return result.rows[0];
};

export const getUsers = async (): Promise<User[]> => {
  const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
  return result.rows;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateUser = async (id: number, user: User): Promise<User | null> => {
  const { user_name, user_password, user_email } = user;
  const result = await pool.query(
    'UPDATE users SET user_name = $1, user_password = $2, user_email = $3 WHERE id = $4 RETURNING *',
    [user_name, user_password, user_email, id]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
```

## Paso 9: Creación del controlador de usuarios

Crea `src/controllers/userController.ts`:

```typescript
import { Request, Response } from 'express';
import * as userModel from '../models/user';
import { User } from '../models/user';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const user = await userModel.getUserById(id);
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
  const { user_name, user_password, user_email } = req.body;
  
  if (!user_name || !user_password || !user_email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newUser: User = { user_name, user_password, user_email };
    const createdUser = await userModel.createUser(newUser);
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { user_name, user_password, user_email } = req.body;
  
  if (!user_name || !user_password || !user_email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user: User = { user_name, user_password, user_email };
    const updatedUser = await userModel.updateUser(id, user);
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
  const id = parseInt(req.params.id);
  try {
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await userModel.deleteUser(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
```

## Paso 10: Creación de las rutas

Crea `src/routes/userRoutes.ts`:

```typescript
import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
```

## Paso 11: Configuración del servidor Express

Crea `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API de Usuarios con PostgreSQL');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
```

## Paso 12: Ejecutar el proyecto

### 1. Para desarrollo (con recarga automática)

```bash
npm run dev
```

### 2. Para producción

```bash
npm run build
npm start
```

## Paso 13: Probar la API

Puedes probar los endpoints con Postman o cURL:

- **Obtener todos los usuarios**: `GET http://localhost:3000/api/users`
- **Obtener un usuario**: `GET http://localhost:3000/api/users/1`
- **Crear usuario**:

  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"user_name":"test", "user_password":"123", "user_email":"test@example.com"}' http://localhost:3000/api/users
  ```

- **Actualizar usuario**:

  ```bash
  curl -X PUT -H "Content-Type: application/json" -d '{"user_name":"updated", "user_password":"456", "user_email":"updated@example.com"}' http://localhost:3000/api/users/1
  ```

- **Eliminar usuario**:

  ```bash
  curl -X DELETE http://localhost:3000/api/users/1
  ```

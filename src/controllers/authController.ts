import { Request, Response } from 'express';
import * as userModel from '../models/user';
import { comparePasswords, generateToken } from '../utils/auth';
import { z } from 'zod';

const loginSchema = z.object({
  user_username: z.string().min(3),
  user_password: z.string().min(6)
});

export const login = async (req: Request, res: Response) => {
  try {
    const { user_username, user_password } = loginSchema.parse(req.body);
    const user = await userModel.getUserByUsername(user_username);

    if (!user || !(await comparePasswords(user_password, user.user_password))) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    if (!user.id) {
      res.status(500).json({ message: 'Error: ID de usuario no encontrado' });
      return;
    }

    const token = generateToken(user.id);
    
    res.status(200).json({
      id: user.id,
      user_username: user.user_username,
      user_name: user.user_name,
      user_surname: user.user_surname,
      user_role: user.user_role,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        status: 'error',
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }
    res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }
    
    const user = await userModel.getUserById(req.user.id);
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // No devolver la contraseña
    const { user_password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};
import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/user';
import { CreateUserInput, UpdateUserInput } from '../validations/userValidation';
import { User } from '../models/user';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await userModel.getUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = req.params.id; // Ya validado por Zod
  try {
    const user = await userModel.getUserById(Number(id));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userData: CreateUserInput = req.body; // Ya validado por Zod
    const createdUser = await userModel.createUser(userData);
    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = req.params.id; // Ya validado por Zod
  try {
    const user = await userModel.getUserById(Number(id));
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    await userModel.deleteUser(Number(id));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
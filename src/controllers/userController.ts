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
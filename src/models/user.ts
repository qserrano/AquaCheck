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
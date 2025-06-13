import pool from '../db/db';
import { hashPassword } from '../utils/auth';
import { CreateUserInput, UpdateUserInput } from '../validations/userValidation';

export interface User {
  id?: number;
  user_username: string;
  user_password: string;
  user_role: string;
  user_name: string;
  user_surname: string;
  user_dni: string;
  user_email: string;
  created_at?: Date;
}

export const createUser = async (user: CreateUserInput): Promise<User> => {
  const { user_username, user_password, user_name, user_surname, user_dni, user_email } = user;
  const hashedPassword = await hashPassword(user_password);
  
  const result = await pool.query(
    'INSERT INTO users (user_username, user_password, user_role, user_name, user_surname, user_dni, user_email, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
    [user_username, hashedPassword, 'usuario', user_name, user_surname, user_dni, user_email]
  );
  return result.rows[0];
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE user_username = $1', [username]);
  return result.rows[0] || null;
};

export const getUsers = async (): Promise<User[]> => {
  const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
  return result.rows;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateUser = async (id: number, user: UpdateUserInput): Promise<User | null> => {
  const { user_username, user_password, user_name, user_surname, user_dni } = user;
  const hashedPassword = user_password ? await hashPassword(user_password) : undefined;
  
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (user_username) {
    updateFields.push(`user_username = $${paramCount}`);
    values.push(user_username);
    paramCount++;
  }
  if (hashedPassword) {
    updateFields.push(`user_password = $${paramCount}`);
    values.push(hashedPassword);
    paramCount++;
  }
  if (user_name) {
    updateFields.push(`user_name = $${paramCount}`);
    values.push(user_name);
    paramCount++;
  }
  if (user_surname) {
    updateFields.push(`user_surname = $${paramCount}`);
    values.push(user_surname);
    paramCount++;
  }
  if (user_dni) {
    updateFields.push(`user_dni = $${paramCount}`);
    values.push(user_dni);
    paramCount++;
  }

  if (updateFields.length === 0) {
    return null;
  }

  values.push(id);
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteUser = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
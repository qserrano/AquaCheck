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

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, validate({ params: userIdSchema }), getUser);
router.post('/', validate({ body: createUserSchema }), createUser);
router.put('/:id', authenticate, validate({ params: userIdSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', authenticate, validate({ params: userIdSchema }), deleteUser);

export default router;
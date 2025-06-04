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
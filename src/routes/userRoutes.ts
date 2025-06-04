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
import { asyncHandler } from '../middlewares/asyncHandler';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', validate(userIdSchema), getUser);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate({ ...userIdSchema, ...updateUserSchema }), updateUser);
router.delete('/:id', validate(userIdSchema), deleteUser);

export default router;
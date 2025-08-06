import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  deleteAccount, 
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
} from '../controllers/user.controller.js';

const router = Router();

// Routes protégées par authentification
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.delete('/profile', verifyToken, deleteAccount);

// Routes admin
router.get('/all', verifyToken, requireAdmin, getAllUsers);
router.get('/:id', verifyToken, requireAdmin, getUserById);
router.put('/:id', verifyToken, requireAdmin, updateUserById);
router.delete('/:id', verifyToken, requireAdmin, deleteUserById);

export default router; 
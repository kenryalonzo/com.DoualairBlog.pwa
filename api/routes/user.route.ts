import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';
import { getUserProfile, updateUserProfile, deleteUser, getAllUsers } from '../controllers/user.controller.js';

const router = Router();

// Routes protégées par authentification
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.delete('/profile', verifyToken, deleteUser);

// Routes admin
router.get('/all', verifyToken, requireAdmin, getAllUsers);

export default router; 
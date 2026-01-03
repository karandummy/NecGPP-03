// backend/src/routes/user.routes.js
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMyBasicProfile,
  getMyCompleteProfile
} from '../controllers/user.controller.js';

import { distinctDepartments } from '../services/accessService.js';
const router = Router();

// All profile routes require login
router.use(protect);
router.get('/me/basic', getMyBasicProfile);
router.get('/me/complete', getMyCompleteProfile);
router.get('/departments', distinctDepartments);
export default router;
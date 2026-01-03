// backend/src/routes/tutor.routes.js
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/auth.middleware.js';

import {
  getMyTutorStudents,
  getUnassignedStudents,
  assignStudentToTutor,
  removeStudentFromTutor,
  bulkAssignStudentsToTutor
} from '../controllers/tutorward.controller.js';

const router = Router();

router.use(protect);
router.use(restrictTo('Staff'));



router.get('/my-students', getMyTutorStudents);
router.get('/unassigned', getUnassignedStudents);
router.post('/assign/bulk', bulkAssignStudentsToTutor); 
router.post('/assign/:studentId', assignStudentToTutor);// BONUS
router.delete('/remove/:studentId', removeStudentFromTutor);

export default router;
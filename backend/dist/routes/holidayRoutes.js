import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import { getHolidays, addHoliday, deleteHoliday, getMonthlyReportWithHolidays } from '../controllers/holidayController.js';
const router = Router();
// Get all holidays
router.get('/', authenticate, getHolidays);
// Add holiday (Admin only)
router.post('/', authenticate, requireAdmin, addHoliday);
// Delete holiday (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteHoliday);
// Get monthly report with holidays excluded
router.get('/report/class/:classId', authenticate, getMonthlyReportWithHolidays);
export default router;
//# sourceMappingURL=holidayRoutes.js.map
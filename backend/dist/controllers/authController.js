import AuthService from '../services/authService.js';
class AuthController {
    // ================= LOGIN =================
    login = async (req, res) => {
        try {
            const data = await AuthService.login(req.body.email, req.body.password);
            res.json({
                success: true,
                data,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= SUPERADMIN → CREATE ADMIN =================
    createAdmin = async (req, res) => {
        try {
            const data = await AuthService.createAdmin(req.body, req.user.id);
            res.json({
                success: true,
                message: "Admin created successfully",
                data,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= ADMIN → CREATE TEACHER =================
    createTeacher = async (req, res) => {
        try {
            const data = await AuthService.createTeacher(req.body, req.user.id);
            res.json({
                success: true,
                message: "Teacher created successfully",
                data,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= PUBLIC REGISTER =================
    publicRegister = async (req, res) => {
        try {
            const data = await AuthService.publicRegister(req.body);
            res.json({
                success: true,
                message: "Registered successfully (PENDING approval)",
                data,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= APPROVE / REJECT USER =================
    approveOrRejectUser = async (req, res) => {
        try {
            const { userId, action } = req.body;
            const data = await AuthService.approveOrRejectUser(Number(userId), action);
            res.json({
                success: true,
                message: `User ${action.toLowerCase()}d successfully`,
                data
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= ME =================
    getMe = async (req, res) => {
        try {
            const data = await AuthService.getMe(req.user.id);
            res.json({
                success: true,
                data,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= ALL USERS =================
    getAllUsers = async (_req, res) => {
        try {
            const data = await AuthService.getAllUsers();
            res.json({
                success: true,
                data,
                timestamp: new Date().toISOString()
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch users"
            });
        }
    };
    // ================= UPDATE USER =================
    updateUser = async (req, res) => {
        try {
            const data = await AuthService.updateUser(Number(req.params.id), req.body);
            res.json({
                success: true,
                message: "User updated successfully",
                data
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
    // ================= DELETE USER =================
    deleteUser = async (req, res) => {
        try {
            await AuthService.deleteUser(Number(req.params.id));
            res.json({
                success: true,
                message: "User deleted successfully"
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message
            });
        }
    };
}
export default new AuthController();
//# sourceMappingURL=authController.js.map
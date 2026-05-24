import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    async sendEmail(to, subject, text, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"School System" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html: html || text
            });
            logger.info(`Email sent to ${to}: ${info.messageId}`);
            return info;
        }
        catch (error) {
            logger.error(`Failed to send email to ${to}:`, error);
            throw new Error('Email sending failed');
        }
    }
    async sendWelcomeEmail(to, name) {
        return this.sendEmail(to, 'Welcome to School Management System', `Hello ${name},\n\nYour account has been created successfully.\n\nPlease login to access the system.`);
    }
}
export default new EmailService();
//# sourceMappingURL=emailService.js.map
declare class EmailService {
    private transporter;
    constructor();
    sendEmail(to: string, subject: string, text: string, html?: string): Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
    sendWelcomeEmail(to: string, name: string): Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
}
declare const _default: EmailService;
export default _default;

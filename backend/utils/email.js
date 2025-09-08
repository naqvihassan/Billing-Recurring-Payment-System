const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password',
    },
});

async function sendInvoiceEmail({ to, subject, html }) {
    if (process.env.EMAIL_ENABLED === "false") {
        console.log(`[EMAIL DISABLED] Would send to: ${to}, subject: ${subject}`);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to,
        subject,
        html,
    };
    return transporter.sendMail(mailOptions);
}

module.exports = { sendInvoiceEmail };

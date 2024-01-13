const nodemailer = require('nodemailer');
require('dotenv').config(); 

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    try {
        await transporter.sendMail(message);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
};

module.exports = sendEmail;

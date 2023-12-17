import nodemailer from 'nodemailer'
import { dev } from '../config';
import { EmaileDataType } from '../types';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: dev.app.smtpUsername,
      pass: dev.app.smtpPassword
    }
  });



export const handleSendEmail = async (emailData: EmaileDataType) => {
    try {
        const mailOptions = {
            from: dev.app.smtpUsername, 
            to: emailData.email, 
            subject: emailData.subject, 
            html: emailData.html,
        }
        const info = await transporter.sendMail(mailOptions)
        console.log('message sent: ' + info.response);
    } catch (error) {
        console.log('Error encountered while sending email', error);
        throw error
    }
}

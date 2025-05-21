import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
        user: 'contact@pathpr.ca', 
        pass: 'J@yswam1narayan', 
    },
});

export default transporter;
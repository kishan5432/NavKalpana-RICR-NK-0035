const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // Use SendGrid if API key is available, otherwise use Gmail
  const transporter = process.env.SENDGRID_API_KEY
    ? nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      })
    : nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        family: 4
      });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });

  return info;
};

module.exports = sendEmail;

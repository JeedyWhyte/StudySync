const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });

    if (error) {
        console.error('Email send error:', error);
        throw new Error('Failed to send email');
    }

    return data;
};

module.exports = { sendEmail };
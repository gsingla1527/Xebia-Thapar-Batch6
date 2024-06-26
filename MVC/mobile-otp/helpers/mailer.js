const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    //according to google smtp
    host: process.env.SMTP_HOST,
    post: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,

    }
});

const sendMail = async (email, subject, content) => {

    try {
        mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: subject,
            html: content
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            console.log('Verification mail sent ', info.messageId)
        });

    }
    catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    sendMail
}
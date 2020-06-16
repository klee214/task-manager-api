const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail = async (email, name)=>{
    await sgMail.send({
        to: email,
        from: 'klee214@myseneca.ca',
        subject: 'Sending with Twilio SendGrid is Fun',
        text: `Welcome to the app ${name}.`
    });
}

const sendCancelEmail = async (email, name)=>{
    await sgMail.send({
        to: email,
        from: 'klee214@myseneca.ca',
        subject: 'Sending with Twilio SendGrid is Fun',
        text: `Success of removing your account. Goodbye ${name}.`
    });
}

module.exports = {sendCancelEmail ,sendWelcomeEmail};
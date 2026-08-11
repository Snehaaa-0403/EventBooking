import sgMail from '@sendgrid/mail';


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (toEmail, otp) => {
    const msg = {
        to: toEmail,
        from: process.env.EMAIL_USER, 
        subject: 'Your EventBooking OTP Code',
        text: `Your OTP code is: ${otp}. It is valid for a 5 minutes.`,
        html: `<strong>Your OTP code is: ${otp}</strong>`,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error('Error sending email with SendGrid:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

export default sendEmail;


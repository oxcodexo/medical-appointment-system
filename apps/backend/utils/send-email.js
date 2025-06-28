const nodemailer = require('nodemailer');

const sendEmail = async (patientEmail,patientName,appointmentDate,doctorName) => {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD || !process.env.APP_NAME) {
      console.error('GMAIL_USER or GMAIL_PASSWORD or APP_NAME not found in environment variables');
      return;
    }

    console.log('Sending email to:', patientEmail, patientName, appointmentDate, doctorName);

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.GMAIL_EMAIL}>`,
        to: patientEmail,
        subject: 'Your Appointment is Confirmed!',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                <h2>Appointment Confirmation</h2>
            </div>
            <div style="padding: 20px;">
                <p>Hi <strong>${patientName}</strong>,</p>
                <p>We're pleased to let you know that your appointment has been confirmed.</p>
                <table style="width: 100%; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px 0;"><strong>Date & Time:</strong></td>
                        <td style="padding: 8px 0;">${appointmentDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Doctor:</strong></td>
                        <td style="padding: 8px 0;">${doctorName}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">If you have any questions or need to reschedule, please contact us.</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="#" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px;">${process.env.GMAIL_EMAIL}</a>
                </div>
            </div>
            <div style="background-color: #f8f8f8; color: #555; text-align: center; padding: 15px; font-size: 12px;">
                © 2025 ${process.env.APP_NAME}. All rights reserved.
            </div>
        </div>
        `
    };
    
    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.error('Error sending email:', error);
        
        console.log('Email sent:', info.response);
    });
};

module.exports = sendEmail;

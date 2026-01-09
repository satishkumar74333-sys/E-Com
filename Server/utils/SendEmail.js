import nodemailer from "nodemailer";

const SendEmail = async function (email, subject, message) {
  return
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      service: "gmail",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"KGSDOORS" <${process.env.SMTP_USERNAME}>`,
      to: email,
      subject: subject,
      html: message,
    });

    return info;
  } catch (error) {
    throw error;
  }
};

export default SendEmail;

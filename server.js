import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

app.post('/send-mail', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: `"TestServer" <${process.env.EMAIL_USER}>`,
            to: "vjbravojoshi@gmail.com",
            subject: "✅ Test Email from Node.js",
            text: "This is a test email sent using Nodemailer!"
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(info.response);

        res.json({ success: true, message: "Email sent successfully" })
    } catch (error) {
        console.error("Error sending mail", error);
        res.status(500).json({success:false,message:"Error while sending mail"})
    }

})

app.listen(process.env.PORT , ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
    
})
import {User} from "../models/User.js";
import { genEmailHTMLVerification, genEmailHTMLPasswordResetting } from "../utils/generateHTMLconfirmeEmail.js";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

function generateLink(token) {
    const link = process.env.PASSWORD_RESETTING_LINK;
    return `${link}/${token}`;
}

async function sendGmail(email, isPasswordResetting) {
    let token = Math.floor(100000 + Math.random() * 900000).toString();

    if(isPasswordResetting) {
        token = await bcryptjs.hash(token, 10);
        token = token.replace(/\//g, '_');
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.NODEMAILER_PASSWORD
        }
    })

    const mailOptions = {
        from: 'videochat.es2025@gmail.com',
        to: email,
        subject: 'Email Confirmation',
        html: !isPasswordResetting ? genEmailHTMLVerification(token) : genEmailHTMLPasswordResetting(generateLink(token))
    };

    await transporter.sendMail(mailOptions);

    if(isPasswordResetting) {
        await User.updateOne(
            { email: email },
            { $set: { resetPasswordToken: token, restorePasswordExpiresAt: Date.now() + 5 * 60 * 60 * 1000 } }
        );
    } else {
        await User.updateOne(
            { email: email },
            { $set: { verifyEmailToken: token, verifyEmailExpiresAt: Date.now() + 5 * 60 * 60 * 1000 } }
        );
    }
}

export async function sendEmail(req, res) {
    const userId = req.user.userId;
    const userData = await User.findOne({ _id: userId }).select('email');
    if(!userData?.email) {
        return res.status(400).send({error: 'User not found'});
    }

    const email = userData.email;

    await sendGmail(email, false)
        .catch(error => {
            console.log(error);
            res.status(500).json({message: "Email was not sent"});
        })

    res.json({message: "Email was sent successfully"});
}

export async function sendEmailToResetPassword(req, res) {
    const { email } = req.body;

    await sendGmail(email, true)

    res.json({message: "Email was sent successfully"});
}

export async function passwordResetting(req, res) {
    const { password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 7);
    const userId = req.userId;
    await User.findOneAndUpdate({_id: userId}, {password: hashedPassword, })

    res.json({message: "Password changed successfully"});
}

export async function confirmEmail(req, res) {
    const userId = req.user.userId;
    await User.findOneAndUpdate({_id: userId}, {isActive: true})

    res.json({message: 'User confirmed'});
}

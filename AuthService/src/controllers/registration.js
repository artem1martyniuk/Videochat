import {User} from "../models/User.js";
import bcryptjs from "bcryptjs";
import {generateJWTAndSetCookies} from "../utils/generateJWTAndSetCookies.js";

export const signup = async (req, res) => {
    const {firstName, lastName, email, password, avatar} = req.body;

    try {
        const isUserExists = await User.findOne({email})
        if (isUserExists) {
            return res.status(400).json({error: 'User already exists'})
        }

        const hashedPassword = await bcryptjs.hash(password, 7);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            avatar: avatar || null
        })

        await user.save();

        generateJWTAndSetCookies(res, user._id);
        res.json({
            message: 'You have been registered successfully!', userData: {
                firstName,
                lastName,
                avatar
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    }
}
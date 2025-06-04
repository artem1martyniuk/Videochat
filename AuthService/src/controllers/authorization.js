import {generateJWTAndSetCookies} from "../utils/generateJWTAndSetCookies.js";
import {User} from "../models/User.js";

export const signin = async (req, res) => {
    console.log("HERERE")
    const userId = req.userId;
    generateJWTAndSetCookies(res, userId);

    const user = await User.findById(userId);

    const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        isActive: user.isActive
    }

    res.json({message: 'successfully signin', userData})
}

export const authMe = async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        isActive: user.isActive
    }

    res.json({userData})
}

export const logOut = async (req, res) => {
    res.clearCookie("token");

    res.json({message: 'Successfully logOut'})
}


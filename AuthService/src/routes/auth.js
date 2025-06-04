import express from "express";
import {signup} from "../controllers/registration.js";
const router = express.Router();
import signUpValidator from "../validators/signUpValidatorFunc.js";
import validatorMiddleware from "../middlewares/validatorMiddleware.js";
import checkAuth from "../middlewares/checkAuth.js";
import {
    confirmEmail,
    passwordResetting,
    sendEmail,
    sendEmailToResetPassword
} from "../controllers/emailConfirmation.js";
import {authMe, logOut, signin} from "../controllers/authorization.js";
import signInValidator from "../validators/signInValidatorFunc.js";
import confirmEmailValidator from "../validators/confEmailValidatorFunc.js";
import passwordResetSendEmail from "../validators/passwordResetSendEmailFunc.js";
import passwordResetConfirmation from "../validators/passwordResetConfirmationFunc.js";

router.get('/auth_me', checkAuth, authMe);

router.post("/signup", ...signUpValidator, validatorMiddleware, signup);

router.post("/email_confirmation/gen_token", checkAuth, sendEmail)

router.post("/email_confirmation/confirm_email", checkAuth, ...confirmEmailValidator, validatorMiddleware, confirmEmail)

router.post("/signin", ...signInValidator, validatorMiddleware, signin)

router.post("/logOut", logOut)

router.post("/reset_password_send_email", ...passwordResetSendEmail, validatorMiddleware, sendEmailToResetPassword)

router.post("/reset_password_confirmation", ...passwordResetConfirmation, validatorMiddleware, passwordResetting)

export default router

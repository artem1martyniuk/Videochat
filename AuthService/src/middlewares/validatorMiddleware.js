import {validationResult} from "express-validator";

function validatorMiddleware(req, res, next) {
    const errors = validationResult(req);
    console.log(`HERERE5 ${errors}`)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

export default validatorMiddleware;
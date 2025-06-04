import jwt from "jsonwebtoken";

function checkAuth(req,res,next){
    const token = req.cookies?.token;
    if(!token) {
        return res.status(401).send({error: 'You are not authorized'});
    }

    try {
        req.user  = jwt.verify(token, process.env.JWT_SECRET);
        next();
    }catch(err) {
        return res.status(401).send({error: 'You are not authorized'});
    }
}

export default checkAuth;
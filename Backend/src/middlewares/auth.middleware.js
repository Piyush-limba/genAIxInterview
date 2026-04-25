const User=require('../models/user.model.js');
const TokenBlacklist=require('../models/blacklist.model.js');
const jwt=require('jsonwebtoken');

const authMiddleware=async(req,res,next)=>{
    const token=req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const isBlacklisted=await TokenBlacklist.findOne({ token });

        if(isBlacklisted){
            return res.status(401).json({
                message:"Token is invalid"
            })
        }

        req.user=decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message:"Invalid token"
        })   
    }
}

module.exports=authMiddleware; 
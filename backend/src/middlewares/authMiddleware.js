const jwt=require('jsonwebtoken')
require('dotenv').config()

const auth=async (req,res,next)=>{
    const header=req.headers.authorization
    if(!header || !header.startsWith("Bearer"))
        return res.status(401).json({"msg":"Invalid token"})
    const token=header.split(' ')[1]
    try{
        const user=await jwt.verify(token,process.env.JWT_SECRET)
        req.user=user;
        next()
    }
    catch(error){
        res.status(401).json({"msg":"authentication failed"})
    }
}

const hodAuth = async (req,res,next)=>{
    try{
        if(req.user.role=='hod')
            next()
        else{
            throw new Error("user not found")
        }
    }
    catch(error){
        res.status(404).json({"msg":'unauthorized request'})
    }
} 

const adminAuth = async (req,res,next)=>{
    try{
        if(req.user.role=='admin')
            next()
        else{
            throw new Error("user not found")
        }
    }
    catch(error){
        res.status(403).json({"msg":'unauthorized request'})
    }
}

module.exports={auth,hodAuth,adminAuth}
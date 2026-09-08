const globalMiddleware=async (error,req,res,next)=>{
    try{
        return res.status(error.status).json({"msg":error.msg})
    }
    catch(error){
        return res.status(500).json({"msg":"Internal server error!"})
    }
}

module.exports=globalMiddleware
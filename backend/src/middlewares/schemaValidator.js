const validate = (schema)=>{
    return (req,res,next)=>{
        const result = schema.safeParse(req.body)
        if(!result.success){
            const message=result.error.issues[0].message
            return next({"status":400,"msg":message})
        }
        req.body=result.data
        next()
    }
}

module.exports=validate
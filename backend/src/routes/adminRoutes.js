const {decryptor} = require('../utils/encryption')
const {auth,adminAuth} = require('../middlewares/authMiddleware')
const pool=require('../config/db')


const router = require('express').Router()

router.get('/studentId/:user_id',auth,adminAuth,async (req,res,next)=>{
    const user_id=req.params.user_id
    try{
        const result = await pool.query("select student_id from users where user_id=$1",[user_id])
        if(result.rows.length==0)
            next({"status":404,"msg":"user not found"})
        const student_id=decryptor(result.rows[0].student_id)
        res.status(200).json({"msg":"student_id fetched","data":{student_id}})
    }
    catch(error){
        console.log(error)
        next({"status":500,"msg":"Internal server error!"})
    }
})

module.exports=router
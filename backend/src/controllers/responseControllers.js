const pool = require('../config/db')
const redis = require('../config/redis')


const getResponses = async (req,res,next)=>{
    const complaint_id = req.params.complaint_id
    if(!complaint_id)
        return next({"status":400,"msg":"complaint_id required"})
    try{
        const responses = await redis.get(`complaints:${complaint_id}:responses`)
        if(responses)
            return res.status(200).json({"msg":"responses fetched success",
            "source":"redis",
            "data":JSON.parse(responses)
            })
        const result = await pool.query("select * from responses where complaint_id=$1",[complaint_id])
        if(result.rows.length==0)
            return next({"status":200,"msg":"no responses for this complaint yet!","data":[]})
        await redis.set(`complaints:${complaint_id}:responses`,JSON.stringify(result.rows),"EX",600)
        res.status(200).json({"msg":"responses fetched successfully",
            "data":result.rows
        })
    }
    catch(error){
        next({"status":500,"msg":"Internal server issue"})
    }
}

const createResponse = async (req,res,next)=>{
    const complaint_id = req.params.complaint_id
    const {response} = req.body
    if(!complaint_id)
        return next({"status":400,"msg":"complaint_id required"})
    try{
        const result = await pool.query("insert into responses (response,user_id,complaint_id) values($1,$2,$3) returning *",[response,req.user.user_id,complaint_id])
        await redis.del(`complaints:${complaint_id}:responses`)
        res.status(200).json({'msg':'response created successfully',data:result.rows[0]})
    }
    catch(error){
        next({"status":500,"msg":"Internal server issue"})
    }
}

const updateResponse = async (req,res,next) =>{
    const response_id = req.params.response_id
    const {response} = req.body
    try{
        const result = await pool.query("update responses set response=$1 where response_id=$2 and user_id=$3 returning complaint_id",[response,response_id,req.user.user_id])
        if(result.rows.length==0)
            return next({"status":404,"msg":"response not found"})
        const complaint_id = result.rows[0].complaint_id
        await redis.del(`complaints:${complaint_id}:responses`)
        res.status(200).json({"msg":"responses updated success"})
    }
    catch(error){
        return next({"status":500,"msg":"Internal server Issue"})
    }
}

const deleteResponse  = async (req,res,next)=>{
    const response_id = req.params.response_id
    if(!response_id)
        return next({"status":400,"msg":"response_id required"})
    try{
        const result = await pool.query("delete from responses where response_id=$1 and user_id=$2 returning complaint_id",[response_id,req.user.user_id])
        if(result.rows.length==0)
            return res.status(404).json({"msg":"no response found with this id"})
        const complaint_id = result.rows[0].complaint_id
        await redis.del(`complaints:${complaint_id}:responses`)
        res.status(200).json({'msg':"response deleted successfully"})
    }
    catch(error){
        next({"status":500,"msg":"Internal server issue"})
    }
}

module.exports={getResponses,createResponse,updateResponse,deleteResponse}

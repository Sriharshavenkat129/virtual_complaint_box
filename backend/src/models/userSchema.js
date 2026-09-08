const {z} = require("zod")

const registerSchema = z.object({
    student_id:z.string({message:"student_id required"})
    .length(10,{message:"enter a valid student_id"})
    .regex(/^\d{2}[A-Z]{2}\d{1}[A-Z]{1}\d{4}$/, { 
            message: "Invalid roll number format (e.g., 23ME1A0501)" 
        }),
    branch:z.enum(['AIDS','CSE','AIML','IOT','EEE','ECE','MECH','CYBER']
    )
})

module.exports=registerSchema
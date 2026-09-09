const {z} = require('zod')

const complaintSchema = z.object({
    title:z.string({message:"title required"}).min(4,{message:"title is too short"}).max(100,{message:"title is too large"}),
    description:z.string({message:"fill the complaint description"}).min(10,{message:"complaint description is too short"}),
    category:z.enum(['hostel','academics','other'])
})

const updateComplaintSchema = complaintSchema.partial()

module.exports={complaintSchema,updateComplaintSchema}
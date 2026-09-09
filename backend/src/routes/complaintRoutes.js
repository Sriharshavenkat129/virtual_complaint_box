const router=require('express').Router()
const {auth} = require('../middlewares/authMiddleware')
const {complaintSchema,updateComplaintSchema} = require('../models/complaintSchema')
const validate= require('../middlewares/schemaValidator')

const {getComplaints,getComplaintById,createComplaint,updateComplaint,deleteComplaint,upvote,deleteUpvote} = require('../controllers/complaintControllers')

router.get('/',auth,getComplaints)

router.get('/:complaint_id',auth,getComplaintById)

router.post('',auth,validate(complaintSchema),createComplaint)

router.patch('/:complaint_id',auth,validate(updateComplaintSchema),updateComplaint)

router.delete('/:complaint_id',auth,deleteComplaint)

router.post('/upvote/:complaint_id',auth,upvote)

router.delete('/upvote/:complaint_id',auth,deleteUpvote)

module.exports=router
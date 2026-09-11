const router = require('express').Router()
const {auth,adminAuth,hodAuth} = require('../middlewares/authMiddleware')
const {responseSchema} = require('../models/complaintSchema')
const validate = require('../middlewares/schemaValidator')
const {getResponses,createResponse,updateResponse,deleteResponse} = require('../controllers/responseControllers')


router.get('/:complaint_id',auth,getResponses)

router.post('/:complaint_id',auth,hodAuth,validate(responseSchema),createResponse)

router.post('/:response_id',auth,hodAuth,updateResponse)

router.delete('/:response_id',auth,hodAuth,deleteResponse)

module.exports = router
const router=require('express').Router()
const {auth} = require('../middlewares/authMiddleware')

router.get('/complaints',auth)

router.get('/complaint/:complaint_id',auth)

router.post('/complaint',auth)

router.patch('/complaint/:complaint_id',auth)

router.delete('/complaint/:complaint_id',auth)

router.patch('/complaint/:complaint_id/upvote',auth)
const router = require('express').Router()
const {auth} = require('../middlewares/authMiddleware')
const {resetPassword} = require('../controllers/authControllers')
const {getUserComplaints} = require("../controllers/complaintControllers")
const {authLimiter} =require('../middlewares/rateLimiters')

router.patch('/resetPassword',authLimiter,auth,resetPassword)

router.get("/complaints",auth,getUserComplaints)

module.exports = router
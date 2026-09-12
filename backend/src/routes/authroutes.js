const router=require('express').Router()
const {auth,adminAuth,hodAuth} = require("../middlewares/authMiddleware") 
const {registerSchema , registerHodSchema} = require('../models/userSchema')
const validate = require('../middlewares/schemaValidator')
const {login,register,regsiterHod} = require("../controllers/authControllers")
const {authLimiter} = require('../middlewares/rateLimiters')

router.post("/login",authLimiter,login)

router.post("/register",validate(registerSchema),auth,hodAuth,register)

router.post("/registerhod",validate(registerHodSchema),auth,adminAuth,regsiterHod)

module.exports=router
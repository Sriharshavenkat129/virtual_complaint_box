const router=require('express').Router()
const {auth,adminAuth} = require("../middlewares/authMiddleware") 
const {registerSchema , registerHodSchema} = require('../models/userSchema')
const validate = require('../middlewares/schemaValidator')
const {login,register,regsiterHod} = require("../controllers/authControllers")

router.post("/login",login)

router.post("/register",validate(registerSchema),auth,adminAuth,register)

router.post("/registerhod",validate(registerHodSchema),auth,adminAuth,regsiterHod)

module.exports=router
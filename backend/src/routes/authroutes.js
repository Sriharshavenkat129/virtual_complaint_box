const router=require('express').Router()
const {auth,adminAuth} = require("../middlewares/authMiddleware") 

const {login,register,regsiterHod} = require("../controllers/authControllers")

router.post("/login",login)

router.post("/register",auth,adminAuth,register)

router.post("/registerhod",auth,adminAuth,regsiterHod)

module.exports=router
const express = require("express")
const cors = require("cors")
const globalMiddleware =require("./middlewares/globalMiddleware")
const authRouter= require("./routes/authroutes")
const complaintRouter= require('./routes/complaintRoutes')
const responseRouter = require('./routes/responseRoutes')
const userRouter = require("./routes/userRoutes")
const adminRouter = require("./routes/adminRoutes")
const {limiter,authLimiter} = require('./middlewares/rateLimiters')

const app=express()

app.use(cors())
app.use(express.json())
app.use(limiter)

app.use("/api/v1",authRouter)
app.use("/api/v1/complaints",complaintRouter)
app.use("/api/v1/complaint/responses",responseRouter)
app.use("/api/v1/user/me",userRouter)
app.use("/api/v1/admin",adminRouter)

app.use(globalMiddleware)
module.exports=app
const express = require("express")
const cors = require("cors")
const globalMiddleware =require("./middlewares/globalMiddleware")
const authRouter= require("./routes/authroutes")

const app=express()

app.use(cors())
app.use(express.json())

app.use("/api/v1",authRouter)

app.use(globalMiddleware)
module.exports=app
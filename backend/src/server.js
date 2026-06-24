const express=require('express');
const app=new express();
const cors=require('cors');
const {userRoutes}=require("./routes/userRoutes");
const {adminRoutes}=require("./routes/adminRoutes");
const {hodRoutes}=require("./routes/hodRoutes");

app.use(express.json());

app.get('/',(req,res)=>{
    res.end("hello,world");
})

app.listen(5000,()=>{
    console.log("Server is running on port 5000");
});
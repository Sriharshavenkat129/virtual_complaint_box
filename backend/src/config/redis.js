const Redis=require("ioredis")

const redis=new Redis("rediss://default:gQAAAAAAAQJ4AAIgcDFhMTBiZWZkZGFiOTg0NGZhYjI5ZDQ5M2IyNTVkMDEzMA@fitting-bird-66168.upstash.io:6379",{
    retryStrategy:(times)=>Math.min(times*50,2000)
    }
);

redis.on('connect',()=>{console.log("running")});
redis.on('error',(error)=>console.log(error.message));

module.exports=redis
const {rateLimit} = require('express-rate-limit')

const limiter = rateLimit(
    {
        windowMs:5*60*1000,
        max:100
    }
)

const authLimiter =rateLimit(
    {
        windowMs:15*60*1000,
        max:5
    }
)

module.exports={limiter,authLimiter}
const redis = require('../config/redis')
const pool = require('../config/db')

const getComplaints = async (req, res, next) => {
    try {
        if (!req.user)
            return next({ "status": 401, "msg": "authentication required!" })
        const complaints = await redis.get(`complaints:${req.user.branch}`)
        if (complaints) {
            return res.status(200).json({ "msg": "complaints fetched success", data: JSON.parse(complaints), "source": "redis" })
        }
        const result = await pool.query(`select complaint_id,title,description,user_id,category,upvotes,created_at,
        exists (select 1 from upvotes where upvotes.complaint_id=complaints_view.complaint_id and user_id=$1) as upvoted
        from complaints_view where branch=$2
        order by created_at desc`, [req.user.user_id, req.user.branch])
        let msg = "complaints fetched successfully"
        if (result.rows.length == 0) {
            msg = "no complaints at this moment"
        }
        await redis.set(`complaints:${req.user.branch}`, JSON.stringify(result.rows), 'EX', 600)
        res.status(200).json({ "msg": msg, "data": result.rows })
    }
    catch (error) {
        console.log(error)
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const getComplaintById = async (req, res, next) => {
    try {
        const complaint_id = req.params.complaint_id
        if (!complaint_id)
            return next({ "status": 400, "msg": "complaint id required!" })
        const complaint = await redis.get(`complaints:${complaint_id}`)
        if (complaint) {
            return res.status(200).json({ "msg": "complaint data fetched success", data: JSON.parse(complaint), "source": "redis" })
        }
        const result = await pool.query("select  * from complaints_view where complaint_id=$1", [complaint_id])
        if (result.rows.length == 0)
            return next({ "msg": "complaint not found", "status": 404 })
        await redis.set(`complaints:${complaint_id}`, JSON.stringify(result.rows[0]), "EX", 600)
        res.status(200).json({ "data": result.rows[0], "msg": "complaint data fetched success" })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const createComplaint = async (req, res, next) => {
    const { title, description, category } = req.body
    try {
        const result = await pool.query("insert into complaints (title,description,category,user_id) values($1,$2,$3,$4) returning *",
            [title, description, category, req.user.user_id])
        await redis.del(`complaints:${req.user.branch}`)
        if (await redis.exists(`complaints:user:${req.user.user_id}`) == 1)
            await redis.del(`complaints:user:${req.user.user_id}`)
        res.status(200).json({ "msg": 'complaint created successfully', 'data': result.rows[0] })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const updateComplaint = async (req, res, next) => {
    const { title, description, category } = req.body
    const complaint_id = req.params.complaint_id
    if (!complaint_id)
        return next({ "status": 400, "msg": "complaint_is required!" })
    try {
        let values = []
        let queries = []
        let count = 1;
        if (title) {
            queries.push(`title=$${count}`)
            values.push(title)
            count++;
        }
        if (description) {
            queries.push(`description=$${count}`)
            values.push(description)
            count++;
        }
        if (category) {
            queries.push(`category=$${count}`)
            values.push(category)
            count++;
        }
        if (count == 1) return next({ "status": 200, "msg": "complaint_updated" })
        let query = queries.join(', ')
        const result = await pool.query(`update complaints set ${query} where complaint_id=$${count++} and user_id=$${count} returning *`, [...values, complaint_id, req.user.user_id])
        if (result.rows.length == 0)
            return res.status(404).json({ "msg": "complaint not found" })
        await redis.del(`complaints:${complaint_id}`)
        await redis.del(`complaints:${req.user.branch}`)
        if (await redis.exists(`complaints:user:${req.user.user_id}`) == 1)
            await redis.del(`complaints:user:${req.user.user_id}`)
        res.status(200).json({ "msg": "complaint updated successfully", "data": result.rows[0] })
    }
    catch (error) {
        console.log(error)
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const deleteComplaint = async (req, res, next) => {
    const complaint_id = req.params.complaint_id
    if (!complaint_id)
        return next({ 'status': 400, "msg": "complaint_id required!" })
    try {
        const result = await pool.query("delete from complaints where complaint_id=$1 and user_id=$2 retuning *", [complaint_id, req.user.user_id])
        if (result.rows.length == 0)
            return res.status(404).json({ "msg": "complaint not found" })
        await redis.del(`complaints:${req.user.branch}`)
        if (await redis.exists(`complaints:user:${req.user.user_id}`) == 1)
            await redis.del(`complaints:user:${req.user.user_id}`)
        if (await redis.exists(`complaints:${complaint_id}`) == 1)
            await redis.del(`complaints:${complaint_id}`)
        res.status(200).json({ "msg": 'complaint deleted successfully' })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const upvote = async (req, res, next) => {
    const complaint_id = req.params.complaint_id
    if (!complaint_id)
        return next({ "status": 400, "msg": "complaint_id required!" })
    try {
        await pool.query("insert into upvotes (complaint_id,user_id) values($1,$2)", [complaint_id, req.user.user_id])
        await redis.del(`complaints:${req.user.branch}`)
        await redis.del(`complaints:${complaint_id}`)
        res.status(200).json({ "msg": "upvoted success" })
    }
    catch (error) {
        if (error.code === '23505') {
            return next({ "status": 400, "msg": "You have already upvoted this complaint" });
        }
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const deleteUpvote = async (req, res, next) => {
    const complaint_id = req.params.complaint_id
    if (!complaint_id)
        return next({ "status": 400, "msg": "complaint_id required!" })
    try {
        await pool.query("delete from upvotes where complaint_id=$1 and user_id=$2", [complaint_id, req.user.user_id])
        await redis.del(`complaints:${req.user.branch}`)
        await redis.del(`complaints:${complaint_id}`)
        res.status(200).json({ "msg": "upvote removed successfully" })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal sever issue" })
    }
}

const getUserComplaints = async (req, res, next) => {
    try {
        const complaints = await redis.get(`complaints:user:${req.user.user_id}`)
        if (complaints)
            return res.status(200).json({ "msg": "complaints fetched success", "data": JSON.parse(complaints), "source": "redis" })
        const result = await pool.query("select * from complaints_view where user_id=$1", [req.user.user_id])
        await redis.set(`complaints:user:${req.user.user_id}`, JSON.stringify(result.rows), 'EX', 600)
        if (result.rows.length == 0)
            return res.status(200).json({ "msg": "you haven`t raiased any complaints", "data": [] })
        res.status(200).json({ "msg": "complaints fetched success!", "data": result.rows })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal server issue" })
    }
}

module.exports = { getComplaints, getComplaintById, createComplaint, updateComplaint, deleteComplaint, upvote, deleteUpvote , getUserComplaints}
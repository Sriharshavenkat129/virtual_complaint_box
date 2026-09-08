const { encryptor, getLoginId } = require("../utils/encryption")
const pool = require("../config/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const login = async (req, res, next) => {
    const { login_id, password } = req.body;
    try {
        if (!login_id || !password)
            return next({ "status": 400, "msg": "login_id and password required!" })
        const secured_login_id = getLoginId(login_id)
        const result = await pool.query("select * from users where login_id=$1", [secured_login_id])
        if (result.rows.length == 0)
            return next({ "status": 404, "msg": "user not found" })
        const isMatch = await bcrypt.compare(password, result.rows[0].password)
        if (!isMatch)
            return next({ "status": 401, "msg": "Incorrect password" })
        const user = {
            user_id: result.rows[0].user_id,
            role: result.rows[0].role,
            branch:result.rows[0].branch
        }
        const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.status(200).json({
            "msg": 'login success',
            accessToken
        })
    }
    catch (error) {
        next({ "status": 500, "msg": "internal server error" })
    }
}

const register = async (req, res, next) => {
    const { student_id, branch } = req.body
    if (!student_id || !branch)
        return next({ "stauts": 400, "msg": "student_id and branch required" })
    try {
        const login_id = getLoginId(student_id)
        const encrypted_student_id = encryptor(student_id)
        const pass = await bcrypt.hash("12345678", 10)
        if (check.rows.length != 0)
            return next({ "status": 401, "msg": "user already existed with this id" })
        const result = await pool.query("insert into users (login_id,password,student_id,branch) values($1,$2,$3,$4)", [login_id, pass, encrypted_student_id, branch])
        return res.status(200).json({ "msg": "user registered successfully" })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal server Error" })
    }
}

const regsiterHod = async (req, res, next) => {
    const { hod_id, branch } = req.body
    if (!hod_id || !branch)
        return next({ "status": 400, "msg": "hod_id and branch required" })
    try {
        const login_id = getLoginId(hod_id)
        const encrypted_hod_id = encryptor(hod_id)
        const pass = await bcrypt.hash("12345678", 10)
        const check = await pool.query("select * from users where login_id=$1", [login_id])
        if (check.rows.length != 0)
            return next({ "status": 401, "msg": "user already existed with this id" })
        const result = await pool.query("insert into users (login_id,student_id,password,branch,role) values($1,$2,$3,$4,$5)", [login_id, encrypted_hod_id, pass, branch, "hod"])
        res.status(200).json({ "msg": "hod registered successfully" })
    }
    catch (error) {
        next({ "status": 500, "msg": "Internal server" })
    }
}

module.exports = { login, register, regsiterHod }
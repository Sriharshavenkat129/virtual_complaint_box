const crypto =require("crypto")

const master_key = crypto.scryptSync(process.env.ENCRYPT_KEY || 'admin_encrypt_key','fixed-salt',32)

const encryptor = (student_id)=>{
    const iv=crypto.randomBytes(12)
    const cipher=crypto.createCipheriv('aes-256-gcm',master_key,iv)

    let encrypt=cipher.update(student_id,'utf-8','hex')
    encrypt+=cipher.final('hex')

    const auth_tag=cipher.getAuthTag().toString('hex')

    return `${iv.toString('hex')}:${encrypt}:${auth_tag}`
}

const decryptor=(encrypted_student_id)=>{
    const [ivhex,encrypt,auth_tag] = encrypted_student_id.split(':');

    const decipher=crypto.createDecipheriv(
        'aes-256-gcm',
        master_key,
        Buffer.from(ivhex,'hex')
    )

    decipher.setAuthTag(Buffer.from(auth_tag,'hex'))

    let decrypted = decipher.update(encrypt,'hex','utf-8')
    decrypted+=decipher.final('utf-8')

    return decrypted

}

const getLoginId=(login_id)=>{
    return crypto.createHmac('sha256',process.env.ENCRYPT_KEY)
    .update(login_id.trim().toUpperCase())
    .digest('hex')
}

module.exports={encryptor,decryptor,getLoginId}
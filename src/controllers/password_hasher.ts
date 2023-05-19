import bcrypt from 'bcrypt'

export async function check_and_hash (password:string) {
    const regex:RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/gm
    if(!password.match(regex)) throw new Error("Password doesn't match minimal requirements")
    
    return await bcrypt.hash(password,parseInt(process.env.SALT_ROUNDS))
}
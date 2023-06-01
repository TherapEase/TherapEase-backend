import bcrypt from 'bcrypt'

export async function check_and_hash (password:string) {
    const regex:RegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/) 
    if(!regex.test(password))
        throw new Error("Password doesn't match minimal requirements")
    return await bcrypt.hash(password,parseInt(process.env.SALT_ROUNDS))
}
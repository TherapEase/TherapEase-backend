import mongoose from "mongoose";

export default async function db_connect(){
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        return true
    } catch (error) {
        return false
    }
}
export async function db_conn_close() {
    try {
        await mongoose.connection.close()
        return true
    } catch (error) {
        return false
    }
}
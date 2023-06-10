import mongoose from "mongoose";

export default async function db_connect(){
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)
        console.log("DB Connected")
        return true
    } catch (error) {
        console.log("Cannot open connection")
        return false
    }
}
export async function db_conn_close() {
    try {
        await mongoose.connection.close()
        console.log("DB Connection Closed")
        return true
    } catch (error) {
        console.log("Cannot close connection")
        return false
    }
}
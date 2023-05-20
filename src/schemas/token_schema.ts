import mongoose, {Schema, model} from "mongoose"

export interface IToken{
    token: String,
    expiration:Date
}
const token_schema = new Schema({
    token: {type:String,require:true},
    expiration:{type:Date,require:true}
})

export const JWTToken = model<IToken>("JWTToken",token_schema,'BlacklistedTokens')
import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

export async function dbconnection() {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log(`DataBase connected!! DB host: ${connectionInstance.connection.host}`)
    }
    catch(err){
        console("MongoDB connection error" , err)
        process.exit(1)
    }
}


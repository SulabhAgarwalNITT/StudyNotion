import { dbconnection } from "./database/dbconnect.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config();

dbconnection()
.then(()=>{
    app.on("error", (err)=>(
        console.log("Error after connection", err)
    ))

    app.listen(process.env.PORT || 8000 , ()=>(
        console.log(`app is listening.`)
    ))
})
.catch()
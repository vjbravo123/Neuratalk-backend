import mongoose from "mongoose"

export const connectDB = async(url) =>{
    try {
        const conn =await mongoose.connect(url);
        console.log(`✅Mongodb Connected Successfully Host : ${conn.connection.host}`);
        
    } catch (error) {
        console.error(`❌Error while connecting to mongodb`)
    }
}
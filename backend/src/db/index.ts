import mongoose from "mongoose";
import { config } from "../config";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(config.MONGODB_URI);
        console.log(
            `MONGODB connected !! DB host: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGODB connection failed: ", error);
        process.exit(1);
    }
};

export default connectDB;

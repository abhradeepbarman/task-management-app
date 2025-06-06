import app from "./app";
import { config } from "./config";
import connectDB from "./db";

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGODB connection failed: ", err);
    });

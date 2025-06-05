import express from "express";
import { config } from "./config";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});

export default app;

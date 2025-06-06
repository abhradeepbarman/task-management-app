import "dotenv/config";

export const config = {
    PORT: process.env.PORT || 7000,
    MONGODB_URI: process.env.MONGODB_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
};

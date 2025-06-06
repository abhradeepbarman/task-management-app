import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

const auth = (req: Request, res: Response, next: NextFunction): any => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const user = jwt.verify(token!, config.JWT_SECRET) as JwtPayload;
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized" });
    }
};

export default auth;

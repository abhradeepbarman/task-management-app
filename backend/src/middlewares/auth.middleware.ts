import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import CustomErrorHandler from "../utils/CustomErrorHandler";

const auth = (req: Request, res: Response, next: NextFunction): any => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.send(CustomErrorHandler.unAuthorized());
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.send(CustomErrorHandler.unAuthorized());
        }

        const user = jwt.verify(token!, config.JWT_SECRET) as JwtPayload;
        if (!user) {
            return res.send(CustomErrorHandler.unAuthorized());
        }

        req.user = user;
        next();
    } catch (error) {
        return next(error);
    }
};

export default auth;

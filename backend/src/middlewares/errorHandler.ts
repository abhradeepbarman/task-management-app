import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { formatError } from "../utils/formatError";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import ResponseHandler from "../utils/ResponseHandler";
import { JsonWebTokenError } from "jsonwebtoken";

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next?: NextFunction
) => {
    let statusCode = 500;
    let errData = {
        message: "Internal Server Error",
    };

    console.error("Error:", err);

    if (err instanceof JsonWebTokenError) {
        statusCode = 401;
        errData = {
            message: "Unauthorized",
        };
    }

    if (err instanceof ZodError) {
        statusCode = 422;
        errData = {
            message: formatError(err),
        };
    }

    if (err instanceof CustomErrorHandler) {
        statusCode = err.status;
        errData = err.toJson();
    }

    return res
        .status(statusCode)
        .send(ResponseHandler(statusCode, errData.message));
};

export default errorHandler;

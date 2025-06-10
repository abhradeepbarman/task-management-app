import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import User from "../models/user.model";
import loginSchema from "../validators/auth/login.validator";
import registerSchema from "../validators/auth/register.validator";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import ResponseHandler from "../utils/ResponseHandler";

// Register
const userRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const { name, email, password } = registerSchema.parse(req.body);

    try {
        const isExist = await User.findOne({ email });
        if (isExist) {
            return res.send(
                CustomErrorHandler.alreadyExist("User already exist")
            );
        }

        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, genSalt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const access_token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refresh_token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: "7d",
        });

        await User.findByIdAndUpdate(user._id, {
            refreshToken: refresh_token,
        });

        return res
            .status(201)
            .cookie("refresh_token", refresh_token, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("access_token", access_token, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 60 * 60 * 1000,
            })
            .send(
                ResponseHandler(201, "User registered successfully", {
                    id: user._id,
                    access_token,
                    refresh_token,
                })
            );
    } catch (error) {
        return next(error);
    }
};

// Login
const userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) {
            return res.send(CustomErrorHandler.notFound("User not found"));
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.send(CustomErrorHandler.wrongCredentials());
        }

        const access_token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refresh_token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: "7d",
        });

        user.refreshToken = refresh_token;
        await user.save();

        return res
            .status(200)
            .cookie("refresh_token", refresh_token, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("access_token", access_token, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 60 * 60 * 1000,
            })
            .send(
                ResponseHandler(200, "User logged in successfully", {
                    id: user._id,
                    access_token,
                    refresh_token,
                })
            );
    } catch (error) {
        return next(error);
    }
};

// Logout
const userLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req.user?.id;
        await User.findByIdAndUpdate(userId, { refreshToken: null });

        return res
            .clearCookie("refresh_token", { httpOnly: true })
            .clearCookie("access_token", { httpOnly: true })
            .send(ResponseHandler(200, "User logged out successfully"));
    } catch (error) {
        return next(error);
    }
};

// Refresh token
const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { refresh_token } = req.cookies || req.body;
        if (!refresh_token) {
            return res.send(
                CustomErrorHandler.notFound("Refresh token not found")
            );
        }

        const decoded = jwt.verify(
            refresh_token,
            config.JWT_SECRET
        ) as JwtPayload;
        const user = await User.findById(decoded.id);
        if (!user) {
            return res
                .status(404)
                .send(CustomErrorHandler.notFound("User not found"));
        }
        if (user.refreshToken !== refresh_token)
            return res.send(CustomErrorHandler.unAuthorized());

        const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const newRefreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: "7d",
        });

        user.refreshToken = newRefreshToken;
        await user.save();

        return res
            .cookie("refresh_token", newRefreshToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie("access_token", accessToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 60 * 60 * 1000,
            })
            .send(
                ResponseHandler(200, "Access token refreshed successfully", {
                    id: user._id,
                    access_token: accessToken,
                    refresh_token: newRefreshToken,
                })
            );
    } catch (error) {
        return next(error);
    }
};

export { refreshAccessToken, userLogin, userLogout, userRegister };

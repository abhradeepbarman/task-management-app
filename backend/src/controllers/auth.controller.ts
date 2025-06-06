import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import User from "../models/user.model";
import loginSchema from "../validators/auth/login.validator";
import registerSchema from "../validators/auth/register.validator";

// Register
const userRegister = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password } = registerSchema.parse(req.body);

    try {
        const isExist = await User.findOne({ email });
        if (isExist) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
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
            .json({
                success: true,
                message: "User registered successfully",
                data: {
                    id: user._id,
                    access_token,
                },
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Login
const userLogin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const payload: JwtPayload = { id: user._id };
        const accessToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: "1h",
        });
        const refreshToken = jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: "7d",
        });

        user.refreshToken = refreshToken;
        await user.save();

        return res
            .status(200)
            .cookie("refresh_token", refreshToken, {
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
            .json({
                success: true,
                message: "User logged in successfully",
                data: {
                    id: user._id,
                    access_token: accessToken,
                },
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Logout
const userLogout = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.user?.id;
        await User.findByIdAndUpdate(userId, { refreshToken: null });

        return res
            .clearCookie("refresh_token", { httpOnly: true })
            .clearCookie("access_token", { httpOnly: true })
            .json({
                success: true,
                message: "User logged out successfully",
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Refresh token
const refreshAccessToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const { refresh_token } = req.cookies || req.body;
        if (!refresh_token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found",
            });
        }

        const decoded = jwt.verify(
            refresh_token,
            config.JWT_SECRET
        ) as JwtPayload;
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.refreshToken !== refresh_token)
            return res.status(403).json({
                success: false,
                message: "Invalid refresh token",
            });

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
            .json({
                success: true,
                message: "Access token refreshed successfully",
                data: {
                    id: user._id,
                    access_token: accessToken,
                },
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export { refreshAccessToken, userLogin, userLogout, userRegister };


import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const [loading, setLoading] = useState<boolean>(false);
    const accessToken = localStorage.getItem("accessToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (accessToken) {
            navigate("/team-members");
        }
    }, [accessToken, navigate]);

    const onsubmit = async (data: { email: string; password: string }) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/auth/login", data);
            console.log("response", response);
            localStorage.setItem(
                "accessToken",
                response.data.data.access_token
            );
            localStorage.setItem(
                "refreshToken",
                response.data.data.refresh_token
            );
            navigate("/team-members");
        } catch (error) {
            console.log("error", error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onsubmit)}
            className="flex min-h-screen items-center justify-center"
        >
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                        Login to your account
                    </CardTitle>
                    <CardDescription>
                        Enter your email below to login your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            {...register("email", {
                                required: {
                                    value: true,
                                    message: "Email is required",
                                },
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            })}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-sm">
                                {errors.email.message}
                            </span>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register("password", {
                                required: {
                                    value: true,
                                    message: "Password is required",
                                },
                            })}
                        />
                        {errors.password && (
                            <span className="text-red-500 text-sm">
                                {errors.password.message}
                            </span>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button
                        className="w-full cursor-pointer"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-8 w-8 text-black"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-100"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-100"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                ></path>
                            </svg>
                        ) : (
                            "Login"
                        )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/register"
                            className="text-blue-500 hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </form>
    );
};

export default Login;

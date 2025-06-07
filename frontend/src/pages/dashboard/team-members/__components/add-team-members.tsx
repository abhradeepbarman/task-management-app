import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import type { TeamMember } from "../team-members";

const AddTeamMembers = ({
    setTeamMembers,
}: {
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}) => {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            designation: "",
        },
    });

    const onSubmit = async (data: {
        name: string;
        email: string;
        designation: string;
    }) => {
        try {
            const response = await axiosInstance.post("/teams", data);
            if (response.data?.success) {
                toast.success("Team member added successfully");
                reset();
                setTeamMembers((prev) => [...prev, response.data.data]);
            }
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="cursor-pointer">Add Team Member</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Team Member</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name", {
                                required: "Name is required",
                            })}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="johndoe@gmail.com"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "Invalid email address",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                            id="designation"
                            placeholder="Developer"
                            {...register("designation", {
                                required: "Designation is required",
                            })}
                        />
                        {errors.designation && (
                            <p className="text-sm text-red-500">
                                {errors.designation.message}
                            </p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit">Add</AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddTeamMembers;

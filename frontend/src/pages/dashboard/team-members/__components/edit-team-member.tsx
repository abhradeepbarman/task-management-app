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
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { TeamMember } from "../team-members";

const EditTeamMember = ({
    teamMember,
    setTeamMembers,
}: {
    teamMember: TeamMember;
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
            name: teamMember.name,
            email: teamMember.email,
            designation: teamMember.designation,
        },
    });

    const onSubmit = async (data: {
        name: string;
        email: string;
        designation: string;
    }) => {
        try {
            const response = await axiosInstance.put(
                `/teams/${teamMember._id}`,
                data
            );
            if (response.data?.success) {
                toast.success("Team member updated successfully");
                setTeamMembers((prev) =>
                    prev.map((member) =>
                        member._id === teamMember._id
                            ? response.data.data
                            : member
                    )
                );
                setOpen(false);
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
                <Button variant="outline" size="sm">
                    Edit
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Team Member</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Name"
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
                            placeholder="Email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
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
                            placeholder="Designation"
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
                        <AlertDialogCancel type="button">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit">
                            Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditTeamMember;

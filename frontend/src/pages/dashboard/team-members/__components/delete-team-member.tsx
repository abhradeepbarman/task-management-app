import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import type { TeamMember } from "../team-members";

const DeleteTeamMember = ({
    teamMember,
    setTeamMembers,
}: {
    teamMember: TeamMember;
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}) => {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(
                `/teams/${teamMember._id}`
            );
            if (response.data?.success) {
                toast.success("Team member deleted successfully");
                setTeamMembers((prev) =>
                    prev.filter((member) => member._id !== teamMember._id)
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
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the team member.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteTeamMember;

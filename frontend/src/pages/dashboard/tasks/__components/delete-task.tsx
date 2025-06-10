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
import type { Task } from "../tasks";

interface DeleteTaskProps {
    task: Task;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const DeleteTask = ({ task, setTasks }: DeleteTaskProps) => {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete(`/tasks/${task._id}`);
            if (response.data?.success) {
                toast.success("Task deleted successfully");
                setTasks((prev) => prev.filter((t) => t._id !== task._id));
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
                        delete the task "{task.title}" and all its associated
                        data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteTask;

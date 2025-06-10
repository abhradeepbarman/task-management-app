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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { Task } from "../tasks";

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    designation: string;
}

interface Project {
    _id: string;
    name: string;
}

const AddTask = ({
    setTasks,
}: {
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) => {
    const [open, setOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<
        TeamMember[]
    >([]);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            deadline: "",
            projectId: "",
            assignedMembers: [] as string[],
            status: "TODO",
        },
    });

    useEffect(() => {
        const fetchProjectsData = async () => {
            try {
                const projectsResponse = await axiosInstance.get("/projects");
                setProjects(projectsResponse.data.data);
            } catch (error) {
                console.log(error);
                if (error instanceof AxiosError) {
                    toast.error(error.response?.data.message);
                } else {
                    toast.error("Something went wrong");
                }
            }
        };
        fetchProjectsData();
    }, []);

    const fetchTeamMembers = async (value: string) => {
        try {
            const response = await axiosInstance.get(
                `/teams?projectId=${value}`
            );
            setTeamMembers(response.data.data);
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const onSubmit = async (data: {
        title: string;
        description: string;
        deadline: string;
        projectId: string;
        assignedMembers: string[];
        status: string;
    }) => {
        try {
            const response = await axiosInstance.post("/tasks", data);
            if (response.data?.success) {
                toast.success("Task added successfully");
                reset();
                setSelectedTeamMembers([]);
                setTasks((prev) => [...prev, response.data.data]);
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

    const handleTeamMemberSelect = (value: string) => {
        const selectedMember = teamMembers.find(
            (member) => member._id === value
        );
        if (
            selectedMember &&
            !selectedTeamMembers.some(
                (member) => member._id === selectedMember._id
            )
        ) {
            const newSelectedMembers = [...selectedTeamMembers, selectedMember];
            setSelectedTeamMembers(newSelectedMembers);
            setValue(
                "assignedMembers",
                newSelectedMembers.map((member) => member._id)
            );
        }
    };

    const removeTeamMember = (memberId: string) => {
        const newSelectedMembers = selectedTeamMembers.filter(
            (member) => member._id !== memberId
        );
        setSelectedTeamMembers(newSelectedMembers);
        setValue(
            "assignedMembers",
            newSelectedMembers.map((member) => member._id)
        );
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button className="cursor-pointer">Add Task</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add Task</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            placeholder="Task Title"
                            {...register("title", {
                                required: "Task title is required",
                            })}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">
                                {errors.title.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Task Description"
                            {...register("description", {
                                required: "Description is required",
                            })}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                            id="deadline"
                            type="date"
                            {...register("deadline", {
                                required: "Deadline is required",
                            })}
                        />
                        {errors.deadline && (
                            <p className="text-sm text-red-500">
                                {errors.deadline.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="project">Project</Label>
                        <Select
                            onValueChange={(value) => {
                                setValue("projectId", value);
                                fetchTeamMembers(value);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem
                                        key={project._id}
                                        value={project._id}
                                    >
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.projectId && (
                            <p className="text-sm text-red-500">
                                {errors.projectId.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="assignedMembers">
                            Assigned Members
                        </Label>
                        <Select onValueChange={handleTeamMemberSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select team members" />
                            </SelectTrigger>
                            <SelectContent>
                                {teamMembers.map((member) => (
                                    <SelectItem
                                        key={member._id}
                                        value={member._id}
                                        disabled={selectedTeamMembers.some(
                                            (selected) =>
                                                selected._id === member._id
                                        )}
                                    >
                                        {member.name} ({member.designation})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedTeamMembers.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                                >
                                    <span>{member.name}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeTeamMember(member._id)
                                        }
                                        className="text-sm hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        {errors.assignedMembers && (
                            <p className="text-sm text-red-500">
                                {errors.assignedMembers.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            onValueChange={(
                                value: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
                            ) => setValue("status", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                    In Progress
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                    Completed
                                </SelectItem>
                                <SelectItem value="CANCELLED">
                                    Cancelled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-500">
                                {errors.status.message}
                            </p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setSelectedTeamMembers([]);
                            }}
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

export default AddTask;

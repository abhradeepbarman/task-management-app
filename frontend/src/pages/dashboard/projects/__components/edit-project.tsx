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
import type { Project } from "../projects";

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    designation: string;
}

interface EditProjectProps {
    project: Project;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const EditProject = ({ project, setProjects }: EditProjectProps) => {
    const [open, setOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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
            name: project.name,
            description: project.description,
            teamMembers: project.teamMembers.map((member) => member._id),
        },
    });

    useEffect(() => {
        const fetchTeamMembers = async () => {
            const response = await axiosInstance.get("/teams");
            setTeamMembers(response.data.data);
            setSelectedTeamMembers(project.teamMembers);
        };
        fetchTeamMembers();
    }, [project]);

    const onSubmit = async (data: {
        name: string;
        description: string;
        teamMembers: string[];
    }) => {
        try {
            const response = await axiosInstance.put(
                `/projects/${project._id}`,
                data
            );
            if (response.data?.success) {
                toast.success("Project updated successfully");
                setProjects((prev) =>
                    prev.map((p) =>
                        p._id === project._id ? response.data.data : p
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
                "teamMembers",
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
            "teamMembers",
            newSelectedMembers.map((member) => member._id)
        );
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
                    <AlertDialogTitle>Edit Project</AlertDialogTitle>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            placeholder="Project Name"
                            {...register("name", {
                                required: "Project name is required",
                            })}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Project Description"
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
                        <Label htmlFor="teamMembers">Team Members</Label>
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
                        {errors.teamMembers && (
                            <p className="text-sm text-red-500">
                                {errors.teamMembers.message}
                            </p>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                reset();
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction type="submit">
                            Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditProject;

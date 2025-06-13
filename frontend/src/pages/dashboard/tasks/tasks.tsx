import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { taskStatus } from "@/constants";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { Project } from "../projects/projects";
import AddTask from "./__components/add-task";
import DeleteTask from "./__components/delete-task";
import EditTask from "./__components/edit-task";

export interface Task {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    projectId: {
        _id: string;
        name: string;
    };
    assignedMembers: {
        _id: string;
        name: string;
        email: string;
        designation: string;
    }[];
    status: string;
}

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    const [projectFilter, setProjectFilter] = useState("");
    const [memberFilter, setMemberFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined
    );
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<{ _id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const queryParams = new URLSearchParams();
                queryParams.set("page", currentPage.toString());
                queryParams.set("limit", itemsPerPage.toString());

                if (projectFilter) queryParams.set("projectId", projectFilter);
                if (memberFilter) queryParams.set("memberId", memberFilter);
                if (statusFilter) queryParams.set("status", statusFilter);
                if (searchText) queryParams.set("search", searchText);
                if (dateRange?.from)
                    queryParams.set("startDate", dateRange.from.toISOString());
                if (dateRange?.to)
                    queryParams.set("endDate", dateRange.to.toISOString());

                const response = await axiosInstance.get(
                    `/tasks?${queryParams.toString()}`
                );

                if (response.data?.success) {
                    setTasks(response.data.data.data);
                    setTotalPages(response.data.data.pagination.totalPages);
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    toast.error(error.response?.data.message);
                } else {
                    toast.error("Something went wrong");
                }
            }
        };

        fetchTasks();
    }, [
        currentPage,
        projectFilter,
        memberFilter,
        statusFilter,
        searchText,
        dateRange,
    ]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axiosInstance.get(`/projects`);
                setProjects(response.data.data);
            } catch (error) {
                if (error instanceof AxiosError) {
                    toast.error(error.response?.data.message);
                } else {
                    toast.error("Something went wrong");
                }
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await axiosInstance.get(`/teams`);
                setTeams(response.data.data.data);
            } catch (error) {
                if (error instanceof AxiosError) {
                    toast.error(error.response?.data.message);
                } else {
                    toast.error("Something went wrong");
                }
            }
        };
        fetchTeams();
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const changeTaskStatus = async (status: string, taskId: string) => {
        try {
            const response = await axiosInstance.put(`/tasks/${taskId}`, {
                status,
            });
            if (response.data?.success) {
                toast.success("Task status updated successfully");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <AddTask setTasks={setTasks} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                <div className="w-full">
                    <Select onValueChange={setProjectFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by Project" />
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
                </div>

                <div className="w-full">
                    <Select onValueChange={setMemberFilter}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by Member" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams?.map((team) => (
                                <SelectItem key={team._id} value={team._id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full">
                    <Select
                        onValueChange={(val) =>
                            setStatusFilter(val === "ALL" ? "" : val)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value={taskStatus.PENDING}>
                                Pending
                            </SelectItem>
                            <SelectItem value={taskStatus.IN_PROGRESS}>
                                In Progress
                            </SelectItem>
                            <SelectItem value={taskStatus.COMPLETED}>
                                Completed
                            </SelectItem>
                            <SelectItem value={taskStatus.CANCELLED}>
                                Cancelled
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full">
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(
                                                    dateRange.from,
                                                    "LLL dd, y"
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                    dateRange.to,
                                                    "LLL dd, y"
                                                )}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {dateRange && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDateRange(undefined)}
                            >
                                ×
                            </Button>
                        )}
                    </div>
                </div>

                <div className="w-full sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <Input
                        placeholder="Search title or description"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Assigned Members</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task._id}>
                                <TableCell className="font-medium">
                                    {task.title}
                                </TableCell>
                                <TableCell>{task.description}</TableCell>
                                <TableCell>
                                    {new Date(
                                        task.deadline
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{task.projectId?.name}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {task.assignedMembers.map((member) => (
                                            <div
                                                key={member._id}
                                                className="text-sm"
                                            >
                                                <span className="font-medium">
                                                    {member.name}
                                                </span>
                                                {" - "}
                                                {member.designation}
                                            </div>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={task.status}
                                        onValueChange={(value) =>
                                            changeTaskStatus(value, task._id)
                                        }
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value={taskStatus.PENDING}
                                            >
                                                Pending
                                            </SelectItem>
                                            <SelectItem
                                                value={taskStatus.IN_PROGRESS}
                                            >
                                                In Progress
                                            </SelectItem>
                                            <SelectItem
                                                value={taskStatus.COMPLETED}
                                            >
                                                Completed
                                            </SelectItem>
                                            <SelectItem
                                                value={taskStatus.CANCELLED}
                                            >
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end items-center gap-2">
                                        <EditTask
                                            task={task}
                                            setTasks={setTasks}
                                        />
                                        <DeleteTask
                                            task={task}
                                            setTasks={setTasks}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center items-center mt-6 gap-2">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="mx-2">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Tasks;

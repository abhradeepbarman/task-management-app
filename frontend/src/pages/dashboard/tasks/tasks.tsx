import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddTask from "./__components/add-task";
import DeleteTask from "./__components/delete-task";
import EditTask from "./__components/edit-task";
import type { Project } from "../projects/projects";
import type { DateRange } from "react-day-picker";

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

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setDateRange(range);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <AddTask setTasks={setTasks} />
            </div>

            <div className=" flex gap-4 mb-4">
                <Select onValueChange={setProjectFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setMemberFilter}>
                    <SelectTrigger>
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

                <Select
                    onValueChange={(val) =>
                        setStatusFilter(val === "ALL" ? "" : val)
                    }
                >
                    <SelectTrigger>
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

                <Input
                    placeholder="Search title or description"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "justify-start text-left font-normal",
                                {
                                    "text-muted-foreground":
                                        !dateRange?.from && !dateRange?.to,
                                }
                            )}
                        >
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} –{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Select date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            initialFocus
                            mode="range"
                            selected={dateRange}
                            onSelect={handleDateRangeSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Assigned Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow key={task._id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.description}</TableCell>
                            <TableCell>
                                {new Date(task.deadline).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{task.projectId?.name}</TableCell>
                            <TableCell>
                                {task.assignedMembers.map((member) => (
                                    <div key={member._id}>
                                        <span className="font-semibold">
                                            {member.name}
                                        </span>{" "}
                                        - {member.email} - {member.designation}
                                    </div>
                                ))}
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
                                        <SelectItem value={taskStatus.PENDING}>
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
                                <div className="flex items-center gap-2">
                                    <EditTask task={task} setTasks={setTasks} />
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

            <div className="flex justify-center items-center mt-4 gap-2">
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

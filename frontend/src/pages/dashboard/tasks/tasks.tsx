import { Button } from "@/components/ui/button";
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
import toast from "react-hot-toast";
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

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosInstance.get(
                    `/tasks?page=${currentPage}&limit=${itemsPerPage}`
                );
                if (response.data?.success) {
                    setTasks(response.data.data.data);
                    setTotalPages(response.data.data.pagination.totalPages);
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

        fetchTasks();
    }, [currentPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = tasks.slice(startIndex, endIndex);

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
            console.log(error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <AddTask setTasks={setTasks} />
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
                    {currentItems.map((task, index) => (
                        <TableRow key={index}>
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

            {/* Pagination */}
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

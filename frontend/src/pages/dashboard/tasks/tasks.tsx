import axiosInstance from "@/lib/axios";
import AddTask from "./__components/add-task";
import EditTask from "./__components/edit-task";
import DeleteTask from "./__components/delete-task";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export interface Task {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    project: {
        _id: string;
        name: string;
    };
    assignedMembers: {
        _id: string;
        name: string;
        email: string;
        designation: string;
    }[];
    status: "TODO" | "IN_PROGRESS" | "COMPLETED";
}

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosInstance.get(
                    `/tasks?page=${currentPage}&limit=${itemsPerPage}`
                );
                if (response.data?.success) {
                    setTasks(response.data.data);
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

    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = tasks.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                        task.status === "COMPLETED"
                                            ? "bg-green-100 text-green-800"
                                            : task.status === "IN_PROGRESS"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {task.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {/* <EditTask task={task} setTasks={setTasks} /> */}
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

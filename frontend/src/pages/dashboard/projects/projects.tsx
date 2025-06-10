import axiosInstance from "@/lib/axios";
import AddProject from "./__components/add-project";
import EditProject from "./__components/edit-project";
import DeleteProject from "./__components/delete-project";
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

export interface Project {
    _id: string;
    name: string;
    description: string;
    teamMembers: {
        _id: string;
        adminId: string;
        name: string;
        email: string;
        designation: string;
    }[];
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axiosInstance.get(
                    `/projects?page=${currentPage}&limit=${itemsPerPage}`
                );
                if (response.data?.success) {
                    setProjects(response.data.data);
                    setTotalPages(response.data.pagination.totalPages);
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

        fetchProjects();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects</h1>
                <AddProject setProjects={setProjects} />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Team Members</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project, index) => (
                        <TableRow key={index}>
                            <TableCell>{project.name}</TableCell>
                            <TableCell>{project.description}</TableCell>
                            <TableCell>
                                {project.teamMembers.map((teamMember) => (
                                    <div key={teamMember._id}>
                                        <span className="font-semibold">
                                            {teamMember.name}
                                        </span>{" - "}
                                        {teamMember.designation}
                                    </div>
                                ))}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <EditProject
                                        project={project}
                                        setProjects={setProjects}
                                    />
                                    <DeleteProject
                                        project={project}
                                        setProjects={setProjects}
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

export default Projects;

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddTeamMembers from "./__components/add-team-members";
import DeleteTeamMember from "./__components/delete-team-member";
import EditTeamMember from "./__components/edit-team-member";

export interface TeamMember {
    _id: string;
    name: string;
    email: string;
    designation: string;
}

const TeamMembers = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await axiosInstance.get(
                    `/teams?page=${currentPage}&limit=${itemsPerPage}`
                );
                if (response.data?.success) {
                    setTeamMembers(response.data.data.data);
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

        fetchTeamMembers();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Team Members</h1>
                <AddTeamMembers setTeamMembers={setTeamMembers} />
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teamMembers.map((member) => (
                            <TableRow key={member._id}>
                                <TableCell className="font-medium">
                                    {member.name}
                                </TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>{member.designation}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end items-center gap-2">
                                        <EditTeamMember
                                            teamMember={member}
                                            setTeamMembers={setTeamMembers}
                                        />
                                        <DeleteTeamMember
                                            teamMember={member}
                                            setTeamMembers={setTeamMembers}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
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

export default TeamMembers;

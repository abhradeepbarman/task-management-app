import { BarChart2, CheckSquare, FolderKanban, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="flex px-6 py-3 bg-white shadow-sm">
            <div
                className="text-2xl font-bold text-gray-900 mr-8 cursor-pointer"
                onClick={() => navigate("/")}
            >
                TaskFlow
            </div>

            <div className="flex justify-between w-full items-center">
                <ul className="flex items-center space-x-6">
                    <Link
                        to={"/"}
                        className={`flex items-center px-4 py-2 rounded-md ${
                            pathname === "/"
                                ? "bg-[#0f172a] text-white"
                                : ""
                        }`}
                    >
                        <BarChart2 className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold">Dashboard</span>
                    </Link>

                    <Link
                        to={"/team-members"}
                        className={`flex items-center px-4 py-2 rounded-md ${
                            pathname === "/team-members"
                                ? "bg-[#0f172a] text-white"
                                : ""
                        }`}
                    >
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Teams</span>
                    </Link>

                    <Link
                        to={"/projects"}
                        className={`flex items-center px-4 py-2 rounded-md ${
                            pathname === "/projects"
                                ? "bg-[#0f172a] text-white"
                                : ""
                        }`}
                    >
                        <FolderKanban className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Projects</span>
                    </Link>

                    <Link
                        to={"/tasks"}
                        className={`flex items-center px-4 py-2 rounded-md ${
                            pathname === "/tasks"
                                ? "bg-[#0f172a] text-white"
                                : ""
                        }`}
                    >
                        <CheckSquare className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Tasks</span>
                    </Link>
                </ul>

                <LogoutButton />
            </div>
        </nav>
    );
};

export default Navbar;

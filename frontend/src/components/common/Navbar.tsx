import { CheckSquare, FolderKanban, Menu, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const NavLinks = () => (
        <>
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
                    pathname === "/projects" ? "bg-[#0f172a] text-white" : ""
                }`}
            >
                <FolderKanban className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Projects</span>
            </Link>

            <Link
                to={"/tasks"}
                className={`flex items-center px-4 py-2 rounded-md ${
                    pathname === "/tasks" ? "bg-[#0f172a] text-white" : ""
                }`}
            >
                <CheckSquare className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Tasks</span>
            </Link>
        </>
    );

    return (
        <nav className="flex px-6 py-3 bg-white shadow-sm">
            <div
                className="text-2xl font-bold text-gray-900 mr-8 cursor-pointer"
                onClick={() => navigate("/team-members")}
            >
                TaskFlow
            </div>

            <div className="flex justify-between w-full items-center">
                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center space-x-6">
                    <NavLinks />
                </ul>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-[240px] sm:w-[300px]"
                        >
                            <div className="flex flex-col space-y-4 mt-8">
                                <NavLinks />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <LogoutButton />
            </div>
        </nav>
    );
};

export default Navbar;

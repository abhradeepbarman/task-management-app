import Navbar from "@/components/common/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

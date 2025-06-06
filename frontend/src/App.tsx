import { Route, Routes } from "react-router-dom";
import Register from "./pages/auth/register";
import Login from "./pages/auth/login";
import Index from "./pages/dashboard";

const App = () => {
    return (
        <div>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Index />} />
            </Routes>
        </div>
    );
};

export default App;

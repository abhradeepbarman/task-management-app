import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Layout from "./pages/dashboard/layout";
import Projects from "./pages/dashboard/projects/projects";
import Tasks from "./pages/dashboard/tasks/tasks";
import TeamMembers from "./pages/dashboard/team-members/team-members";
import NotFound from "./pages/not-found/not-found";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
    return (
        <div>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        path="team-members"
                        element={<TeamMembers />}
                    />
                    <Route path="projects" element={<Projects />} />
                    <Route path="tasks" element={<Tasks />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;

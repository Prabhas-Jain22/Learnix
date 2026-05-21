import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import OTPLogin from "./pages/OTPLogin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Assignments from "./pages/Assignments";
import AssignmentAttempt from "./pages/AssignmentAttempt";
import InstructorAssignments from "./pages/InstructorAssignments";
import InstructorResults from "./pages/InstructorResults";
import Doubts from "./pages/Doubts";
import AIAssistant from "./pages/AIAssistant";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes without navbar */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-login" element={<OTPLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Main app routes with navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/assignments/:courseId" element={<Assignments />} />
              <Route path="/assignment/:assignmentId" element={<AssignmentAttempt />} />
              <Route path="/instructor/course/:courseId/assignments" element={<InstructorAssignments />} />
              <Route path="/instructor/course/:courseId/results" element={<InstructorResults />} />
              <Route path="/doubts/:courseId" element={<Doubts />} />
              <Route path="/dashboard/ai" element={<AIAssistant />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
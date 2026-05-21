import { useNavigate } from "react-router-dom";
import RoleCard from "../components/RoleCard";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-content role-selection-container">
        <div className="role-selection-header">
          <h1>Welcome to Learnix</h1>
          <p>Choose your role to get started with your learning journey</p>
        </div>

        <div className="role-cards-grid">
          <RoleCard
            title="Student"
            description="Enroll in courses, watch lessons, and track your progress"
            icon="🎓"
            features={[
              "Access enrolled courses",
              "Watch video lessons",
              "Track learning progress",
              "Complete assignments"
            ]}
            onClick={() => handleRoleSelect("student")}
            color="blue"
          />

          <RoleCard
            title="Instructor"
            description="Create courses, upload content, and manage students"
            icon="👨‍🏫"
            features={[
              "Create and manage courses",
              "Upload video lessons",
              "Track student progress",
              "Manage course content"
            ]}
            onClick={() => handleRoleSelect("instructor")}
            color="green"
          />
        </div>

        <div className="text-center" style={{ color: 'white' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
            Don't have an account?{" "}
            <span style={{ fontWeight: '600' }}>
              Select your role above to get started
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
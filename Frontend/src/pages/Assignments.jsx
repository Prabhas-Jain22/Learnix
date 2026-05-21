import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Toast from "../components/Toast";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Assignments() {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios.get(`${API_URL}/api/assignments/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAssignments(res.data);
    })
    .catch(err => {
      const message = err.response?.data?.message || "Failed to load assignments";
      setError(message);
      setToast({ message, type: "error" });
    })
    .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading assignments...</p>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-hero">
        <div className="container">
          <h1 className="section-title">Assignments</h1>
          <p className="section-description">Assignments available for this course.</p>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="empty-state">
            <p className="section-description">No assignments available for this course yet.</p>
            <Link to={`/courses/${courseId}`} className="btn btn-primary">Back to Course</Link>
          </div>
        ) : (
          <div className="course-grid-wide">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="assignment-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="section-title" style={{ fontSize: '1.25rem' }}>{assignment.title}</h2>
                  {assignment.description && <p className="section-description">{assignment.description}</p>}
                  <div className="text-sm text-muted flex flex-wrap gap-4">
                    <span>{assignment.questions?.length || 0} questions</span>
                    <span>{assignment.totalMarks} marks</span>
                    {assignment.dueDate && <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <Link to={`/assignment/${assignment._id}`} className="btn btn-primary btn-sm">Start Assignment</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Assignments;

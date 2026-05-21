import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InstructorResults() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [filterAssignment, setFilterAssignment] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadData = async () => {
      try {
        const courseRes = await axios.get(`${API_URL}/api/courses/${courseId}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(courseRes.data);

        const resultsRes = await axios.get(`${API_URL}/api/assignments/results/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(resultsRes.data.results || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load results");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const filteredResults = filterAssignment
    ? results.filter((r) => r.assignmentId?._id === filterAssignment)
    : results;

  const assignments = [...new Set(results.map((r) => r.assignmentId?._id))].map((id) =>
    results.find((r) => r.assignmentId?._id === id)?.assignmentId
  );

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="error-banner">
          <h3>⚠️ Access Denied</h3>
          <p>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container py-8">
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Assignment Results</h1>
            <p className="page-header-meta">Student submissions and grades for {course?.title}</p>
          </div>
          <Link to={`/instructor/course/${courseId}/assignments`} className="btn btn-secondary">
            Back to Assignments
          </Link>
        </div>

        <div className="section-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <label className="block text-sm font-semibold mb-2">Filter by Assignment:</label>
          <select
            value={filterAssignment}
            onChange={(e) => setFilterAssignment(e.target.value)}
            className="w-full"
          >
            <option value="">All Assignments</option>
            {assignments.map((assignment) => (
              <option key={assignment?._id} value={assignment?._id}>
                {assignment?.title}
              </option>
            ))}
          </select>
        </div>

        {filteredResults.length === 0 ? (
          <div className="info-panel">
            <p>No submissions yet for this course.</p>
          </div>
        ) : (
          <div className="table-card">
            <table className="table-basic">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, idx) => (
                  <tr key={idx}>
                    <td>
                      <div>
                        <p className="font-semibold">{result.studentId?.name || 'Unknown'}</p>
                        <p className="text-gray-500" style={{ fontSize: '0.85rem' }}>{result.studentId?.email}</p>
                      </div>
                    </td>
                    <td>{result.assignmentId?.title}</td>
                    <td style={{ textAlign: 'center' }}>
                      <strong>{result.totalMarks - (result.totalMarks * ((100 - result.scorePercentage) / 100))}/{result.totalMarks}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-pill ${
                        result.scorePercentage >= 70 ? 'badge-positive' : result.scorePercentage >= 50 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {result.scorePercentage}%
                      </span>
                    </td>
                    <td>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Not submitted'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorResults;

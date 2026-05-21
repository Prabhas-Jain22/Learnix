import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  const calculateCourseProgress = (course) => {
    if (!course.lessons || course.lessons.length === 0) {
      return 0;
    }
    
    // Get watched lessons from localStorage
    const watchedKey = `watched_${course._id}`;
    const watched = JSON.parse(localStorage.getItem(watchedKey)) || [];
    
    // Calculate progress based on watched lessons
    const progress = (watched.length / course.lessons.length) * 100;
    return Math.round(Math.min(100, Math.max(0, progress)));
  };

  const isCourseLikelyCompleted = (progress) => {
    return progress >= 90;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios.get(`${API_URL}/api/courses/my-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const coursesWithProgress = res.data.map(course => ({
        ...course,
        progressPercentage: calculateCourseProgress(course)
      }));

      setCourses(coursesWithProgress);
      
      const completedCount = coursesWithProgress.filter(c => isCourseLikelyCompleted(c.progressPercentage)).length;
      const inProgressCount = coursesWithProgress.length - completedCount;
      
      setStats({
        total: coursesWithProgress.length,
        completed: completedCount,
        inProgress: inProgressCount
      });
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return;
      }
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to load courses";
      setError(errorMsg);
      console.error("Dashboard error:", err);
    });
  }, []);

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="error-banner">
          <h3>⚠️ Error Loading Dashboard</h3>
          <p>{error}</p>
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem'}}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
            <Link to="/" className="btn btn-secondary">
              Browse Courses
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/login";
              }} 
              className="btn btn-secondary"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard Header */}
      <div className="page-hero">
        <div className="container">
          <div className="section-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <h1 className="section-title">My Learning Dashboard</h1>
              <p className="section-description">Continue your learning journey</p>
            </div>
            <div className="section-actions">
              <Link to="/dashboard/ai" className="btn btn-secondary btn-sm">
                Ask AI
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        {courses.length > 0 && (
          <div className="stats-grid">
            <div className="status-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="card-label">Total Courses</div>
              <div className="card-value">{stats.total}</div>
            </div>
            <div className="status-card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="card-label">Completed</div>
              <div className="card-value" style={{ color: 'var(--success)' }}>{stats.completed}</div>
            </div>
            <div className="status-card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div className="card-label">In Progress</div>
              <div className="card-value" style={{ color: 'var(--warning)' }}>{stats.inProgress}</div>
            </div>
          </div>
        )}

        {/* Courses */}
        {courses.length > 0 ? (
          <>
            <h2 className="section-title">Your Courses</h2>
            <div className="courses-grid">
              {courses.map(course => {
                const rawThumbnail = course.thumbnail || "https://via.placeholder.com/400x250?text=Course";
                const thumbnailUrl = rawThumbnail.startsWith("http")
                  ? rawThumbnail
                  : `${API_URL}${rawThumbnail}`;

                const progress = course.progressPercentage || 0;
                const isCompleted = isCourseLikelyCompleted(progress);
                const progressColor = progress >= 75 ? 'var(--success)' : progress >= 50 ? 'var(--warning)' : 'var(--primary)';

                return (
                  <div key={course._id} className="course-card">
                    <div className="course-image">
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x250?text=Course"; }}
                      />
                      <div className="course-overlay">
                        <Link to={`/course/${course._id}`} className="btn btn-primary btn-sm">
                          Continue
                        </Link>
                      </div>
                      <div className="course-badge" style={{background: isCompleted ? 'rgba(16, 185, 129, 0.95)' : 'rgba(59, 130, 246, 0.95)'}}>
                        {isCompleted ? '✓ Completed' : `${progress}% Complete`}
                      </div>
                    </div>

                    <div className="course-body">
                      <Link to={`/course/${course._id}`} className="course-title">
                        {course.title}
                      </Link>
                      <p className="course-description">
                        {course.description}
                      </p>
                      
                      <div className="course-progress-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="course-progress-line">
                    <div className="course-progress-bar" style={{ width: `${progress}%`, backgroundColor: progressColor }}></div>
                  </div>
                </div>

                      <div className="course-meta">
                        <span className="meta-item">
                          📚 {course.lessons?.length || 0} lessons
                        </span>
                        <span className="meta-item">
                          ⏱️ ~{Math.ceil((course.lessons?.length || 1) * 10 * ((100 - progress) / 100))}h remaining
                        </span>
                      </div>

                      <Link to={`/course/${course._id}`} className="btn btn-primary btn-block">
                        {isCompleted ? '📋 Review Course' : '▶️ Continue Learning'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No Courses Yet</h2>
            <p>You haven't enrolled in any courses yet. Start learning today!</p>
            <Link to="/" className="btn btn-primary">
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
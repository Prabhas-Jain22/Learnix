import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Home() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    axios.get(`${API_URL}/api/courses`)
      .then(res => {
        setCourses(res.data);
        setFilteredCourses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const enroll = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/courses/enroll/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✓ Enrolled successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading courses...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Learn Anything, Anytime</h1>
            <p className="hero-subtitle">Discover courses from expert instructors and advance your skills</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{courses.length}+</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="search-clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <span className="results-count">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </span>
          {searchTerm && (
            <span className="results-tag">
              Searching for: <strong>"{searchTerm}"</strong>
            </span>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map(course => {
              const rawThumbnail = course.thumbnail || "https://via.placeholder.com/400x250?text=Course+Image";
              const thumbnailUrl = rawThumbnail.startsWith("http")
                ? rawThumbnail
                : `${API_URL}${rawThumbnail}`;

              return (
                <div key={course._id} className="course-card">
                  <div className="course-image">
                    <img
                      src={thumbnailUrl}
                      alt={course.title}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/400x250?text=Course+Image"; }}
                    />
                    <div className="course-overlay">
                      <Link to={`/course/${course._id}`} className="btn btn-primary btn-sm">
                        View Details
                      </Link>
                    </div>
                    <div className="course-badge">
                      📚 {course.lessons?.length || 0} lessons
                    </div>
                  </div>

                  <div className="course-body">
                    <Link to={`/course/${course._id}`} className="course-title">
                      {course.title}
                    </Link>
                    <p className="course-description">
                      {course.description}
                    </p>
                    
                    <div className="course-meta">
                      <span className="meta-item">
                        👤 {typeof course.instructor === 'object' ? course.instructor?.name || course.instructor?.email : course.instructor || "Instructor"}
                      </span>
                      <span className="meta-item">
                        ⭐ 4.8 ({Math.floor(Math.random() * 100) + 50} reviews)
                      </span>
                    </div>

                    <button
                      onClick={() => enroll(course._id)}
                      className="btn btn-primary btn-block"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No Courses Found</h2>
            <p>Try adjusting your search terms</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="btn btn-primary"
            >
              Clear Search
            </button>
          </div>
        )}

        {courses.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No Courses Available Yet</h2>
            <p>Check back soon for new exciting courses</p>
            <p className="small-note">
              Contact instructors to create your first course
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
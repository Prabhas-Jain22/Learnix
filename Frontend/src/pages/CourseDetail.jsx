import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const [currentLesson, setCurrentLesson] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const getSafeVideoUrl = (url) => {
    if (!url) return "";
    
    // Handle YouTube URLs
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return getYouTubeEmbedUrl(url);
    }
    
    // Handle regular URLs (http/https)
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Handle relative paths
    if (url.startsWith("/")) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId = "";
    
    try {
      // Handle youtu.be short links
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0].split("&")[0];
      }
      // Handle youtube.com/watch?v= format
      else if (url.includes("watch?v=")) {
        videoId = url.split("watch?v=")[1].split("&")[0];
      }
      // Handle youtube.com/embed/ format
      else if (url.includes("/embed/")) {
        videoId = url.split("/embed/")[1].split("?")[0];
      }
      // Handle youtube.com/v/ format
      else if (url.includes("/v/")) {
        videoId = url.split("/v/")[1].split("?")[0];
      }
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
      return url;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&modestbranding=1&rel=0`;
    }
    
    return url;
  };

  const trackLessonWatched = () => {
    if (!course || !lesson) return;
    
    const watchedKey = `watched_${course._id}`;
    const watched = JSON.parse(localStorage.getItem(watchedKey)) || [];

    if (!watched.includes(currentLesson)) {
      watched.push(currentLesson);
      localStorage.setItem(watchedKey, JSON.stringify(watched));
    }
  };

  const loadCourse = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/courses/${courseId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourse(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load course details:", err);
      setLoading(false);
      alert("Failed to load course. Please check if you're enrolled.");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setDeletingLesson(true);
    setDeleteError(null);

    try {
      const res = await axios.delete(
        `${API_URL}/api/courses/${courseId}/lesson/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourse(res.data.course);
      setCurrentLesson((prev) => Math.min(prev, Math.max(0, res.data.course.lessons.length - 1)));
      setDeleteError(null);
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setDeleteError(err.response?.data?.message || "Unable to delete lesson");
    } finally {
      setDeletingLesson(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAssignmentsError("Login required to load assignments");
      setAssignmentsLoading(false);
      return;
    }

    setAssignmentsLoading(true);
    axios.get(`${API_URL}/api/assignments/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAssignments(res.data);
      setAssignmentsError("");
    })
    .catch(err => {
      console.error("Failed to load course assignments:", err);
      setAssignmentsError(err.response?.data?.message || "Unable to load assignments for this course");
      setAssignments([]);
    })
    .finally(() => {
      setAssignmentsLoading(false);
    });
  }, [courseId]);

  useEffect(() => {
    // Track lesson as watched after 5 seconds of watching
    if (!course || !lesson) return;
    
    const timer = setTimeout(() => {
      trackLessonWatched();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentLesson, course?._id]);

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mt-8 text-center">
        <div className="course-detail-card">
          <h2>Course Not Found</h2>
          <p className="section-description mt-4">
            This course doesn't exist or you don't have access to it.
          </p>
          <a href="/" className="btn btn-primary mt-4">
            Back to Courses
          </a>
        </div>
      </div>
    );
  }

  const lesson = course?.lessons?.[currentLesson] || null;
  const videoUrl = getSafeVideoUrl(lesson?.videoUrl);

  return (
    <div className="container py-8">
      {/* Course Header */}
      <div className="mb-8">
        <h1 className="section-title">{course.title}</h1>
        <p className="section-description">{course.description}</p>
      </div>

      <div className="course-detail-grid">
        {/* Video Player */}
        <div>
          <h2 className="section-title section-title-sm">Lesson {currentLesson + 1}: {lesson?.title || "No lesson selected"}</h2>
          <div className="card">
            <div className="video-container">
              {videoLoading && (
                <div className="video-loading">
                  <div className="loading"></div>
                  <p className="mt-4">Loading video...</p>
                </div>
              )}

              {videoError && (
                <div className="video-error">⚠️ {videoError}</div>
              )}

              {!lesson && (
                <div className="empty-state empty-state-dark">
                  <p className="section-description">📽️ Select a lesson to play video</p>
                </div>
              )}

              {lesson && (lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be")) ? (
                <iframe
                  key={`youtube-${currentLesson}`}
                  src={videoUrl}
                  title={`Lesson ${currentLesson + 1}: ${lesson.title}`}
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                  onLoad={() => setVideoLoading(false)}
                  style={{ 
                    display: videoLoading ? 'none' : 'block', 
                    width: '100%', 
                    height: '100%',
                    borderRadius: '8px'
                  }}
                />
              ) : lesson ? (
                <video
                  key={`video-${currentLesson}`}
                  controls
                  controlsList="nodownload"
                  preload="metadata"
                  onLoadStart={() => {
                    setVideoLoading(true);
                    setVideoError(null);
                  }}
                  onLoadedData={() => setVideoLoading(false)}
                  onError={() => {
                    setVideoLoading(false);
                    setVideoError('Unable to load video. Check the file URL or CORS settings.');
                  }}
                  style={{ 
                    display: videoLoading ? 'none' : 'block', 
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  <source src={videoUrl} type="video/webm" />
                  <source src={videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>

            {/* Lesson Navigation */}
            <div className="lesson-nav">
              <button
                onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                disabled={currentLesson === 0}
                className="btn btn-secondary"
              >
                ⬅️ Previous
              </button>
              <button
                onClick={() => setCurrentLesson(Math.min(course.lessons.length - 1, currentLesson + 1))}
                disabled={currentLesson === course.lessons.length - 1}
                className="btn btn-primary"
              >
                Next ➡️
              </button>
            </div>
            {role === 'instructor' && lesson && (
              <div className="lesson-delete-row">
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(lesson._id)}
                  disabled={deletingLesson}
                  className="btn btn-danger btn-sm"
                >
                  {deletingLesson ? 'Deleting Lesson…' : 'Delete Lesson'}
                </button>
                {deleteError && <span className="text-danger">{deleteError}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Lesson List */}
        <div>
          <h2 className="section-title section-title-sm">📚 Course Lessons ({course.lessons.length})</h2>
          <div className="lesson-list">
            {course.lessons.map((lesson, index) => (
              <div
                key={index}
                onClick={() => setCurrentLesson(index)}
                className={`lesson-item ${currentLesson === index ? 'active' : ''}`}
              >
                <div className="lesson-number">
                  {currentLesson === index ? '▶️' : index + 1}
                </div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <p className="lesson-type">
                    {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be")
                      ? "🎬 YouTube Video"
                      : "📹 Uploaded Video"}
                  </p>
                </div>
                {currentLesson === index && (
                  <div className="lesson-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {course.lessons.length === 0 && (
        <div className="text-center">
          <div className="card">
            <h3>No Lessons Yet</h3>
            <p className="section-description mt-2">
              This course doesn't have any lessons yet. Check back later!
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="course-detail-card">
          <div className="section-header">
            <div>
              <h2 className="section-title section-title-sm">Course Assignments</h2>
              <p className="section-description">
                Assignments for this course are loaded by course ID only.
              </p>
            </div>
            <div className="section-actions">
              <Link to={`/assignments/${courseId}`} className="btn btn-secondary btn-sm">
                View All Assignments
              </Link>
              {role === 'instructor' && (
                <Link to={`/instructor/course/${courseId}/assignments`} className="btn btn-primary btn-sm">
                  Manage Assignments
                </Link>
              )}
            </div>
          </div>

          {assignmentsLoading ? (
            <p>Loading assignments...</p>
          ) : assignmentsError ? (
            <p className="text-danger">{assignmentsError}</p>
          ) : assignments.length === 0 ? (
            <p>No assignments available for this course yet.</p>
          ) : (
            <div className="course-grid-wide">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="assignment-card">
                  <h3 className="assignment-title">{assignment.title}</h3>
                  {assignment.description && <p className="section-description assignment-description">{assignment.description}</p>}
                  <div className="assignment-meta-row">
                    <span>{assignment.questions?.length || 0} questions</span>
                    <span>{assignment.totalMarks} marks</span>
                    {assignment.dueDate && <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
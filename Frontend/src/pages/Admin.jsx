import { useState, useEffect } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Admin() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", thumbnail: "" });
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newLesson, setNewLesson] = useState({ title: "", videoUrl: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch {
      alert("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const uploadVideo = async () => {
    if (!videoFile) return alert("Select a video file");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const res = await axios.post(`${API_URL}/api/courses/upload-video`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewLesson({ ...newLesson, videoUrl: res.data.videoUrl });
      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Upload video failed:", error.response?.status, error.response?.data, error.message);
      alert("Upload failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return alert("Select a thumbnail image file");

    setThumbnailUploading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    try {
      const res = await axios.post(`${API_URL}/api/courses/upload-thumbnail`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const thumbnailUrl = res.data.thumbnail.startsWith("http")
        ? res.data.thumbnail
        : `${API_URL}${res.data.thumbnail}`;

      setNewCourse(prev => ({ ...prev, thumbnail: thumbnailUrl }));
      alert("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error("Upload thumbnail failed:", error.response?.status, error.response?.data, error.message);
      alert("Thumbnail upload failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const uploadLesson = async () => {
    if (!selectedCourse) return alert("Select a course");
    if (!newLesson.title) return alert("Enter lesson title");
    if (!videoFile) return alert("Select a video file");

    setUploading(true);
    setUploadProgress(0);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", newLesson.title);

    try {
      await axios.post(`${API_URL}/api/courses/upload-lesson/${selectedCourse}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      alert("Lesson uploaded and added successfully!");
      setNewLesson({ title: "", videoUrl: "" });
      setVideoFile(null);
      setSelectedCourse("");
      setUploadProgress(0);
      fetchCourses();
      setActiveTab("mycourses");
    } catch (error) {
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const createCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      return alert("Please fill in all required fields");
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/api/courses/create`, newCourse, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Course created successfully!");
      setNewCourse({ title: "", description: "", thumbnail: "" });
      setThumbnailFile(null);
      fetchCourses();
      setActiveTab("mycourses");
    } catch {
      alert("Failed to create course");
    }
  };

  const addLesson = async () => {
    if (!selectedCourse) return alert("Select a course");
    if (!newLesson.title || !newLesson.videoUrl) return alert("Fill all lesson fields");

    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/api/courses/add-lesson/${selectedCourse}`, newLesson, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Lesson added successfully!");
      setNewLesson({ title: "", videoUrl: "" });
      setVideoFile(null);
      setSelectedCourse("");
      fetchCourses();
    } catch {
      alert("Failed to add lesson");
    }
  };

  const deleteCourse = async (courseId, courseTitle) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Course deleted successfully!");
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete course");
      console.error("Delete error:", error);
    }
  };

  // Calculate statistics
  const stats = {
    totalCourses: courses.length,
    totalStudents: new Set(courses.flatMap(c => c.students || [])).size,
    totalLessons: courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0)
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-8">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Instructor Dashboard</h1>
          <p className="page-header-meta">Manage courses, lessons, and track student progress</p>
        </div>
      </div>

      <div className="stats-grid mb-8">
        <div className="section-panel card-accent accent-blue">
          <p className="text-gray-600 text-sm">Total Courses</p>
          <h3 className="stat-value">{stats.totalCourses}</h3>
        </div>
        <div className="section-panel card-accent accent-green">
          <p className="text-gray-600 text-sm">Total Students</p>
          <h3 className="stat-value">{stats.totalStudents}</h3>
        </div>
        <div className="section-panel card-accent accent-gold">
          <p className="text-gray-600 text-sm">Total Lessons</p>
          <h3 className="stat-value">{stats.totalLessons}</h3>
        </div>
      </div>

      <div className="tab-nav">
        <button onClick={() => setActiveTab("create")} className={`tab-btn ${activeTab === "create" ? "active" : ""}`}>
          📝 Create Course
        </button>
        <button onClick={() => setActiveTab("upload")} className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}>
          🎬 Upload Lesson
        </button>
        <button onClick={() => setActiveTab("lesson")} className={`tab-btn ${activeTab === "lesson" ? "active" : ""}`}>
          ➕ Add Lesson
        </button>
        <button onClick={() => setActiveTab("mycourses")} className={`tab-btn ${activeTab === "mycourses" ? "active" : ""}`}>
          📚 My Courses
        </button>
      </div>

      {/* Create Course Tab */}
      {activeTab === "create" && (
        <div className="grid grid-2 gap-8">
          <div className="section-panel">
            <h2 className="mb-6">Create New Course</h2>
            <form onSubmit={(e) => { e.preventDefault(); createCourse(); }} className="space-y-4">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  required
                  className="w-full"
                  placeholder="e.g., Advanced React Development"
                />
              </div>
              <div className="form-group">
                <label>Course Description *</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  required
                  className="w-full"
                  rows="5"
                  placeholder="Provide a detailed course description"
                />
              </div>

              <div className="form-group">
                <label>Course Thumbnail URL</label>
                <input
                  type="url"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                  className="w-full"
                  placeholder="https://example.com/image.jpg"
                />
                <small className="text-gray-500">Leave blank for default placeholder</small>
              </div>

              <div className="form-group">
                <label>Or upload thumbnail image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={uploadThumbnail}
                  disabled={thumbnailUploading}
                  className="btn btn-secondary mt-2 w-full"
                >
                  {thumbnailUploading ? "Uploading thumbnail..." : "Upload Thumbnail"}
                </button>
              </div>

              {newCourse.thumbnail && (
                <div className="mb-4">
                  <p className="text-green-600 text-sm">Thumbnail set successfully.</p>
                </div>
              )}

              <button type="submit" className="btn btn-success w-full">
                ✅ Create Course
              </button>
            </form>
          </div>

          <div className="section-panel">
            <h3 className="mb-4">Course Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✨ Use clear, descriptive titles</li>
              <li>📖 Write comprehensive descriptions</li>
              <li>🖼️ Add professional thumbnail images</li>
              <li>📚 Organize content into lessons</li>
              <li>👥 Engage with your students</li>
            </ul>
          </div>
        </div>
      )}

      {/* Upload Lesson Tab */}
      {activeTab === "upload" && (
        <div className="grid grid-2 gap-8">
          <div className="section-panel">
            <h2 className="mb-6">Upload Video Lesson</h2>
            <form onSubmit={(e) => { e.preventDefault(); uploadLesson(); }} className="space-y-4">
              <div className="form-group">
                <label>Select Course *</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.lessons?.length || 0} lessons)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                  className="w-full"
                  placeholder="e.g., Introduction to React Hooks"
                />
              </div>

              <div className="form-group">
                <label>Upload Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full"
                  required
                />
                <small className="text-gray-500">Supported formats: MP4, AVI, MOV, etc. (Max: 100MB)</small>
                {videoFile && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <p className="text-sm">📹 {videoFile.name}</p>
                    <p className="text-xs text-gray-600">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="form-group">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-success w-full"
                disabled={uploading}
              >
                {uploading ? "⏳ Uploading..." : "🎬 Upload & Add Lesson"}
              </button>
            </form>
          </div>

          <div className="section-panel">
            <h3 className="mb-4">Video Upload Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>🎬 Keep videos under 100MB for best performance</li>
              <li>📹 Use MP4 format for better compatibility</li>
              <li>🎯 Keep lessons focused (10-30 minutes)</li>
              <li>🔊 Ensure clear audio and good lighting</li>
              <li>📝 Use descriptive lesson titles</li>
              <li>⚡ Upload during off-peak hours for faster processing</li>
            </ul>
          </div>
        </div>
      )}

      {/* Add Lesson Tab */}
      {activeTab === "lesson" && (
        <div className="grid grid-2 gap-8">
          <div className="section-panel">
            <h2 className="mb-6">Add Lesson to Course</h2>
            <form onSubmit={(e) => { e.preventDefault(); addLesson(); }} className="space-y-4">
              <div className="form-group">
                <label>Select Course *</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.lessons?.length || 0} lessons)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                  className="w-full"
                  placeholder="e.g., Introduction to Hooks"
                />
              </div>

              <div className="form-group">
                <label>YouTube Video URL *</label>
                <input
                  type="url"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  className="w-full"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
                <small className="text-gray-500">Paste the YouTube link here</small>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                ✅ Add Lesson
              </button>
            </form>
          </div>

          <div className="section-panel">
            <h3 className="mb-4">Video Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>🎬 Keep videos under 30 minutes</li>
              <li>🔊 Use clear audio and captions</li>
              <li>📹 Upload or embed from YouTube</li>
              <li>🎯 Focus on one topic per lesson</li>
            </ul>
          </div>
        </div>
      )}

      {/* My Courses Tab */}
      {activeTab === "mycourses" && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="card text-center">
              <p className="text-gray-600">No courses found. Create your first course to get started!</p>
            </div>
          ) : (
            <div className="course-summary-grid">
              {filteredCourses.map(course => {
                const rawThumbnail = course.thumbnail || "https://via.placeholder.com/300x200?text=Course";
                const thumbnailUrl = rawThumbnail.startsWith("http")
                  ? rawThumbnail
                  : `${API_URL}${rawThumbnail}`;

                return (
                  <div key={course._id} className="section-panel">
                    <img
                      src={thumbnailUrl}
                      alt={course.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=Course"; }}
                      className="w-full h-40 object-cover rounded mb-4"
                    />
                    <h3 className="mb-2 text-lg">{course.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{course.description}</p>

                    <div className="course-summary-grid mb-4">
                      <div className="course-stat-block">
                        <p className="text-gray-600">📚</p>
                        <p className="stat-value">{course.lessons?.length || 0}</p>
                        <p className="stat-label">Lessons</p>
                      </div>
                      <div className="course-stat-block">
                        <p className="text-gray-600">👥</p>
                        <p className="stat-value">{course.students?.length || 0}</p>
                        <p className="stat-label">Students</p>
                      </div>
                    </div>

                    {(course.lessons?.length || 0) > 0 && (
                      <div className="section-panel">
                        <h4 className="font-semibold mb-2 text-sm">Recent Lessons:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {course.lessons.slice(0, 3).map((lesson, index) => (
                            <li key={index}>• {lesson.title}</li>
                          ))}
                          {(course.lessons?.length || 0) > 3 && (
                            <li className="text-gray-500">+ {course.lessons.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => deleteCourse(course._id, course.title)}
                        className="btn btn-danger btn-sm flex-1"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => setSelectedCourse(course._id)}
                        className="btn btn-secondary btn-sm flex-1"
                      >
                        ➕ Add Lesson
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import Toast from '../components/Toast';
import './Pages.css';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      setFormData(res.data);
      setEnrolledCourses(res.data.enrolledCourses || []);
    } catch (err) {
      setToast({ message: 'Failed to load profile', type: 'error' });
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/api/users/profile`,
        { name: formData.name, bio: formData.bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data.user);
      setEditing(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
                {user?.name?.[0]?.toUpperCase() || '👤'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <span className="inline-block mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {user?.role === 'instructor' ? '👨‍🏫 Instructor' : '🎓 Student'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              {editing ? 'Cancel' : '✎ Edit Profile'}
            </button>
          </div>

          {editing && (
            <form onSubmit={handleUpdateProfile} className="mt-6 border-t pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="4"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {loading ? 'Saving...' : '✓ Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Bio Section */}
        {user?.bio && !editing && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">About</h3>
            <p className="text-gray-600">{user.bio}</p>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">📚 {user?.role === 'instructor' ? 'My Courses' : 'Enrolled Courses'}</h2>

          {enrolledCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {user?.role === 'instructor' ? 'No courses created yet' : 'No courses enrolled yet'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <div key={course._id} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{course.category}</p>
                  <ProgressBar progress={50} size="small" /> {/* Placeholder - will be replaced with actual progress */}
                  <button
                    onClick={() => window.location.href = `/courses/${course._id}`}
                    className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Continue Learning →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

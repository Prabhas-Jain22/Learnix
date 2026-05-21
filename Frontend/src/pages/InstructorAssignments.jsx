import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InstructorAssignments() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: ""
      }
    ]
  });

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

        const assignmentsRes = await axios.get(`${API_URL}/api/assignments/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignments(assignmentsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load instructor assignments");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const updateQuestion = (index, field, value) => {
    const nextQuestions = [...formData.questions];
    nextQuestions[index] = { ...nextQuestions[index], [field]: value };
    setFormData({ ...formData, questions: nextQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const nextQuestions = [...formData.questions];
    const options = [...nextQuestions[questionIndex].options];
    options[optionIndex] = value;
    nextQuestions[questionIndex] = { ...nextQuestions[questionIndex], options };
    setFormData({ ...formData, questions: nextQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
      ]
    });
  };

  const removeQuestion = (index) => {
    const nextQuestions = formData.questions.filter((_, idx) => idx !== index);
    setFormData({ ...formData, questions: nextQuestions.length ? nextQuestions : [{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/api/assignments/create/${courseId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ message: "Assignment created successfully!", type: "success" });
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        questions: [{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }]
      });
      const assignmentsRes = await axios.get(`${API_URL}/api/assignments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(assignmentsRes.data);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to create assignment", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading instructor assignment dashboard...</p>
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
            <h1 className="page-header-title">Instructor Assignments</h1>
            <p className="page-header-meta">Manage assignments for {course?.title}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={`/courses/${courseId}`} className="btn btn-secondary">Back to Course</Link>
            <Link to={`/instructor/course/${courseId}/results`} className="btn btn-secondary">View Results</Link>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? 'Cancel' : 'Create Assignment'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="section-panel mb-8">
            <div className="grid gap-4">
              <div className="form-group">
                <label className="block text-sm font-semibold mb-2">Assignment Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full"
                  rows="4"
                  placeholder="Assignment instructions or description"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-semibold mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Multiple Choice Questions</h3>
                  <button type="button" onClick={addQuestion} className="btn btn-secondary btn-sm">Add Question</button>
                </div>
                <div className="space-y-6">
                  {formData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <h4 className="font-semibold">Question {qIndex + 1}</h4>
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-600 hover:underline">Remove</button>
                      </div>
                      <label className="block text-sm font-medium mb-2">Question Text</label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                        className="w-full"
                        placeholder="Enter question text"
                        required
                      />
                      <div className="grid gap-3 mt-4">
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              value={option}
                              checked={question.correctAnswer === option}
                              onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                              className="flex-1"
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Save Assignment</button>
            </div>
          </form>
        )}

        <div className="grid gap-4">
          {assignments.length === 0 ? (
            <div className="section-panel text-center">
              <p className="text-gray-600">No assignments created for this course yet.</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} className="section-panel flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{assignment.title}</h3>
                  {assignment.description && <p className="text-gray-600 mb-2">{assignment.description}</p>}
                  <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                    <span>{assignment.questions?.length || 0} questions</span>
                    <span>{assignment.totalMarks} marks</span>
                    {assignment.dueDate && <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <Link to={`/assignment/${assignment._id}`} className="btn btn-primary btn-sm">View Assignment</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorAssignments;

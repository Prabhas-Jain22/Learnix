import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AssignmentAttempt() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios.get(`${API_URL}/api/assignments/${assignmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setAssignment(res.data);
      setError("");
    })
    .catch((err) => {
      setError(err.response?.data?.message || "Unable to load assignment");
    })
    .finally(() => {
      setLoading(false);
    });
  }, [assignmentId]);

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const formattedAnswers = assignment.questions.map((q) => ({
      questionId: q._id,
      answer: answers[q._id] || ""
    }));

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${API_URL}/api/assignments/submit/${assignmentId}`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);
      setToast({ message: "Assignment submitted successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to submit assignment", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading assignment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="error-banner">
          <h3>⚠️ Assignment Error</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container py-8">
        <div className="section-header">
          <div>
            <h1 className="text-3xl font-bold">{assignment?.title}</h1>
            <p className="text-gray-600">{assignment?.description || 'Answer the questions below.'}</p>
          </div>
          <Link
            to={`/assignments/${assignment?.courseId?._id || assignment?.courseId}`}
            className="btn btn-secondary"
          >
            Back to Assignments
          </Link>
        </div>

        {result ? (
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            <p className="text-gray-700">Score: <strong>{result.score}/{result.totalMarks}</strong></p>
            <p className="text-gray-700">Percentage: <strong>{result.percentage}%</strong></p>
            <div className="review-result">
              <h3 className="font-semibold mb-2">Question Review</h3>
              {assignment.questions.map((question, index) => {
                const submittedAnswer = answers[question._id] || "(no answer)";
                const correctAnswer = question.correctAnswer || "(not provided)";
                const isCorrect = submittedAnswer === correctAnswer;
                return (
                  <div key={question._id} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <p className="font-semibold">Q{index + 1}. {question.questionText}</p>
                    <p className="text-sm text-gray-700">Your answer: <strong>{submittedAnswer}</strong></p>
                    <p className="text-sm text-gray-700">Correct answer: <strong>{correctAnswer}</strong></p>
                    <p className={`text-sm font-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-500">Instructor: {assignment.instructorId?.name || assignment.instructorId?.email || 'Unknown'}</p>
              {assignment.dueDate && <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>}
            </div>
            {assignment.questions.map((question, idx) => (
              <div key={question._id} className="mb-6">
                <p className="font-semibold mb-3">Q{idx + 1}. {question.questionText}</p>
                <div className="space-y-3">
                  {question.options?.map((option, optionIdx) => (
                    <label key={optionIdx} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 cursor-pointer">
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        checked={answers[question._id] === option}
                        onChange={() => handleAnswer(question._id, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-block"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentAttempt;

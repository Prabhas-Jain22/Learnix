import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Toast from "../components/Toast";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Doubts() {
  const { courseId } = useParams();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDoubtForm, setNewDoubtForm] = useState({ title: "", question: "" });
  const [showNewDoubtForm, setShowNewDoubtForm] = useState(false);
  const [expandedDoubt, setExpandedDoubt] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadDoubts();
  }, [courseId]);

  const loadDoubts = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios.get(`${API_URL}/api/doubts/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setDoubts(res.data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.response?.data?.message || "Failed to load doubts");
      setLoading(false);
    });
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newDoubtForm.title.trim() || !newDoubtForm.question.trim()) {
      setToast({ show: true, message: "Please fill in all fields", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/api/doubts`,
        {
          courseId,
          title: newDoubtForm.title,
          question: newDoubtForm.question
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoubts([response.data.doubt, ...doubts]);
      setNewDoubtForm({ title: "", question: "" });
      setShowNewDoubtForm(false);
      setToast({ show: true, message: "✓ Doubt posted successfully!", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || "Failed to create doubt", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyToDoubt = async (doubtId) => {
    const token = localStorage.getItem("token");
    const reply = replyText[doubtId];

    if (!reply?.trim()) {
      setToast({ show: true, message: "Please write a reply", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/api/doubts/${doubtId}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoubts(doubts.map(d => d._id === doubtId ? response.data.doubt : d));
      setReplyText({ ...replyText, [doubtId]: "" });
      setToast({ show: true, message: "✓ Reply posted successfully!", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || "Failed to post reply", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveDoubt = async (doubtId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${API_URL}/api/doubts/${doubtId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadDoubts();
      setToast({ show: true, message: "✓ Doubt marked as resolved!", type: "success" });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || "Failed to resolve doubt", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="container mt-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading doubts...</p>
      </div>
    );
  }

  return (
    <>
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <div className="doubt-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Doubts & Q&A</h1>
            <p className="hero-subtitle">Ask questions and help others learn</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        <div className="section-actions mb-6">
          {!showNewDoubtForm && (
            <button onClick={() => setShowNewDoubtForm(true)} className="btn btn-primary">
              + Post New Doubt
            </button>
          )}
        </div>

        {showNewDoubtForm && (
          <div className="section-panel">
            <h3 className="section-title">Post a New Doubt</h3>
            <form onSubmit={handleCreateDoubt} className="reply-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Brief title of your question..."
                  value={newDoubtForm.title}
                  onChange={(e) => setNewDoubtForm({ ...newDoubtForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Question</label>
                <textarea
                  placeholder="Describe your doubt in detail..."
                  value={newDoubtForm.question}
                  onChange={(e) => setNewDoubtForm({ ...newDoubtForm, question: e.target.value })}
                  required
                  className="reply-input"
                />
              </div>

              <div className="action-row">
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Posting..." : "Post Doubt"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDoubtForm(false);
                    setNewDoubtForm({ title: "", question: "" });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {doubts.length === 0 ? (
          <div className="info-panel">
            <p>No doubts posted yet. Be the first to ask!</p>
            <Link to={`/courses/${courseId}`} className="btn btn-primary mt-4">
              Back to Course
            </Link>
          </div>
        ) : (
          <div className="doubt-panel">
            {doubts.map((doubt) => (
              <div key={doubt._id} className="doubt-card">
                <div
                  className={`doubt-card-header ${doubt.status === 'resolved' ? 'resolved' : ''}`}
                  onClick={() => setExpandedDoubt(expandedDoubt === doubt._id ? null : doubt._id)}
                >
                  <div className="doubt-summary">
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <h3 className="doubt-card-title">{doubt.title}</h3>
                      {doubt.status === 'resolved' && (
                        <span className="badge-pill badge-positive">✓ Resolved</span>
                      )}
                    </div>
                    <p className="doubt-meta">
                      by <strong>{doubt.userId?.name || 'Anonymous'}</strong> • {new Date(doubt.createdAt).toLocaleDateString()}
                    </p>
                    {expandedDoubt !== doubt._id && <p className="doubt-snippet">{doubt.question}</p>}
                  </div>
                  <div className="badge-pill" style={{ background: 'var(--primary)', color: 'white' }}>
                    {doubt.replies?.length || 0} replies
                  </div>
                </div>

                {expandedDoubt === doubt._id && (
                  <div className="doubt-card-body">
                    <div className="doubt-section">
                      <h4 className="doubt-section-title">Question:</h4>
                      <p>{doubt.question}</p>
                    </div>

                    {doubt.replies?.length > 0 && (
                      <div className="doubt-section">
                        <h4 className="doubt-section-title">Replies ({doubt.replies.length})</h4>
                        <div className="reply-list">
                          {doubt.replies.map((reply, idx) => (
                            <div key={idx} className="reply-card">
                              <p className="reply-author">
                                {reply.userId?.name || 'Anonymous'} {reply.userId?.role === 'instructor' && '👨‍🏫'}
                              </p>
                              <p>{reply.reply}</p>
                              <p className="reply-meta">{new Date(reply.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doubt.status !== 'resolved' && (
                      <div className="doubt-section">
                        <h4 className="doubt-section-title">Post Reply</h4>
                        <div className="reply-form">
                          <textarea
                            placeholder="Type your reply..."
                            value={replyText[doubt._id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [doubt._id]: e.target.value })}
                            className="reply-input"
                          />
                          <div className="action-row">
                            <button onClick={() => handleReplyToDoubt(doubt._id)} disabled={submitting} className="btn btn-primary">
                              {submitting ? 'Posting...' : 'Post Reply'}
                            </button>
                            {doubt.userId?._id === localStorage.getItem('userId') && (
                              <button onClick={() => handleResolveDoubt(doubt._id)} disabled={submitting} className="btn btn-secondary">
                                Mark as Resolved
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Doubts;

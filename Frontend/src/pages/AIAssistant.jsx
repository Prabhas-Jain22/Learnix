import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";
import "./Pages.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const suggestedPrompts = [
  "Explain JWT authentication",
  "Explain React Hooks",
  "Explain MongoDB",
  "Help me with assignment",
];

function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const scrollRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/courses/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data || []);
        if (res.data?.length > 0) {
          setSelectedCourseId(res.data[0]._id);
        }
      } catch (err) {
        console.error("AI assistant course load error:", err);
      }
    };

    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const endpoint = selectedCourseId
          ? `${API_URL}/api/ai/history?courseId=${selectedCourseId}`
          : `${API_URL}/api/ai/history`;
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const loadedMessages = (res.data.history || []).flatMap((item) => [
          { sender: "user", text: item.question },
          { sender: "ai", text: item.answer },
        ]);

        setMessages(loadedMessages);
      } catch (err) {
        console.error("Failed to load AI history:", err);
      }
    };

    fetchHistory();
  }, [token, selectedCourseId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError("");

    try {
      console.log("Sending AI request:", { message: input.trim(), courseId: selectedCourseId || null });
      const response = await axios.post(
        `${API_URL}/api/ai/chat`,
        {
          message: input.trim(),
          courseId: selectedCourseId || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("AI response:", response.data);

      setMessages((prev) => [...prev, userMessage, { sender: "ai", text: response.data.reply }]);
      setInput("");
    } catch (err) {
      console.error("AI request error:", err.response?.data || err.message || err);
      const message = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to send your doubt.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  const handleClear = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="container py-8 ai-assistant">
      <div className="section-header">
        <div>
          <h1 className="section-title">AI Study Assistant</h1>
          <p className="section-subtitle">
            Ask your doubt directly in Learnix and get Gemini-powered study guidance instantly.
          </p>
        </div>
        <div className="section-actions">
          <button onClick={handleClear} className="btn btn-secondary btn-sm">
            Clear conversation
          </button>
        </div>
      </div>

      <div className="ai-chat-panel-wrapper">
        <ChatBox
          messages={messages}
          input={input}
          setInput={setInput}
          onSubmit={handleSend}
          onClear={handleClear}
          loading={loading}
          error={error}
          suggestedPrompts={suggestedPrompts}
          onPromptClick={handlePromptClick}
          courseList={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={(e) => setSelectedCourseId(e.target.value)}
          scrollRef={scrollRef}
        />
      </div>
    </div>
  );
}

export default AIAssistant;

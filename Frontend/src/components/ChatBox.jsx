import ChatMessage from "./ChatMessage";

function ChatBox({
  messages,
  input,
  setInput,
  onSubmit,
  onClear,
  loading,
  suggestedPrompts,
  onPromptClick,
  courseList,
  selectedCourseId,
  onCourseChange,
  error,
  scrollRef,
}) {
  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-window">
        <div className="ai-chat-header">
          <div>
            <h3 className="section-title-sm">AI Study Assistant</h3>
            <p className="section-subtitle">
              Ask your doubt and get guided explanations, code concepts, and study support.
            </p>
          </div>
          <button onClick={onClear} className="btn btn-secondary btn-sm">
            Clear chat
          </button>
        </div>

        <div className="ai-context-bar">
          <label htmlFor="course-select">Course context</label>
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={onCourseChange}
            className="select-input"
          >
            <option value="">No specific course</option>
            {courseList.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="chat-messages" id="chat-scroll" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="chat-empty-state">
              <p>Start the conversation by asking a study question.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.sender}-${index}`}
              sender={message.sender}
              text={message.text}
            />
          ))}
        </div>

        <div className="chat-suggestions">
          <span>Suggested prompts:</span>
          <div className="suggestion-list">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="prompt-pill"
                onClick={() => onPromptClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-danger">{error}</p>}

        <form className="chat-input-area" onSubmit={onSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask your doubt..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;

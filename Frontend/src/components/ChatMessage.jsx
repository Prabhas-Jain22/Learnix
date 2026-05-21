function ChatMessage({ sender, text }) {
  return (
    <div className={`chat-message ${sender}`.trim()}>
      <div className="chat-bubble">
        <p>{text}</p>
      </div>
    </div>
  );
}

export default ChatMessage;

import "./RoleCard.css";

function RoleCard({ title, description, icon, features, onClick, color }) {
  const colorConfig = {
    blue: {
      gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      shadow: "rgba(37, 99, 235, 0.2)",
      text: "#2563eb"
    },
    green: {
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      shadow: "rgba(16, 185, 129, 0.2)",
      text: "#10b981"
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className="role-card" onClick={onClick}>
      <div className="role-card-inner">
        {/* Card Header with Icon */}
        <div className="role-card-header">
          <div 
            className="role-card-icon"
            style={{
              background: config.gradient,
              boxShadow: `0 8px 16px ${config.shadow}`
            }}
          >
            {icon}
          </div>
        </div>

        {/* Card Content */}
        <div className="role-card-content">
          <h3 className="role-card-title">{title}</h3>
          <p className="role-card-description">{description}</p>

          {/* Features List */}
          <ul className="role-card-features">
            {features.map((feature, index) => (
              <li key={index} className="role-card-feature">
                <span className="feature-icon">✓</span>
                <span className="feature-text">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card Footer Button */}
        <button 
          className="role-card-button"
          style={{
            background: config.gradient,
            color: 'white',
            boxShadow: `0 4px 12px ${config.shadow}`
          }}
        >
          Continue as {title}
        </button>
      </div>
    </div>
  );
}

export default RoleCard;
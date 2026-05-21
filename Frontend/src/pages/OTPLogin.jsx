import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import './Auth.css';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function OTPLogin() {
  const [step, setStep] = useState('email'); // email or otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      setToast({ message: 'OTP sent to your email!', type: 'success' });
      setStep('otp');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      setToast({ message: 'Login successful!', type: 'success' });

      // Redirect based on role
      if (res.data.role === 'instructor') {
        setTimeout(() => navigate('/admin'), 500);
      } else {
        setTimeout(() => navigate('/'), 500);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Invalid OTP', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-header-icon">🔐</span>
            <h2>{step === 'email' ? 'OTP Login' : 'Verify OTP'}</h2>
            <p>{step === 'email' ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}</p>
          </div>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          <form onSubmit={step === 'email' ? handleSendOTP : handleVerifyOTP} className="auth-form">
            {step === 'email' ? (
              <div className="form-group">
                <label htmlFor="email">📧 Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="otp">🔑 Enter OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  maxLength="6"
                  placeholder="000000"
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">6-digit code (expires in 5 minutes)</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {step === 'email' ? 'Sending OTP...' : 'Verifying...'}
                </>
              ) : (
                step === 'email' ? '✓ Send OTP' : '✓ Verify OTP'
              )}
            </button>
          </form>

          {step === 'otp' && (
            <button
              onClick={() => setStep('email')}
              className="text-blue-500 text-sm mt-2 hover:underline"
            >
              ← Change email
            </button>
          )}

          <div className="auth-footer">
            <p>
              Want to use password?{' '}
              <a href="/auth" style={{ color: '#007bff', textDecoration: 'none' }}>
                Back to login options
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTPLogin;

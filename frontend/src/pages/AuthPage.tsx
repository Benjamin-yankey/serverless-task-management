import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, User, Github } from 'lucide-react';
import { signIn, signUp, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth';
import './AuthPage.css';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px 14px 48px',
  background: 'rgba(30, 41, 59, 0.5)',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '16px',
  outline: 'none',
  transition: 'all 200ms ease'
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: '#cbd5e1',
  marginBottom: '8px'
};

const iconStyle = {
  position: 'absolute' as const,
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '20px',
  height: '20px',
  color: '#64748b',
  transition: 'color 200ms ease'
};

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignIn = async () => {
    try {
      await signIn({ username: formData.email, password: formData.password });
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    }
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    try {
      await signUp({
        username: formData.email,
        password: formData.password,
        options: { 
          userAttributes: { 
            email: formData.email,
            name: formData.fullName
          } 
        }
      });
      setNeedsVerification(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    }
  };

  const handleVerification = async () => {
    try {
      await confirmSignUp({
        username: formData.email,
        confirmationCode: formData.verificationCode
      });
      await signIn({ username: formData.email, password: formData.password });
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (needsVerification) {
        await handleVerification();
      } else if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'Google' | 'GitHub') => {
    try {
      await signInWithRedirect({ 
        provider: provider === 'GitHub' ? { custom: 'GitHub' } : 'Google' 
      });
    } catch (err: any) {
      setError(err.message || `${provider} sign in failed`);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #020617, #0f172a, #1e293b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="bg-orb-1" style={{
          position: 'absolute',
          top: '25%',
          left: '-192px',
          width: '384px',
          height: '384px',
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '9999px',
          filter: 'blur(96px)'
        }}></div>
        <div className="bg-orb-2" style={{
          position: 'absolute',
          top: '75%',
          right: '-192px',
          width: '384px',
          height: '384px',
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '9999px',
          filter: 'blur(96px)'
        }}></div>
        <div className="bg-orb-3" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '384px',
          height: '384px',
          background: 'rgba(37, 99, 235, 0.05)',
          borderRadius: '9999px',
          filter: 'blur(96px)'
        }}></div>
      </div>

      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.015,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
      }}></div>

      {/* Main card */}
      <div className="animate-fadeIn" style={{ position: 'relative', width: '100%', maxWidth: '448px' }}>
        {/* Glow effect behind card */}
        <div className="card-glow" style={{
          position: 'absolute',
          inset: '-4px',
          background: 'linear-gradient(to right, #06b6d4, #2563eb, #a855f7)',
          borderRadius: '16px',
          filter: 'blur(40px)',
          opacity: 0.2
        }}></div>
        
        <div className="auth-card" style={{
          position: 'relative',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'linear-gradient(to bottom right, #06b6d4, #2563eb)',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.2)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '4px solid rgba(255, 255, 255, 0.9)',
                borderRadius: '8px'
              }}></div>
            </div>
            <h1 style={{
              fontSize: '30px',
              fontWeight: 700,
              background: 'linear-gradient(to right, #ffffff, #e2e8f0, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Task Manager
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Organize your life with clarity</p>
          </div>

          {/* Toggle buttons */}
          {!needsVerification && (
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '32px',
              background: 'rgba(30, 41, 59, 0.5)',
              padding: '4px',
              borderRadius: '12px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className="toggle-btn"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  ...((!isSignUp) ? {
                    background: 'linear-gradient(to right, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                  } : {
                    background: 'transparent',
                    color: '#94a3b8'
                  })
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className="toggle-btn"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  ...((isSignUp) ? {
                    background: 'linear-gradient(to right, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                  } : {
                    background: 'transparent',
                    color: '#94a3b8'
                  })
                }}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertCircle style={{ width: '20px', height: '20px', color: '#fca5a5', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '14px', color: '#fca5a5', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {needsVerification ? (
              <div className="animate-slideDown">
                <label style={labelStyle}>Verification Code</label>
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  style={{ ...inputStyle, paddingLeft: '16px' }}
                  required
                />
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#94a3b8' }}>Check your email for the verification code</p>
              </div>
            ) : (
              <>
                {/* Full Name - Sign Up Only */}
                {isSignUp && (
                  <div className="animate-slideDown">
                    <label style={labelStyle}>Full Name</label>
                    <div style={{ position: 'relative' }} className="input-group">
                      <User style={iconStyle} className="input-icon" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }} className="input-group">
                    <Mail style={iconStyle} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }} className="input-group">
                    <Lock style={iconStyle} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      style={{ ...inputStyle, paddingRight: '48px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Sign Up Only */}
                {isSignUp && (
                  <div className="animate-slideDown">
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }} className="input-group">
                      <Lock style={iconStyle} className="input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        style={{ ...inputStyle, paddingRight: '48px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Forgot Password - Sign In Only */}
                {!isSignUp && (
                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        color: '#06b6d4',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Terms & Conditions - Sign Up Only */}
                {isSignUp && (
                  <div className="animate-slideDown" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          border: '2px solid #334155',
                          background: 'rgba(30, 41, 59, 0.5)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      />
                      {acceptTerms && (
                        <svg
                          style={{
                            position: 'absolute',
                            width: '12px',
                            height: '12px',
                            color: 'white',
                            pointerEvents: 'none'
                          }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <label htmlFor="terms" style={{ fontSize: '14px', color: '#94a3b8', cursor: 'pointer', lineHeight: '1.5' }}>
                      I agree to the{' '}
                      <a href="#" style={{ color: '#06b6d4', textDecoration: 'none' }}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" style={{ color: '#06b6d4', textDecoration: 'none' }}>
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(to right, #06b6d4, #2563eb)',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  {needsVerification ? 'Verify Email' : isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="arrow-icon" style={{ width: '20px', height: '20px' }} />
                </>
              )}
            </button>
          </form>

          {/* Social Login Section */}
          {!needsVerification && (
            <>
              <div style={{ position: 'relative', margin: '32px 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '100%', borderTop: '1px solid #334155' }}></div>
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '14px' }}>
                  <span style={{ padding: '0 16px', background: 'rgba(15, 23, 42, 0.8)', color: '#94a3b8' }}>Or continue with</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('Google')}
                  className="social-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('GitHub')}
                  className="social-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <Github style={{ width: '20px', height: '20px' }} />
                  GitHub
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

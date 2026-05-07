import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { motion as Motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="register-page">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="register-container"
            >
                <div className="card register-card">
                    <div className="header">
                        <div className="icon-badge">
                            <FaUserPlus size={24} color="var(--primary)" />
                        </div>
                        <h2>{t('auth.registerTitle')}</h2>
                        <p className="subtitle">Join the community of future leaders</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label>{t('auth.username')}</label>
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="John Doe"
                                    className="input-field"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('auth.email')}</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    className="input-field"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('auth.password')}</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="input-field"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary submit-btn">
                            {t('auth.submit')}
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button className="btn-google" onClick={handleGoogleRegister}>
                        <FaGoogle size={18} />
                        <span>Continue with Google</span>
                    </button>

                    <div className="footer">
                        <p>
                            Already have an account? <Link to="/login" className="link">{t('auth.login')}</Link>
                        </p>
                    </div>
                </div>
            </Motion.div>

            <style>{`
                .register-page {
                    min-height: calc(100vh - var(--header-height));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem; /* Reduced padding for mobile */
                    background: var(--bg-primary);
                    transition: background-color 0.3s ease;
                }

                .register-container {
                    width: 100%;
                    max-width: 420px; /* Optimal width for single column form */
                    margin: 0 auto;
                }

                .register-card {
                    background: var(--bg-card);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border);
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    box-shadow: var(--shadow);
                    transition: background-color 0.3s ease, border-color 0.3s ease;
                }

                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .icon-badge {
                    display: inline-flex;
                    padding: 1rem;
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 50%;
                    margin-bottom: 1rem;
                    border: 1px solid var(--primary-glow);
                }

                .header h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }

                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-left: 0.25rem;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    pointer-events: none;
                }

                .input-field {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.5rem; /* Space for icon */
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 0.75rem;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }

                .input-field:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-glow);
                }

                .error-msg {
                    padding: 0.75rem;
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--danger);
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                }

                .submit-btn {
                    margin-top: 1rem;
                    width: 100%;
                    padding: 1rem;
                    font-size: 1rem;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 1.5rem 0;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid var(--border);
                }
                .divider span {
                    padding: 0 1rem;
                    font-weight: 500;
                }

                .btn-google {
                    width: 100%;
                    padding: 0.875rem;
                    background: white;
                    border: 1px solid #dadce0;
                    border-radius: 0.75rem;
                    color: #3c4043;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }
                .btn-google:hover {
                    background: #f8f9fa;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .btn-google svg {
                    color: #4285f4;
                }

                .footer {
                    margin-top: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .link {
                    color: var(--primary);
                    font-weight: 600;
                    text-decoration: none;
                    margin-left: 0.25rem;
                }
                .link:hover {
                    text-decoration: underline;
                }

                @media (max-width: 640px) {
                    .register-card {
                        padding: 1.5rem;
                    }
                    .header h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    FaGraduationCap, FaRocket, FaLightbulb, FaGoogle, FaShieldAlt,
    FaChartLine, FaSearch, FaUserGraduate, FaChevronRight,
    FaGlobe, FaCrosshairs, FaMicrochip, FaRobot, FaBriefcase, FaCheckCircle, FaStar, FaQuoteLeft
} from 'react-icons/fa';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import AccountSelector from '../components/AccountSelector';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const heroImages = [
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2400&auto=format&fit=crop', // Mountain peak / ambition
    'https://images.unsplash.com/photo-1611843467391-62f5abbc0d0a?q=80&w=2400&auto=format&fit=crop', // Abstract tech / innovation
    'https://images.unsplash.com/photo-1764683713102-0d1ae0612160?q=80&w=2400&auto=format&fit=crop' // Cityscape / career landscape
];

const Landing = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [bgIndex, setBgIndex] = useState(0);
    const { user, login, logout, loginWithToken } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 7000); // Change image every 7 seconds
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/domains');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleGoogleLogin = () => {
        setIsAccountPickerOpen(true);
    };

    const onSelectAccount = async (account) => {
        try {
            const res = await axios.post('https://tenshiro.onrender.com/api/auth/dev-login', {
                email: account.email,
                username: account.name
            });
            const { token, user: userData } = res.data;

            if (token && userData) {
                loginWithToken(token, userData);
                navigate('/domains');
            }
        } catch (err) {
            console.error('Dev profile selection failed:', err);
            setIsAccountPickerOpen(false);
        }
    };

    const openLogin = () => {
        setIsRegisterModalOpen(false);
        setIsLoginModalOpen(true);
    };

    const openRegister = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(true);
    };

    return (
        <div className="landing-page">
            <Navbar
                onToggleSidebar={() => { }}
                onLoginClick={openLogin}
                onRegisterClick={openRegister}
            />

            {/* Hero Background Layer with Cross-fade */}
            <div className="hero-bg-overlay">
                {heroImages.map((img, idx) => (
                    <div
                        key={idx}
                        className={`hero-img-bg ${bgIndex === idx ? 'active' : ''}`}
                        style={{ backgroundImage: `url('${img}')` }}
                    />
                ))}
                <div className="hero-dark-mask" />
            </div>

            {/* Background Layers for other sections */}
            <div className="bg-layers">
                <div className="grid-overlay" />
            </div>

            <main className="landing-main">
                {/* HERO SECTION */}
                <section id="home" className="hero-section-saas">
                    <div className="hero-container">
                        <div className="hero-content-wrapper">
                            {/* Centered-Left Content */}
                            <Motion.div
                                className="hero-text-content"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className="hero-badge-saas">
                                    <span>AI-Powered Career Intelligence Platform</span>
                                </div>

                                <h1 className="hero-headline-saas" style={{ color: 'white' }}>
                                    Design Your Career Path <br />
                                    <span style={{ color: 'var(--primary)' }}>Build Job-Ready Skills With AI</span>
                                </h1>

                                <h2 className="hero-subtitle-saas" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                    From career discovery to job readiness — <br />
                                    all in one intelligent platform.
                                </h2>

                                <p className="hero-desc-saas" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Tenshiro helps students discover career domains, build real-world skills,
                                    improve communication, prepare for interviews, and apply for internships and jobs using AI-powered guidance.
                                </p>

                                <div className="hero-actions-saas">
                                    <Motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={openRegister}
                                        className="btn-saas-primary"
                                    >
                                        Start Career Journey
                                    </Motion.button>
                                    <Motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="btn-saas-secondary"
                                    >
                                        Explore Career Domains
                                    </Motion.button>
                                </div>
                            </Motion.div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 - CORE ENGINE */}
                <Motion.section
                    id="platform"
                    className="section-core-engine"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="section-header-refined">
                        <span className="section-subtitle">System Capabilities</span>
                        <h2 className="title-strategic">The Career Intelligence Engine</h2>
                    </div>
                    <div className="engine-grid-refined">
                        {[
                            { title: "Predictive Analytics", icon: <FaCrosshairs />, desc: "Algorithmic forecasting of industrial shifts to position your profile ahead of market demand cycles." },
                            { title: "Neural Skill Mapping", icon: <FaRocket />, desc: "Deep-learning analysis of your current trajectory to identify high-leverage micro-skills for rapid ascension." },
                            { title: "Market Resonance", icon: <FaChartLine />, desc: "Computational scoring of your professional brand against institutional requirements with real-time feedback." },
                            { title: "Autonomous Guidance", icon: <FaRobot />, desc: "Self-evolving roadmaps that recalibrate daily based on your learning metrics and global hiring trends." }
                        ].map((card, i) => (
                            <Motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -12, scale: 1.02 }}
                                className="glass-card-engine"
                            >
                                <div className="engine-icon-box">{card.icon}</div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{card.title}</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{card.desc}</p>
                            </Motion.div>
                        ))}
                    </div>
                </Motion.section>

                {/* SECTION 3 - OPERATIONAL PROTOCOL */}
                <Motion.section
                    id="intelligence"
                    className="section-how-works"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="section-header-refined">
                        <span className="section-subtitle">Operational Protocol</span>
                        <h2 className="title-strategic">The Execution Framework</h2>
                    </div>
                    <div className="horizontal-steps-layout">
                        {[
                            { step: "01", label: "PHASE 01: SYNC", title: "Environmental Scan", text: "Integrate your professional identity into our neural database for multi-dimensional profile synchronization." },
                            { step: "02", label: "PHASE 02: ARCHITECT", title: "Goal Engineering", text: "Define high-level objectives and let our engine derive the optimal computational path to achievement." },
                            { step: "03", label: "PHASE 03: EXECUTE", title: "Strategy Deployment", text: "Receive and fulfill high-impact tasks designed to maximize your market value and strategic influence." }
                        ].map((step, i) => (
                            <div key={i} className="step-horizontal-item">
                                <div className="step-indicator">
                                    <div className="step-circle">{step.step}</div>
                                    {i < 2 && <div className="step-line-connector" />}
                                </div>
                                <div className="step-content-refined">
                                    <span className="step-tag">{step.label}</span>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{step.title}</h3>
                                    <p style={{ fontSize: '1.15rem', lineHeight: 1.6 }}>{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Motion.section>

                {/* SECTION 4 - PLATFORM POSITIONING */}
                <Motion.section
                    id="roadmaps"
                    className="section-pos-os"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="section-header-refined">
                        <span className="section-subtitle">System Infrastructure</span>
                        <h2 className="title-strategic">The Career OS Layers</h2>
                    </div>
                    <div className="os-columns-grid">
                        {[
                            { layer: "L1", title: "Intelligence Layer", icon: <FaGlobe />, desc: "Real-time data synchronization with global industrial trends and micro-skill requirements." },
                            { layer: "L2", title: "Execution Engine", icon: <FaMicrochip />, desc: "Algorithmic roadmap generation that adapts to your performance metrics and learning velocity." },
                            { layer: "L3", title: "Interface Layer", icon: <FaUserGraduate />, desc: "Seamless professional representation powered by AI-driven portfolio and resonance scoring." }
                        ].map((col, i) => (
                            <div key={i} className={`os-column ${i === 1 ? 'bordered' : ''}`}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1rem', opacity: 0.6 }}>{col.layer} PROTOCOL</div>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary)', opacity: 0.8 }}>{col.icon}</div>
                                <h3 className="os-label">{col.title}</h3>
                                <p className="os-desc">{col.desc}</p>
                            </div>
                        ))}
                    </div>
                </Motion.section>

                {/* NEW SECTION - STRATEGIC IMPACT */}
                <Motion.section
                    id="impact"
                    className="section-strategic-impact"
                    style={{ padding: '10rem 0' }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <div className="impact-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
                        <Motion.div
                            className="impact-text"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', fontWeight: 900, marginBottom: '2.5rem', lineHeight: 1.05, letterSpacing: '-0.04em' }}>
                                Converting Potential into <span style={{ color: 'var(--primary)' }}>Strategic Authority.</span>
                            </h2>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '3rem', fontWeight: 500 }}>
                                We don't just provide guidance; we build the technical infrastructure for your professional ascension.
                                Our system processes millions of sectoral data points to ensure every move you make is backed by
                                computational certainty and market logic.
                            </p>
                            <div className="impact-stats" style={{ display: 'flex', gap: '4rem' }}>
                                <div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.05em' }}>98%</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15rem', marginTop: '0.5rem' }}>Precision Rate</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.05em' }}>4.2x</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15rem', marginTop: '0.5rem' }}>Growth Velocity</div>
                                </div>
                            </div>
                        </Motion.div>
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 50 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="impact-visual"
                            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '32px', padding: '3rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--primary)', opacity: 0.2 }} />
                                <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '2px solid var(--accent)', opacity: 0.3 }} />
                                <FaRocket style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '4rem', color: 'var(--primary)' }} />
                            </div>
                        </Motion.div>
                    </div>
                </Motion.section>

                {/* FINAL CTA SECTION */}
                <Motion.section
                    className="section-ultimate-cta"
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="cta-gradient-wave">
                        <div className="cta-inner-content">
                            <h2 className="cta-headline-strategic">
                                Ready to Synthesize Your <br />
                                <span style={{ color: 'var(--primary)' }}>Professional Future?</span>
                            </h2>
                            <button onClick={openRegister} className="btn-launch-final">
                                Initialize Protocol
                            </button>
                        </div>
                    </div>
                </Motion.section>
            </main>

            <footer className="minimal-footer-strategic">
                <div className="footer-top-line" />
                <div className="footer-content">
                    <p>{t('landing.footerText')}</p>
                </div>
            </footer>

            <AccountSelector
                isOpen={isAccountPickerOpen}
                onSelect={onSelectAccount}
                onClose={() => setIsAccountPickerOpen(false)}
            />
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onRegisterClick={openRegister}
            />
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onLoginClick={openLogin}
            />

            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;500;600&display=swap');

            :root {
                --primary: #1A3263;
                --primary-glow: rgba(26, 50, 99, 0.4);
                --secondary: #0F172A;
                --accent: #1A3263;
                --bg-primary: #F8FAFC;
                --bg-secondary: #FFFFFF;
                --bg-glass: rgba(255, 255, 255, 0.7);
                --text-main: #0F172A;
                --text-muted: #64748B;
                --border: #E2E8F0;
                --header-height: 80px;
            }

            .landing-page {
                position: relative;
                width: 100%;
                min-height: 100vh;
                background-color: var(--bg-primary);
                color: var(--text-main);
                overflow-x: hidden;
                display: flex;
                flex-direction: column;
                padding-top: var(--header-height);
                font-family: 'Inter', sans-serif;
                scroll-behavior: smooth;
            }

            /* --- HERO BACKGROUND SYSTEM --- */
            .hero-bg-overlay { position: absolute; top: -var(--header-height); left: 0; width: 100%; height: 100vh; z-index: 0; overflow: hidden; }
            .hero-img-bg {
                position: absolute; inset: 0;
                background-size: cover;
                background-position: center;
                transform: scale(1.1);
                opacity: 0;
                transition: opacity 2s ease-in-out;
            }
            .hero-img-bg.active {
                opacity: 1;
            }
            .hero-dark-mask {
                position: absolute; inset: 0;
                background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%);
            }

            /* --- BACKGROUND SYSTEM --- */
            .bg-layers { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
            .grid-overlay {
                position: absolute; inset: 0;
                background-image: radial-gradient(var(--border) 1px, transparent 1px);
                background-size: 40px 40px; opacity: 0.15;
            }

            /* --- LAYOUT --- */
            .landing-main { position: relative; z-index: 10; width: 100%; margin: 0 auto; }

            /* --- HERO SECTION --- */
            .hero-section-saas { 
                padding: 30px 0 10px;
                min-height: calc(100vh - 80px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .hero-container {
                max-width: 1300px;
                margin: 0 auto;
                padding: 0 40px;
                width: 100%;
                z-index: 2;
            }
            .hero-content-wrapper {
                max-width: 1000px;
                margin: 0;
                text-align: left;
            }

            .hero-badge-saas {
                display: inline-flex;
                padding: 6px 14px;
                background: rgba(26, 50, 99, 0.1);
                color: var(--primary);
                border-radius: 100px;
                font-size: 0.8rem;
                font-weight: 700;
                margin-bottom: 40px;
                border: 1px solid rgba(26, 50, 99, 0.2);
                backdrop-filter: blur(10px);
            }

            .hero-headline-saas {
                font-family: 'Sora', sans-serif;
                font-size: clamp(3.5rem, 9vw, 6rem);
                line-height: 1.25;
                font-weight: 800;
                letter-spacing: -0.06em;
                margin-bottom: 48px;
                color: var(--secondary);
            }
            .text-primary { 
                color: var(--primary);
            }

            .hero-subtitle-saas {
                font-family: 'Sora', sans-serif;
                font-size: clamp(1.6rem, 4.5vw, 2.6rem);
                color: var(--secondary);
                margin-top: 56px;
                margin-bottom: 56px;
                font-weight: 700;
                line-height: 1.25;
                max-width: 950px;
                margin-left: auto;
                margin-right: auto;
                opacity: 0.95;
            }

            .hero-desc-saas {
                font-size: clamp(1.4rem, 3vw, 1.8rem);
                line-height: 1.6;
                color: var(--text-muted);
                max-width: 950px;
                margin: 20px auto 56px;
                opacity: 0.95;
                font-weight: 500;
            }

            .hero-actions-saas { display: flex; gap: 40px; align-items: center; justify-content: flex-start; flex-wrap: wrap; }
            .btn-saas-primary {
                background: var(--primary);
                color: white;
                padding: 16px 36px;
                border-radius: 14px;
                font-weight: 700;
                border: none;
                font-size: 1.05rem;
                box-shadow: 0 10px 25px rgba(26, 50, 99, 0.2);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .btn-saas-primary:hover {
                transform: scale(1.05) translateY(-2px);
                box-shadow: 0 15px 35px rgba(26, 50, 99, 0.3);
            }
            .btn-saas-secondary {
                background: var(--bg-secondary);
                color: var(--secondary);
                padding: 16px 36px;
                border-radius: 14px;
                font-weight: 700;
                border: 1px solid var(--border);
                font-size: 1.05rem;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .btn-saas-secondary:hover {
                background: #F1F5F9;
                border-color: var(--text-main);
                transform: translateY(-2px);
            }

            /* --- SECTIONS COMMON --- */
            .section-header-refined { text-align: center; margin-bottom: 80px; }
            .section-subtitle { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2rem; color: var(--primary); margin-bottom: 16px; display: block; }
            .title-strategic { font-family: 'Sora', sans-serif; font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 800; letter-spacing: -0.03em; color: var(--secondary); }

            /* --- ENGINE --- */
            .section-core-engine { padding: 80px 40px; background: #FFFFFF; }
            .engine-grid-refined { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1300px; margin: 0 auto; }
            .glass-card-engine {
                padding: 40px 32px; background: var(--bg-primary); border: 1px solid var(--border); 
                border-radius: 24px;
            }
            .engine-icon-box { 
                width: 50px; height: 50px; background: rgba(26, 50, 99, 0.1); 
                border-radius: 14px; display: flex; align-items: center; justify-content: center; 
                color: var(--primary); font-size: 1.5rem; margin-bottom: 24px; 
            }

            /* --- HOW IT WORKS --- */
            .section-how-works { padding: 100px 40px; max-width: 1300px; margin: 0 auto; }
            .horizontal-steps-layout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
            .step-circle { 
                width: 40px; height: 40px; border-radius: 12px; background: var(--primary);
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: 800; font-size: 1.2rem; margin-bottom: 24px;
            }

            /* --- OS LAYERS --- */
            .section-pos-os { padding: 100px 40px; max-width: 1300px; margin: 0 auto; }
            .os-columns-grid { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); border-radius: 32px; overflow: hidden; background: #FFFFFF; }
            .os-column { padding: 60px 40px; text-align: center; }
            .os-column.bordered { border-left: 1px solid var(--border); border-right: 1px solid var(--border); background: #F8FAFC; }

            /* --- IMPACT --- */
            .section-strategic-impact { padding: 100px 40px; max-width: 1300px; margin: 0 auto; }

            /* --- CTA --- */
            .section-ultimate-cta { padding: 100px 40px; max-width: 1300px; margin: 0 auto; }
            .cta-gradient-wave {
                padding: 80px 40px; border-radius: 40px;
                background: var(--secondary); text-align: center; color: white;
            }
            .cta-headline-strategic { font-family: 'Sora', sans-serif; font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 40px; }
            .btn-launch-final {
                background: var(--primary); color: white; border: none; padding: 20px 60px;
                border-radius: 16px; font-weight: 800; font-size: 1.2rem; cursor: pointer;
            }

            @media (max-width: 1024px) {
                .hero-content-wrapper { text-align: center; margin: 0 auto; }
                .hero-actions-saas { justify-content: center; }
                .engine-grid-refined, .horizontal-steps-layout, .os-columns-grid { grid-template-columns: 1fr; }
                .os-column.bordered { border: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
            }
            @media (max-height: 850px) {
                .hero-section-saas { padding: 20px 0 10px; }
                .hero-headline-saas { font-size: clamp(2.5rem, 7vw, 4.2rem); margin-bottom: 8px; }
                .hero-subtitle-saas { font-size: 1.5rem; margin-bottom: 8px; }
                .hero-desc-saas { margin-bottom: 20px; font-size: 1.1rem; }
            }
            `}</style>
        </div>
    );
};

export default Landing;

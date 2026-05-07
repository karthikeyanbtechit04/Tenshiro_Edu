import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    FaCheckCircle, FaCircle, FaExternalLinkAlt, FaRocket, FaLightbulb,
    FaCode, FaCheck, FaCalendarAlt, FaSave, FaHistory, FaMagic
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Roadmap = () => {
    const { roleId } = useParams();
    const { t } = useLanguage();
    const { token } = useAuth();
    const [roleData, setRoleData] = useState(null);
    const [roadmap, setRoadmap] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('timeline'); // 'map' or 'timeline'
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [duration, setDuration] = useState('3 Months');
    const [savedRoadmaps, setSavedRoadmaps] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchData();
        fetchSavedRoadmaps();
    }, [roleId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const roleRes = await axios.get(`https://tenshiro.onrender.com/api/roles/${roleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoleData(roleRes.data);

            const roadmapRes = await axios.get(`https://tenshiro.onrender.com/api/roles/${roleId}/roadmap`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoadmap(roadmapRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedRoadmaps = async () => {
        try {
            const res = await axios.get('https://tenshiro.onrender.com/api/ai/my-roadmaps', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedRoadmaps(res.data);
        } catch (err) {
            console.error("Failed to fetch saved roadmaps", err);
        }
    };

    const handleGenerateAIPlan = async () => {
        if (!roleData) return;
        setGenerating(true);
        try {
            const res = await axios.post('https://tenshiro.onrender.com/api/ai/roadmap',
                { role: roleData.title, duration },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRoadmap(res.data);
            setViewMode('timeline');
        } catch (err) {
            console.error("AI Generation Failed:", err);
            alert("Could not generate AI plan.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveRoadmap = async () => {
        if (!roleData || roadmap.length === 0) return;
        setSaving(true);
        try {
            await axios.post('https://tenshiro.onrender.com/api/ai/save-roadmap',
                { roleTitle: roleData.title, roadmapData: roadmap },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Roadmap saved to your profile!");
            fetchSavedRoadmaps();
        } catch (err) {
            alert("Failed to save roadmap.");
        } finally {
            setSaving(false);
        }
    };

    const loadSavedRoadmap = (data) => {
        setRoadmap(data);
        setViewMode('timeline');
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--primary)' }}>
            <div className="loader">Crafting Your Master Path...</div>
        </div>
    );

    return (
        <div className="roadmap-master-container" style={{
            padding: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            minHeight: '100vh',
            background: 'var(--bg-main)',
            color: 'var(--text-main)'
        }}>
            <style>{`
                .elite-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--border);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                }
                .elite-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-5px);
                }
                .gradient-text {
                    background: linear-gradient(135deg, #D4AF37 0%, #F9D976 50%, #D4AF37 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .phase-bubble {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .roadmap-line {
                    position: absolute;
                    left: 20px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: linear-gradient(to bottom, var(--primary), transparent);
                    z-index: 0;
                }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <Link to="/domains" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', display: 'block' }}>&larr; Back to Discovery</Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        Career <span className="gradient-text">Mastery Path</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Architecting your journey to become a <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{roleData?.title}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0 0.5rem' }}
                        >
                            {['1 Month', '2 Months', '3 Months', '6 Months'].map(d => <option key={d} value={d} style={{ background: 'var(--bg-surface)' }}>{d}</option>)}
                        </select>
                        <button
                            onClick={handleGenerateAIPlan}
                            disabled={generating}
                            style={{
                                background: 'var(--primary)', color: 'black', border: 'none', padding: '0.6rem 1.2rem',
                                borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            {generating ? 'Architecting...' : <><FaMagic /> AI Generate</>}
                        </button>
                    </div>
                    {roadmap.length > 0 && (
                        <button
                            onClick={handleSaveRoadmap}
                            disabled={saving}
                            style={{
                                background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border)',
                                padding: '0.6rem 1.2rem', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <FaSave /> {saving ? 'Saving...' : 'Save Plan'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Main Roadmap Area */}
                <div className="elite-card" style={{ padding: '3rem' }}>
                    {roadmap.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                            <FaRocket style={{ fontSize: '4rem', color: 'var(--primary)', opacity: 0.2, marginBottom: '2rem' }} />
                            <h2>No Roadmap Generated Yet</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Use the AI generator above to craft your personalized 3-month career path.</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            {roadmap.map((phase, idx) => (
                                <div key={idx} style={{ marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                        <div className="phase-bubble" style={{ background: phase.color || 'var(--primary)', color: 'black' }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{phase.title}</h3>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg-secondary)', padding: '0.3rem 0.8rem', borderRadius: '2rem' }}>
                                                    {phase.duration}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>{phase.description}</p>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Key Modules</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {phase.tasks.slice(0, 3).map((task, tidx) => (
                                                            <div key={tidx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                                                <FaCircle style={{ fontSize: '0.5rem', color: phase.color }} />
                                                                <span style={{ fontWeight: 600 }}>{task.title}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Deliverables</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {phase.projects?.map((proj, pidx) => (
                                                            <div key={pidx} style={{ background: 'rgba(26, 50, 99, 0.05)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(26, 50, 99, 0.2)' }}>
                                                                <div style={{ fontSize: '0.7rem', color: '#1A3263', fontWeight: 800, marginBottom: '0.2rem' }}>PROJECT</div>
                                                                <div style={{ fontWeight: 700 }}>{proj.name}</div>
                                                            </div>
                                                        ))}
                                                        {phase.internship && (
                                                            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.2rem' }}>MILESTONE</div>
                                                                <div style={{ fontWeight: 700 }}>{phase.internship.focus}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {idx !== roadmap.length - 1 && <div className="roadmap-line"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: History & Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="elite-card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                            <FaHistory color="var(--primary)" /> Saved Paths
                        </h3>
                        {savedRoadmaps.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No saved plans yet. Generate and save one to see it here.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {savedRoadmaps.map(rm => (
                                    <div
                                        key={rm.id}
                                        onClick={() => loadSavedRoadmap(JSON.parse(rm.roadmap_data))}
                                        style={{
                                            background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '1rem',
                                            border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rm.role_title}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saved on {new Date(rm.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="elite-card" style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(212, 175, 55, 0.05) 100%)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Pro Tips</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <FaLightbulb color="var(--primary)" style={{ marginTop: '0.2rem' }} />
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Follow the phases sequentially. Skipping fundamentals often leads to gaps in technical interviews.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <FaCalendarAlt color="var(--primary)" style={{ marginTop: '0.2rem' }} />
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                    Dedicated at least 2 hours daily for the projects mentioned in Phase 2 & 3.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roadmap;

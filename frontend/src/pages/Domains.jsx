import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    FaCode, FaBuilding, FaChartLine, FaCogs, FaPalette, FaBriefcase,
    FaRobot, FaArrowRight, FaHeartbeat, FaGavel, FaGlobe,
    FaDraftingCompass, FaSearch, FaFilter, FaLayerGroup, FaBolt, FaUsers, FaMapMarkedAlt, FaBrain, FaStar
} from 'react-icons/fa';
import { motion as Motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const iconMap = {
    'code': <FaCode />,
    'building': <FaBuilding />,
    'chart-line': <FaChartLine />,
    'cogs': <FaCogs />,
    'palette': <FaPalette />,
    'briefcase': <FaBriefcase />,
    'robot': <FaRobot />,
    'heartbeat': <FaHeartbeat />,
    'gavel': <FaGavel />,
    'globe': <FaGlobe />,
    'drafting-compass': <FaDraftingCompass />
};

const impactStatements = {
    'IT & Software': "Build scalable systems, AI applications, and digital platforms shaping the future economy.",
    'Government & Competitive Exams': "Secure leadership roles in civil services, banking, defense, and public administration.",
    'Commerce & Finance': "Master capital markets, analytics, and financial strategy for global impact.",
    'Core Engineering': "Design infrastructure, manufacturing systems, and high-performance hardware.",
    'Arts & Humanities': "Drive culture, communication, and behavioral insights across industries.",
    'Management & MBA': "Lead operations, growth strategy, and enterprise transformation."
};

const getDomainCategory = (name) => {
    const tech = ['IT & Software', 'Core Engineering', 'AI & Data Science', 'Cybersecurity'];
    const business = ['Commerce & Finance', 'Management & MBA', 'Marketing', 'Entrepreneurship'];
    const creative = ['Arts & Humanities', 'Design', 'Media', 'Fine Arts'];
    const social = ['Government & Competitive Exams', 'Law', 'Public Health', 'Education'];

    if (tech.includes(name)) return 'Technology';
    if (business.includes(name)) return 'Business';
    if (creative.includes(name)) return 'Creative';
    if (social.includes(name)) return 'Social';
    return 'Other';
};

const Domains = () => {
    const { t } = useLanguage();
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [growthFilter] = useState('All');

    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const res = await axios.get('/api/domains');
                // Ensure data has inferred properties for elite UI
                const enrichedData = (res.data || []).map(d => ({
                    ...d,
                    category: getDomainCategory(d.name || ''),
                    growthLevel: (d.name || '').includes('IT') || (d.name || '').includes('AI') ? 'High Demand' :
                        (d.name || '').includes('Gov') ? 'Competitive' :
                            (d.name || '').includes('Art') ? 'Emerging' : 'Stable'
                }));
                setDomains(enrichedData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDomains();
    }, []);

    const filteredDomains = domains.filter(domain => {
        const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || domain.category === selectedCategory;
        const matchesGrowth = growthFilter === 'All' || (domain.growthLevel || 'Stable') === growthFilter;
        return matchesSearch && matchesCategory && matchesGrowth;
    });

    if (loading) return (
        <div className="discovery-loader">
            <Motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="loader-spinner"
            />
        </div>
    );

    return (
        <div className="domains-elite-container">
            <div className="neural-background">
                <div className="dot-grid" />
                <div className="glow-sphere-primary" />
                <div className="glow-sphere-secondary" />
            </div>

            {/* HERO HEADER SECTION (Elite) */}
            <header className="domains-hero-elite">
                <Motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hero-inner-elite"
                >
                    <div className="hero-badge">
                        <FaStar />
                        <span>{t('domains.badge', { defaultValue: 'NEURAL DOMAIN EXPLORER' })}</span>
                    </div>
                    <h1>Orbit Your <span className="text-gradient">Career Future</span></h1>
                </Motion.div>
            </header>

            {/* ELITE SEARCH EXPERIENCE */}
            <div className="search-section-elite">
                <div className="search-wrapper-elite">
                    <FaSearch className="search-icon-elite" />
                    <input
                        type="text"
                        placeholder={t('domains.searchPlaceholder', { defaultValue: 'Scan domains, roles or industries...' })}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-elite"
                    />
                    <div className="filter-badge-elite">
                        {selectedCategory}
                    </div>
                </div>
            </div>

            {/* ELITE DOMAIN CARDS GRID */}
            <div className="domains-elite-grid">
                {filteredDomains.map((domain, index) => (
                    <Link
                        key={domain.id}
                        to={`/domains/${domain.id}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <Motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="domain-card-elite"
                        >
                            <div className="card-shine" />
                            <div className="card-top-row">
                                <div className="domain-icon-wrapper">
                                    {iconMap[domain.icon] || <FaBriefcase />}
                                </div>
                                <div className="growth-badge-small" data-type={domain.growthLevel || 'High Demand'}>
                                    <FaBolt className="bolt-icon" />
                                    {t('domains.demand', { level: domain.growthLevel || 'High Demand', defaultValue: domain.growthLevel || 'High Demand' })}
                                </div>
                            </div>

                            <div className="card-main-content">
                                <h3>{domain.name}</h3>
                                <div className="domain-stats-row">
                                    <div className="mini-stat">
                                        <FaUsers size={12} />
                                        <span>240+ Pathways</span>
                                    </div>
                                    <div className="mini-stat">
                                        <FaStar size={12} />
                                        <span>Top Choice</span>
                                    </div>
                                </div>
                                <p className="impact-statement">
                                    {t(`domains.impact.${domain.name.toLowerCase().includes('it') ? 'it' :
                                        domain.name.toLowerCase().includes('gov') ? 'gov' :
                                            domain.name.toLowerCase().includes('fin') || domain.name.toLowerCase().includes('comm') ? 'finance' :
                                                domain.name.toLowerCase().includes('eng') ? 'core' :
                                                    domain.name.toLowerCase().includes('art') ? 'arts' :
                                                        domain.name.toLowerCase().includes('manag') ? 'management' : 'it'}`, { defaultValue: impactStatements[domain.name] || (domain.description ? domain.description.split('.')[0] + '.' : 'Explore high-growth career opportunities.') })}
                                </p>
                            </div>

                            <div className="card-bottom-row">
                                <div className="explore-btn-elite">
                                    <span>{t('domains.explorePathways', { defaultValue: 'DECODE PATHWAY' })}</span>
                                    <FaArrowRight />
                                </div>
                            </div>
                        </Motion.div>
                    </Link>
                ))}
            </div>

            {/* STATS STRIP SECTION */}
            <section className="premium-stats-strip">
                <div className="stats-grid-horizontal">
                    <div className="stat-card-minimal">
                        <FaMapMarkedAlt className="stat-icon" />
                        <div className="stat-info">
                            <h4>120+</h4>
                            <p>{t('domains.stats.roles')}</p>
                        </div>
                    </div>
                    <div className="stat-card-minimal">
                        <FaBolt className="stat-icon" />
                        <div className="stat-info">
                            <h4>45+</h4>
                            <p>{t('domains.stats.roadmaps')}</p>
                        </div>
                    </div>
                    <div className="stat-card-minimal">
                        <FaLayerGroup className="stat-icon" />
                        <div className="stat-info">
                            <h4>10+</h4>
                            <p>{t('domains.stats.highGrowth')}</p>
                        </div>
                    </div>
                    <div className="stat-card-minimal highlight">
                        <FaBrain className="stat-icon" />
                        <div className="stat-info">
                            <h4>{t('domains.stats.aiPowered')}</h4>
                            <p>{t('domains.stats.personalized')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .domains-elite-container {
                    padding: 40px 60px 80px;
                    max-width: 1600px;
                    margin: 0 auto;
                    position: relative;
                    min-height: 100vh;
                    overflow: hidden;
                }

                .neural-background {
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    background: var(--bg-primary);
                }

                .dot-grid {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(var(--border) 1px, transparent 1px);
                    background-size: 30px 30px;
                    opacity: 0.3;
                }

                .glow-sphere-primary {
                    position: absolute;
                    top: -10%;
                    right: -10%;
                    width: 60vw;
                    height: 60vw;
                    background: radial-gradient(circle, rgba(26, 50, 99, 0.08), transparent 70%);
                    filter: blur(100px);
                }

                .glow-sphere-secondary {
                    position: absolute;
                    bottom: -10%;
                    left: -10%;
                    width: 50vw;
                    height: 50vw;
                    background: radial-gradient(circle, rgba(26, 50, 99, 0.05) 0%, transparent 70%);
                    filter: blur(100px);
                }

                .domains-hero-elite {
                    margin-bottom: 60px;
                    text-align: center;
                }

                .hero-inner-elite {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 20px;
                    background: rgba(26, 50, 99, 0.1);
                    border: 1px solid rgba(26, 50, 99, 0.2);
                    border-radius: 100px;
                    color: var(--primary);
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    margin-bottom: 32px;
                }

                .domains-hero-elite h1 {
                    font-size: 4.5rem;
                    font-weight: 950;
                    letter-spacing: -0.05em;
                    line-height: 1.1;
                    margin-bottom: 24px;
                    color: var(--text-main);
                }

                .text-gradient {
                    color: var(--accent);
                }

                .domains-hero-elite p {
                    font-size: 1.3rem;
                    color: var(--text-muted);
                    max-width: 600px;
                    margin: 0 auto 48px;
                    line-height: 1.6;
                }

                /* Elite Search Bar */
                .search-section-elite {
                    position: relative;
                    max-width: 700px;
                    margin: 0 auto 80px;
                }

                .search-wrapper-elite {
                    position: relative;
                    background: var(--bg-glass);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: var(--shadow-elite);
                    transition: border-color 0.3s, box-shadow 0.3s;
                }

                .search-wrapper-elite:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px var(--primary-glow);
                }

                .search-icon-elite {
                    color: var(--text-muted);
                    font-size: 1.2rem;
                    margin-left: 12px;
                }

                .search-input-elite {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    font-size: 1.1rem;
                    padding: 12px 0;
                    outline: none;
                }

                .filter-badge-elite {
                    background: var(--bg-surface);
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    border: 1px solid var(--border);
                }

                /* Elite Grid */
                .domains-elite-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 40px;
                }

                .domain-card-elite {
                    background: var(--bg-glass);
                    backdrop-filter: blur(40px);
                    border: 1px solid var(--border);
                    border-radius: 36px;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .domain-card-elite:hover {
                    transform: translateY(-12px);
                    border-color: var(--primary);
                    box-shadow: 0 30px 60px -20px rgba(26, 50, 99, 0.3);
                }

                .card-shine {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
                    opacity: 0;
                    transition: opacity 0.5s;
                }

                .domain-card-elite:hover .card-shine {
                    opacity: 1;
                }

                .card-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .domain-icon-wrapper {
                    width: 70px;
                    height: 70px;
                    border-radius: 22px;
                    background: var(--bg-surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    color: var(--primary);
                    transition: all 0.5s;
                }

                .domain-card-elite:hover .domain-icon-wrapper {
                    background: var(--primary);
                    color: white;
                    transform: scale(1.1) rotate(5deg);
                }

                .growth-badge-small {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    background: rgba(0,0,0,0.05);
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                }

                .growth-badge-small[data-type='High Demand'] { color: #1A3263; background: rgba(26, 50, 99, 0.1); }
                .growth-badge-small[data-type='Competitive'] { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
                .growth-badge-small[data-type='Emerging'] { color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
                .growth-badge-small[data-type='Stable'] { color: #6366f1; background: rgba(99, 102, 241, 0.1); }

                .card-main-content h3 {
                    font-size: 1.8rem;
                    font-weight: 850;
                    color: var(--text-main);
                    margin-bottom: 12px;
                    letter-spacing: -0.03em;
                }

                .domain-stats-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .mini-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .impact-statement {
                    padding: 16px;
                    background: rgba(0,0,0,0.02);
                    border-radius: 20px;
                    font-size: 1rem;
                    font-weight: 500;
                    line-height: 1.5;
                    color: var(--text-muted);
                    border-left: 3px solid var(--primary);
                }

                .card-bottom-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: auto;
                }

                .explore-btn-elite {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .discovery-loader { min-height: 400px; display: flex; align-items: center; justify-content: center; }
                .loader-spinner { width: 50px; height: 50px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; }

                /* Text Gradient */
                .text-gradient {
                    background: linear-gradient(to right, var(--primary), var(--accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                @media (max-width: 992px) {
                    .domains-elite-container { padding: 30px 20px 60px; }
                    .domains-elite-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
                    .stats-grid-horizontal { grid-template-columns: repeat(2, 1fr); }
                    .domains-hero-elite h1 { font-size: 3rem; }
                    .hero-inner-elite { padding: 0 10px; }
                    .premium-stats-strip { padding: 30px 20px; }
                }

                @media (max-width: 600px) {
                    .domains-elite-container { padding: 16px 12px 40px; }
                    .domains-hero-elite { text-align: left; margin-bottom: 30px; }
                    .domains-hero-elite h1 { font-size: 1.8rem; text-align: left; line-height: 1.1; margin-bottom: 6px; }
                    .hero-badge { margin-bottom: 8px; font-size: 0.6rem; padding: 4px 10px; display: inline-flex; }
                    .hero-inner-elite { text-align: left; margin: 0; }
                    .search-section-elite { margin-bottom: 24px; }
                    .domains-elite-grid { grid-template-columns: 1fr; }
                    .stats-grid-horizontal { grid-template-columns: 1fr; }
                    .search-wrapper-elite { padding: 6px 10px; flex-direction: row; gap: 8px; border-radius: 16px; width: 100%; box-sizing: border-box; }
                    .search-input-elite { padding: 6px 0; font-size: 0.95rem; width: 100%; }
                    .search-icon-elite { margin-left: 2px; font-size: 1rem; }
                    .filter-badge-elite { padding: 6px 10px; font-size: 0.7rem; border-radius: 10px; white-space: nowrap; }
                }
            `}</style>
        </div>
    );
};

export default Domains;

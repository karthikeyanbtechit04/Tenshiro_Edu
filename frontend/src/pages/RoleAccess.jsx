import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    FaRoute, FaBook, FaProjectDiagram, FaBriefcase, FaUserTie, FaBolt,
    FaLightbulb, FaRocket, FaRobot, FaChevronRight, FaChevronDown,
    FaArrowLeft, FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock,
    FaMoneyBillWave, FaStar, FaInfoCircle, FaSearch, FaFilter, FaCheckCircle, FaChartLine,
    FaCode, FaLayerGroup, FaBullseye, FaGraduationCap, FaSuitcase, FaUserCircle
} from 'react-icons/fa';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const RoleAccess = () => {
    const { language, t } = useLanguage();
    const { user } = useAuth();
    const { id: roleId } = useParams(); // Renamed id to roleId
    const [roleData, setRoleData] = useState(null); // Renamed role to roleData
    const [activeSection, setActiveSection] = useState('overview');
    const [loading, setLoading] = useState(true);
    console.log("[DEBUG] RoleAccess Rendered - v2 (Roadmap Default)");
    const [openPhases, setOpenPhases] = useState({ 0: true }); // Phase 1 open by default
    const roadmapContainerRef = useRef(null);

    // Data states
    const [studyPlan, setStudyPlan] = useState([]);
    const [courses, setCourses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [premiumOverview, setPremiumOverview] = useState(null);

    // Loading states for background fetching
    const [roadmapLoading, setRoadmapLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [overviewLoading, setOverviewLoading] = useState(true);

    // Filtering states
    const [courseFilter, setCourseFilter] = useState('All');
    const [projectFilter, setProjectFilter] = useState('All');
    // Removed jobFilter as we strictly separate by section
    const [courseSearch, setCourseSearch] = useState('');
    const [projectSearch, setProjectSearch] = useState('');
    const [jobSearch, setJobSearch] = useState('');

    // Dynamic Roadmap Parameters
    const [userLevel, setUserLevel] = useState('Beginner');
    const [targetDuration, setTargetDuration] = useState('3m');
    const [weeklyCommitment, setWeeklyCommitment] = useState('10 hrs');
    const [roadmapGoal, setRoadmapGoal] = useState('Job Ready');
    const [marketFocus, setMarketFocus] = useState('India');
    const [aiOptimizationMode, setAiOptimizationMode] = useState('Balanced');

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const roleRes = await axios.get(`https://tenshiro.onrender.com/api/roles/${roleId}`, config);
                setRoleData(roleRes.data);
                setLoading(false);

                fetchStudyPlan(roleId, roleRes.data.title, config, language, {
                    level: userLevel,
                    duration: targetDuration,
                    weeklyCommitment: weeklyCommitment,
                    goal: roadmapGoal,
                    market: marketFocus,
                    aiMode: aiOptimizationMode
                });

                // Fetch all other data in background
                fetchJobs(roleRes.data.title, config);
                fetchCourses(roleRes.data.title, roleRes.data.domain_id, config, language);
                fetchProjects(roleRes.data.title, roleRes.data.domain_id, config, language);
                fetchPremiumOverview(roleRes.data.title, roleRes.data.domain_name, config, language);
            } catch (error) {
                console.error('Error in initial data fetch:', error);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [roleId, language]);

    const fetchStudyPlan = async (roleId, roleTitle, config, lang, params = {}) => {
        try {
            setRoadmapLoading(true);

            // Try to fetch customized roadmap from AI
            const aiRes = await axios.post('https://tenshiro.onrender.com/api/ai/roadmap', {
                roleId,
                roleTitle,
                language: lang,
                level: params.level || userLevel,
                duration: params.duration || targetDuration,
                weeklyCommitment: params.weeklyCommitment || weeklyCommitment,
                goal: params.goal || roadmapGoal,
                market: params.market || marketFocus,
                aiMode: params.aiMode || aiOptimizationMode
            }, config);

            if (Array.isArray(aiRes.data)) {
                setStudyPlan(aiRes.data);
            } else {
                console.error("[Frontend] AI Roadmap returned non-array:", aiRes.data);
                // Try fallback to DB if AI returns garbage
                const dbRes = await axios.get(`https://tenshiro.onrender.com/api/roles/${roleId}/study-plan`, config);
                setStudyPlan(dbRes.data || []);
            }

        } catch (e) {
            console.error('Roadmap fetch failed', e);
            setStudyPlan([]);
        } finally {
            setRoadmapLoading(false);
        }
    };

    const handleCustomizeRoadmap = async () => {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await fetchStudyPlan(roleId, roleData.title, config, language);

        // Automatic scroll to roadmap after generation
        setTimeout(() => {
            if (roadmapContainerRef.current) {
                roadmapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const fetchJobs = async (roleTitle, config) => {
        try {
            setJobsLoading(true);
            // Switch to AI-driven job recommendations for "real-time" feel and higher count
            const res = await axios.post('https://tenshiro.onrender.com/api/ai/job-recommendation', {
                role: roleTitle
            }, config);

            if (Array.isArray(res.data)) {
                setJobs(res.data);
            } else {
                console.error("AI Jobs API returned non-array:", res.data);
                setJobs([]);
            }
        } catch (e) {
            console.error('Jobs fetch failed, falling back to basic data', e);
            // Fallback to basic DB jobs if AI fails
            try {
                const dbRes = await axios.get(`https://tenshiro.onrender.com/api/jobs/role/${roleId}`, config);
                if (Array.isArray(dbRes.data)) {
                    setJobs(dbRes.data);
                } else {
                    setJobs([]);
                }
            } catch (dbErr) {
                console.error('DB jobs also failed', dbErr);
                setJobs([]);
            }
        } finally {
            setJobsLoading(false);
        }
    };

    const fetchCourses = async (roleTitle, domainId, config, lang) => {
        try {
            setCoursesLoading(true);
            const res = await axios.post('https://tenshiro.onrender.com/api/ai/course-recommendation', {
                role: roleTitle,
                domainId: domainId,
                language: lang
            }, config);
            setCourses(res.data);
        } catch (e) {
            console.error('Courses fetch failed', e);
        } finally {
            setCoursesLoading(false);
        }
    };

    const fetchProjects = async (roleTitle, domainId, config, lang) => {
        try {
            setProjectsLoading(true);
            const res = await axios.post('https://tenshiro.onrender.com/api/ai/project-suggestion', {
                role: roleTitle,
                domainId: domainId,
                language: lang
            }, config);
            setProjects(res.data);
        } catch (e) {
            console.error('Projects fetch failed', e);
        } finally {
            setProjectsLoading(false);
        }
    };

    const fetchPremiumOverview = async (roleTitle, domainName, config, lang) => {
        try {
            setOverviewLoading(true);
            const res = await axios.post('https://tenshiro.onrender.com/api/ai/premium-overview', {
                roleTitle: roleTitle,
                domainName: domainName,
                language: lang
            }, config);
            setPremiumOverview(res.data);
        } catch (e) {
            console.error('Premium overview fetch failed', e);
        } finally {
            setOverviewLoading(false);
        }
    };



    const filteredCourses = useMemo(() => {
        if (!Array.isArray(courses)) return [];
        return courses.filter(course => {
            const title = course.title?.toLowerCase() || '';
            const search = courseSearch.toLowerCase();
            const matchesSearch = title.includes(search);
            const matchesFilter = courseFilter === 'All' || course.difficulty === courseFilter;
            return matchesSearch && matchesFilter;
        });
    }, [courses, courseSearch, courseFilter]);

    const filteredProjects = useMemo(() => {
        if (!Array.isArray(projects)) return [];
        return projects.filter(project => {
            const title = project.title?.toLowerCase() || '';
            const desc = project.description?.toLowerCase() || '';
            const search = projectSearch.toLowerCase();
            const matchesSearch = title.includes(search) || desc.includes(search);
            const matchesFilter = projectFilter === 'All' || project.difficulty === projectFilter;
            return matchesSearch && matchesFilter;
        });
    }, [projects, projectSearch, projectFilter]);

    const filteredInternships = useMemo(() => {
        if (!Array.isArray(jobs)) return [];
        return jobs.filter(job => {
            const title = job.title?.toLowerCase() || '';
            const company = job.company?.toLowerCase() || '';
            const location = job.location?.toLowerCase() || '';
            const search = jobSearch.toLowerCase();

            const matchesSearch = title.includes(search) || company.includes(search) || location.includes(search);
            return matchesSearch && job.type === 'internship';
        });
    }, [jobs, jobSearch]);

    const filteredFullTimeJobs = useMemo(() => {
        if (!Array.isArray(jobs)) return [];
        return jobs.filter(job => {
            const title = job.title?.toLowerCase() || '';
            const company = job.company?.toLowerCase() || '';
            const location = job.location?.toLowerCase() || '';
            const search = jobSearch.toLowerCase();

            const matchesSearch = title.includes(search) || company.includes(search) || location.includes(search);
            return matchesSearch && job.type === 'job';
        });
    }, [jobs, jobSearch]);

    const sections = [
        { id: 'overview', label: t('roles.overview'), icon: <FaLightbulb /> },
        { id: 'roadmap', label: t('roles.roadmap'), icon: <FaRoute /> },
        { id: 'courses', label: t('roles.courses'), icon: <FaBook /> },
        { id: 'projects', label: t('roles.projects'), icon: <FaProjectDiagram /> },
        { id: 'internships', label: t('roles.internships'), icon: <FaBriefcase /> },
        { id: 'jobs', label: t('roles.jobs'), icon: <FaUserTie /> }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview': {
                if (overviewLoading) return (
                    <div className="tab-pane active">
                        <div className="shimmer skeleton-guidance" style={{ height: '400px', marginBottom: '1.5rem' }}></div>
                        <div className="grid-skeleton">
                            {[1, 2, 3, 4].map(i => <div key={i} className="shimmer skeleton-card"></div>)}
                        </div>
                    </div>
                );

                if (!premiumOverview) return (
                    <div className="tab-pane active">
                        <div className="error-card section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <FaInfoCircle size={40} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>{t('roles.intelligenceReportUnavailable')}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{t('roles.intelligenceReportErrorDesc')}</p>
                        </div>
                    </div>
                );

                const po = premiumOverview;

                return (
                    <div className="tab-pane active">
                        {/* 1. STRATEGIC POSITIONING */}
                        <section className="premium-hero-strategic">
                            <div className="hero-content">
                                <span className="premium-label-top">{t('roles.strategicPositioning')}</span>
                                <h1 className="premium-headline">{po.strategic_positioning?.headline || 'Role Architecture'}</h1>
                                <p className="premium-summary-exec">{po.strategic_positioning?.summary || 'Executive oversight for high-impact technical systems.'}</p>
                            </div>
                        </section>

                        {/* 2. MARKET INTELLIGENCE METRICS GRID */}
                        <div className="premium-metrics-grid">
                            {Array.isArray(po.market_intelligence) ? po.market_intelligence.map((m, i) => (
                                <div key={i} className="premium-metric-card">
                                    <span className="p-m-label">{m.label}</span>
                                    <span className="p-m-value">{m.value}</span>
                                    <span className="p-m-detail">{m.detail}</span>
                                </div>
                            )) : (
                                <div className="error-minor">{t('roles.metricsDataUnavailable')}</div>
                            )}
                        </div>

                        {/* 3. EXECUTION DOMAINS */}
                        <div className="premium-section-title">
                            <h3>{t('roles.executionDomains')}</h3>
                            <span className="sub">{t('roles.coreResponsibilityMatrix')}</span>
                        </div>
                        <div className="premium-execution-grid">
                            {Array.isArray(po.execution_domains) ? po.execution_domains.map((d, i) => (
                                <div key={i} className="premium-exec-card">
                                    <h4>{d.category}</h4>
                                    <ul>
                                        {Array.isArray(d.bullets) ? d.bullets.map((b, bi) => <li key={bi}>{b}</li>) : null}
                                    </ul>
                                    <div className="relevance">
                                        <strong>{t('roles.businessRelevance')}:</strong> {d.relevance}
                                    </div>
                                </div>
                            )) : (
                                <div className="error-minor">{t('roles.executionDomainsDataUnavailable')}</div>
                            )}
                        </div>

                        {/* 4. SKILL DEPTH MAP */}
                        <div className="premium-section-title">
                            <h3 style={{ textTransform: 'uppercase' }}>{roleData?.domain_name ? `${roleData.domain_name} ${t('roles.skillDepthMap')}` : t('roles.skillDepthMap')}</h3>
                        </div>
                        <div className="premium-skills-card">
                            <div className="skill-row-exec">
                                <label style={{ textTransform: 'uppercase' }}>{roleData?.domain_name ? `${roleData.domain_name} CORE` : t('roles.technicalCore')}</label>
                                <div className="tag-group">
                                    {Array.isArray(po.skill_depth_map?.technical_core) ? po.skill_depth_map.technical_core.map((s, i) => <span key={i} className="tag-exec core">{s}</span>) : null}
                                </div>
                            </div>
                            <div className="skill-row-exec">
                                <label style={{ textTransform: 'uppercase' }}>{roleData?.domain_name ? `${roleData.domain_name} TOOLS` : t('roles.infrastructureTools')}</label>
                                <div className="tag-group">
                                    {Array.isArray(po.skill_depth_map?.infrastructure) ? po.skill_depth_map.infrastructure.map((s, i) => <span key={i} className="tag-exec infra">{s}</span>) : null}
                                </div>
                            </div>
                            <div className="skill-row-exec">
                                <label style={{ textTransform: 'uppercase' }}>{roleData?.domain_name ? `${roleData.domain_name} STRATEGIC` : t('roles.strategicAdvanced')}</label>
                                <div className="tag-group">
                                    {Array.isArray(po.skill_depth_map?.strategic) ? po.skill_depth_map.strategic.map((s, i) => <span key={i} className="tag-exec strategic">{s}</span>) : null}
                                </div>
                            </div>
                        </div>

                        {/* 5. INDUSTRY ADOPTION LANDSCAPE */}
                        <div className="premium-section-title">
                            <h3>{t('roles.industryAdoptionLandscape')}</h3>
                        </div>
                        <div className="industry-list-exec horizontal">
                            {Array.isArray(po.industry_adoption) ? po.industry_adoption.map((ind, i) => (
                                <div key={i} className="industry-item-exec">
                                    <FaCheckCircle size={10} />
                                    <span>{ind}</span>
                                </div>
                            )) : null}
                        </div>

                        {/* 6. CAREER PROGRESSION PATH */}
                        <div className="premium-section-title">
                            <h3>{t('roles.careerProgressionLadder')}</h3>
                            <span className="sub">{t('roles.typicalGrowthTrajectory')}</span>
                        </div>
                        <div className="premium-ladder-container">
                            {Array.isArray(po.career_progression) ? po.career_progression.map((step, i) => (
                                <div key={i} className="ladder-step-exec">
                                    <div className="step-marker">
                                        <div className="dot"></div>
                                        {i < po.career_progression.length - 1 && <div className="line"></div>}
                                    </div>
                                    <div className="step-content">
                                        <div className="step-header">
                                            <h4>{step.level}</h4>
                                            <span className="years">{step.years} {t('roles.years')}</span>
                                        </div>
                                        <div className="step-salary">{step.salary}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="error-minor">{t('roles.progressionDataUnavailable')}</div>
                            )}
                        </div>

                        {/* 7. FUTURE OUTLOOK INTELLIGENCE */}
                        <div className="premium-section-title">
                            <h3>{t('roles.futureOutlookIntelligence')}</h3>
                        </div>
                        <div className="premium-outlook-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="outlook-row">
                                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#6366f1', marginBottom: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('roles.longTermForecast')}</label>
                                <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-main)' }}>{po.future_outlook?.forecast || po.future_outlook?.forecast_status || 'Strong long-term demand with increasing adoption across industries. This role is expected to remain relevant as digital transformation accelerates.'}</p>
                            </div>
                            <div className="outlook-row">
                                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#6366f1', marginBottom: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('roles.aiDisruptionAdaptation')}</label>
                                <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-main)' }}>{po.future_outlook?.ai_disruption || 'AI will augment this role rather than replace it — professionals who leverage AI tools will be significantly more productive and better compensated.'}</p>
                            </div>
                            <div className="outlook-row">
                                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#6366f1', marginBottom: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{t('roles.globalVsIndiaTrend')}</label>
                                <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-main)' }}>{po.future_outlook?.global_vs_india_trend || po.future_outlook?.trend || 'India is becoming a global hub for this expertise, with salaries and opportunities growing rapidly to match global standards.'}</p>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'roadmap':
                return (
                    <div className="tab-pane">
                        <section className="section-card">
                            <div className="roadmap-header">
                                <h2><FaRoute className="icon-indigo" /> {t('roles.roadmap')}</h2>
                                <span className="roadmap-subtitle">{t('roles.premiumAIDrivenCareerArchitect')}</span>
                            </div>

                            {/* AI STRATEGY CONFIGURATION PANEL */}
                            <div className="ai-strategy-panel">
                                <div className="panel-header">
                                    <h3 className="panel-title">{t('roles.aiStrategyConfiguration')}</h3>
                                    <p className="panel-subtext">{t('roles.defineYourConstraints')}</p>
                                </div>


                                <div className="strategy-grid">
                                    {/* Experience Level */}
                                    <div className="control-block">
                                        <label className="block-label">{t('roles.experienceLevel')}</label>
                                        <div className="toggle-group">
                                            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                                <button
                                                    key={lvl}
                                                    className={`toggle-btn ${userLevel === lvl ? 'active' : ''}`}
                                                    onClick={() => setUserLevel(lvl)}
                                                >
                                                    {t(`common.${lvl.toLowerCase()}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Target Duration */}
                                    <div className="control-block">
                                        <label className="block-label">{t('roles.targetDuration')}</label>
                                        <div className="toggle-group">
                                            {['3m', '6m', '9m', '12m'].map(dur => (
                                                <button
                                                    key={dur}
                                                    className={`toggle-btn ${targetDuration === dur ? 'active' : ''}`}
                                                    onClick={() => setTargetDuration(dur)}
                                                >
                                                    {dur.replace('m', ' Months')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>



                                    {/* Strategic Goal */}
                                    <div className="control-block">
                                        <label className="block-label">{t('roles.strategicGoal')}</label>
                                        <div className="toggle-group">
                                            {['Full-time Job', 'Internship', 'Promotion', 'Freelance', 'Startup'].map(goal => (
                                                <button
                                                    key={goal}
                                                    className={`toggle-btn ${roadmapGoal === goal ? 'active' : ''}`}
                                                    onClick={() => setRoadmapGoal(goal)}
                                                >
                                                    {t(`roles.${goal.toLowerCase().replace(/ /g, '')}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Market Focus */}
                                    <div className="control-block">
                                        <label className="block-label">{t('roles.marketFocus')}</label>
                                        <div className="toggle-group">
                                            {['India', 'Global', 'Remote-first'].map(mkt => (
                                                <button
                                                    key={mkt}
                                                    className={`toggle-btn ${marketFocus === mkt ? 'active' : ''}`}
                                                    onClick={() => setMarketFocus(mkt)}
                                                >
                                                    {mkt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>


                                </div>

                                <div className="panel-footer">
                                    <button
                                        className="generate-roadmap-btn"
                                        onClick={handleCustomizeRoadmap}
                                        disabled={roadmapLoading}
                                    >
                                        {roadmapLoading ? (
                                            <>
                                                <div className="spinner-dots">
                                                    <span></span><span></span><span></span>
                                                </div>
                                                <span>{t('roles.architectingPlan')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('roles.generateOptimizedRoadmap')}</span>
                                                <FaRocket className="btn-icon" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="section-divider" ref={roadmapContainerRef}></div>

                            {roadmapLoading ? (
                                <div className="roadmap-skeleton">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="shimmer skeleton-phase"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="roadmap-accordion">
                                    {Array.isArray(studyPlan) && studyPlan.map((phase, idx) => {
                                        const isOpen = !!openPhases[idx];
                                        const phaseColor = phase.color || '#6366f1';
                                        const phaseIcons = [FaLayerGroup, FaCode, FaBullseye, FaGraduationCap, FaSuitcase];
                                        const PhaseIcon = phaseIcons[idx] || FaRoute;
                                        return (
                                            <div key={idx} className={`rm-phase-card ${isOpen ? 'open' : ''}`}
                                                style={{ '--phase-color': phaseColor }}>
                                                {/* Phase Header */}
                                                <button
                                                    className="rm-phase-header"
                                                    onClick={() => setOpenPhases(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                >
                                                    <div className="rm-phase-left">
                                                        <div className="rm-phase-num" style={{ background: phaseColor }}>
                                                            <PhaseIcon size={13} />
                                                        </div>
                                                        <div className="rm-phase-title-wrap">
                                                            <span className="rm-phase-label">{phase.phase || `${t('common.phase')} ${idx + 1}`}</span>
                                                            <span className="rm-phase-name">{phase.title}</span>
                                                        </div>
                                                    </div>
                                                    <div className="rm-phase-right">
                                                        <span className="rm-duration-badge">{phase.duration}</span>
                                                        <FaChevronDown className={`rm-chevron ${isOpen ? 'rotated' : ''}`} size={13} />
                                                    </div>
                                                </button>

                                                {/* Phase Body */}
                                                {isOpen && (
                                                    <div className="rm-phase-body">
                                                        <p className="rm-phase-desc">{phase.description}</p>

                                                        {/* Skills */}
                                                        {phase.skills?.length > 0 && (
                                                            <div className="rm-section">
                                                                <div className="rm-section-label"><FaCheckCircle size={11} /> {t('common.skills')}</div>
                                                                <div className="rm-skills-row">
                                                                    {phase.skills.map((skill, si) => (
                                                                        <a
                                                                            key={si}
                                                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="rm-skill-pill clickable"
                                                                            style={{ borderColor: phaseColor + '40', color: phaseColor }}
                                                                            title={`${t('common.learn')} ${skill}`}
                                                                        >
                                                                            {skill} <FaExternalLinkAlt size={8} style={{ opacity: 0.6 }} />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Courses + Projects side by side */}
                                                        <div className="rm-two-col">
                                                            {/* Courses */}
                                                            {phase.courses?.length > 0 && (
                                                                <div className="rm-section">
                                                                    <div className="rm-section-label"><FaBook size={11} /> {t('common.courses')}</div>
                                                                    <div className="rm-item-list">
                                                                        {phase.courses.map((c, ci) => (
                                                                            <div key={ci} className="rm-item-card">
                                                                                <div className="rm-item-top">
                                                                                    <span className="rm-item-name">{c.name}</span>
                                                                                    <span className="rm-platform-tag">{c.platform}</span>
                                                                                </div>
                                                                                <div className="rm-item-meta">
                                                                                    <span>⏱ {c.duration}</span>
                                                                                    <span>→ {c.outcome}</span>
                                                                                </div>
                                                                                {c.link && (
                                                                                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="rm-learn-link">
                                                                                        {t('common.learnNow')} <FaChevronRight size={10} />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Projects */}
                                                            {phase.projects?.length > 0 && (
                                                                <div className="rm-section">
                                                                    <div className="rm-section-label"><FaProjectDiagram size={11} /> {t('common.projects')}</div>
                                                                    <div className="rm-item-list">
                                                                        {phase.projects.map((p, pi) => (
                                                                            <div key={pi} className="rm-item-card">
                                                                                <div className="rm-item-top">
                                                                                    <span className="rm-item-name">{p.name}</span>
                                                                                    <span className={`rm-portfolio-tag pv-${(p.portfolio || 'Low').toLowerCase().replace(' ', '-')}`}>{p.portfolio}</span>
                                                                                </div>
                                                                                <div className="rm-item-meta">
                                                                                    <span>🛠 {Array.isArray(p.tools) ? p.tools.join(', ') : p.tools}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Internship */}
                                                        {phase.internship && (
                                                            <div className="rm-internship-block">
                                                                <div className="rm-section-label"><FaBriefcase size={11} /> {t('common.internship')}</div>
                                                                <div className="rm-intern-content">
                                                                    <div className="rm-intern-row"><strong>{t('common.type')}:</strong> {phase.internship.type}</div>
                                                                    <div className="rm-intern-row"><strong>{t('common.applyOn')}:</strong> {phase.internship.where}</div>
                                                                    <div className="rm-intern-row"><strong>{t('common.focus')}:</strong> {phase.internship.focus}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'courses':
                return (
                    <div className="tab-pane">
                        <section className="section-card">
                            <div className="tab-header">
                                <h2><FaBook className="icon-purple" /> {t('roles.courses')}</h2>
                                <div className="controls">
                                    <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                                        <option value="All">{t('common.allLevels')}</option>
                                        <option value="Beginner">{t('common.beginner')}</option>
                                        <option value="Intermediate">{t('common.intermediate')}</option>
                                        <option value="Advanced">{t('common.advanced')}</option>
                                    </select>
                                    <div className="search-box">
                                        <FaSearch size={12} />
                                        <input
                                            type="text"
                                            placeholder={t('roles.searchCourses')}
                                            value={courseSearch}
                                            onChange={(e) => setCourseSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {coursesLoading ? (
                                <div className="grid-skeleton">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="shimmer skeleton-card"></div>)}
                                </div>
                            ) : (
                                <div className="courses-grid">
                                    {filteredCourses.map((course, idx) => (
                                        <div key={idx} className="course-card-ui">
                                            <div className="c-image-wrap">
                                                <img
                                                    src={course.thumbnail || `https://api.dicebear.com/7.x/shapes/svg?seed=${course.title}`}
                                                    alt={course.title}
                                                    className="course-thumb"
                                                />
                                                <div className="c-overlay">
                                                    <span className={`diff-tag ${course.difficulty}`}>
                                                        {t(`common.${course.difficulty.toLowerCase()}`)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="c-content">
                                                <div className="c-label-row">
                                                    <span className="platform-name">{course.platform}</span>
                                                    {course.is_free && <span className="free-badge">{t('roles.free')}</span>}
                                                </div>
                                                <h4>{course.title}</h4>
                                                <div className="c-meta">
                                                    <FaCalendarAlt size={12} /> <span>{course.duration || t('common.flexible')}</span>
                                                </div>
                                                <div className="c-footer">
                                                    <div className="rating">
                                                        <FaStar /> {course.rating}
                                                    </div>
                                                    <a href={course.link} target="_blank" rel="noopener noreferrer" className="view-link-btn">
                                                        {t('roles.enroll')}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'projects':
                return (
                    <div className="tab-pane">
                        <section className="section-card">
                            <div className="tab-header">
                                <div className="header-left">
                                    <h2 className="premium-section-title"><FaProjectDiagram className="icon-cyan" /> {t('roles.projects')}</h2>
                                    <p className="tab-subtitle">{t('roles.handsOnExperience')}</p>
                                </div>
                                <div className="controls">
                                    <select
                                        className="premium-select"
                                        value={projectFilter}
                                        onChange={(e) => setProjectFilter(e.target.value)}
                                    >
                                        <option value="All">{t('common.allLevels')}</option>
                                        <option value="Beginner">{t('common.beginner')}</option>
                                        <option value="Intermediate">{t('common.intermediate')}</option>
                                        <option value="Advanced">{t('common.advanced')}</option>
                                    </select>
                                    <div className="search-box premium-search">
                                        <FaSearch size={12} />
                                        <input
                                            type="text"
                                            placeholder={t('roles.searchProjects')}
                                            value={projectSearch}
                                            onChange={(e) => setProjectSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {projectsLoading ? (
                                <div className="grid-skeleton">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="shimmer skeleton-card"></div>)}
                                </div>
                            ) : (
                                <div className="projects-grid">
                                    {filteredProjects.map((project, idx) => (
                                        <div key={idx} className="project-card-ui holographic">
                                            <div className="p-header">
                                                <span className={`diff-tag-premium ${project.difficulty?.toLowerCase()}`}>
                                                    {project.difficulty}
                                                </span>
                                                <span className="p-duration-elite">
                                                    <FaCalendarAlt size={12} /> {project.duration}
                                                </span>
                                            </div>
                                            <h4>{project.title}</h4>
                                            <p className="project-description-elite">{project.description}</p>
                                            <div className="stack-row-premium">
                                                {project.tech_stack?.map((tech, i) => (
                                                    <span key={i} className="stack-pill-premium">{tech}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'internships':
                return (
                    <div className="tab-pane">
                        <section className="section-card">
                            <div className="tab-header">
                                <div className="header-left">
                                    <h2 className="premium-section-title"><FaBriefcase className="icon-cyan" /> {t('roles.internships')}</h2>
                                    <p className="tab-subtitle">{t('roles.eliteInternshipOpportunities')}</p>
                                </div>
                                <div className="controls">
                                    <div className="search-box premium-search">
                                        <FaSearch size={12} />
                                        <input
                                            type="text"
                                            placeholder={t('roles.searchInternships')}
                                            value={jobSearch}
                                            onChange={(e) => setJobSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {jobsLoading ? (
                                <div className="grid-skeleton">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="shimmer skeleton-card"></div>)}
                                </div>
                            ) : (
                                <div className="jobs-grid">
                                    {filteredInternships.map((job, idx) => (
                                        <div key={idx} className="cyber-prism-card internship">
                                            <div className="prism-layer"></div>
                                            <div className="prism-wireframe"></div>
                                            <div className="prism-content-wrap">
                                                <div className="parallax-logo">
                                                    <div className="logo-orb">
                                                        <img
                                                            src={job.thumbnail || `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}&backgroundColor=00DFD8`}
                                                            alt={job.company}
                                                            className="prism-logo-img"
                                                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}&backgroundColor=6366f1`; }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="prism-body">
                                                    <div className="prism-header-row">
                                                        <span className="prism-pill tag-cyan"><FaBolt size={10} /> {t('common.internship')}</span>
                                                        <span className="prism-pill location"><FaMapMarkerAlt size={10} /> {job.location}</span>
                                                    </div>
                                                    <h3 className="prism-title">{job.title}</h3>
                                                    <div className="prism-sub-meta">
                                                        <span className="prism-company">{job.company}</span>
                                                        <div className="prism-deadline">
                                                            <FaCalendarAlt size={10} />
                                                            <span>{t('common.ends')} {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="prism-perks">
                                                        <div className="prism-perk-item">
                                                            <FaMoneyBillWave size={12} className="icon-cyan" />
                                                            <span>{job.salary_range}</span>
                                                        </div>
                                                    </div>
                                                    <p className="prism-desc">{job.description}</p>
                                                    <div className="prism-footer">
                                                        <a href={job.portal_link} target="_blank" rel="noopener noreferrer" className="prism-btn cyan">
                                                            <span>{t('roles.secureOpportunity')}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'jobs':
                return (
                    <div className="tab-pane">
                        <section className="section-card">
                            <div className="tab-header">
                                <div className="header-left">
                                    <h2 className="premium-section-title"><FaUserTie className="icon-indigo" /> {t('roles.jobs')}</h2>
                                    <p className="tab-subtitle">{t('roles.highImpactFullTimeRoles')}</p>
                                </div>
                                <div className="controls">
                                    <div className="search-box premium-search">
                                        <FaSearch size={12} />
                                        <input
                                            type="text"
                                            placeholder={t('roles.searchJobs')}
                                            value={jobSearch}
                                            onChange={(e) => setJobSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {jobsLoading ? (
                                <div className="grid-skeleton">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="shimmer skeleton-card"></div>)}
                                </div>
                            ) : (
                                <div className="jobs-grid">
                                    {filteredFullTimeJobs.map((job, idx) => (
                                        <div key={idx} className="cyber-prism-card job">
                                            <div className="prism-layer"></div>
                                            <div className="prism-wireframe"></div>
                                            <div className="prism-content-wrap">
                                                <div className="parallax-logo">
                                                    <div className="logo-orb">
                                                        <img
                                                            src={job.thumbnail || `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}&backgroundColor=6366f1`}
                                                            alt={job.company}
                                                            className="prism-logo-img"
                                                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}&backgroundColor=6366f1`; }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="prism-body">
                                                    <div className="prism-header-row">
                                                        <span className="prism-pill tag-indigo"><FaBriefcase size={10} /> {t('common.fullTime')}</span>
                                                        <span className="prism-pill location"><FaMapMarkerAlt size={10} /> {job.location}</span>
                                                    </div>
                                                    <h3 className="prism-title">{job.title}</h3>
                                                    <div className="prism-sub-meta">
                                                        <span className="prism-company">{job.company}</span>
                                                        <div className="prism-deadline">
                                                            <FaCalendarAlt size={10} />
                                                            <span>{t('common.ends')} {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    </div>
                                                    <div className="prism-perks">
                                                        <div className="prism-perk-item">
                                                            <FaMoneyBillWave size={12} className="icon-indigo" />
                                                            <span>{job.salary_range}</span>
                                                        </div>
                                                    </div>
                                                    <p className="prism-desc">{job.description}</p>
                                                    <div className="prism-footer">
                                                        <a href={job.portal_link} target="_blank" rel="noopener noreferrer" className="prism-btn indigo">
                                                            <span>{t('roles.launchCareer')}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) return (
        <div className="full-loader">
            <FaRocket className="rocket-spinner" />
            <p>{t('roles.decodingCareerIntelligence')}</p>
        </div>
    );

    if (!roleData) return (
        <div className="error-container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h2>{t('roles.roleNotFound')}</h2>
            <p>{t('roles.roleNotFoundErrorDesc')}</p>
            <Link to="/features" className="view-link-btn" style={{ display: 'inline-block', marginTop: '1rem' }}>
                {t('roles.back')}
            </Link>
        </div>
    );

    return (
        <div className="role-access-page" style={{ paddingTop: 'var(--header-height)' }}>
            <div className="role-container">
                {/* FIXED SIDEBAR */}
                <aside className="fixed-sidebar">
                    <div className="sidebar-profile-exec">
                        <div className="profile-avatar-orb">
                            <FaUserCircle size={28} className="icon-indigo" />
                        </div>
                        <div className="profile-info-exec">
                            <span className="profile-name">{user?.username || localStorage.getItem('username') || 'Elite Member'}</span>
                            <span className="profile-rank">{user?.email || 'Career Navigator'}</span>
                        </div>
                    </div>

                    <Link to={`/domains/${roleData.domain_id}`} className="back-btn sidebar-relocated">
                        <FaArrowLeft size={11} />
                        <span>{t('roles.back')}</span>
                    </Link>


                    <nav className="side-nav">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                className={`nav-link-btn ${activeSection === s.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(s.id)}
                            >
                                {s.icon}
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* TABBED CONTENT */}
                <main className="tabbed-content">
                    {renderContent()}
                </main>
            </div>

            <style>{`
                .role-access-page {
                    min-height: 100vh;
                    background: var(--bg-primary);
                }
                .role-container {
                    display: flex;
                    flex-direction: column;
                }

                /* Top Navigation Bar (Formerly Sidebar) */
                .fixed-sidebar {
                    width: 100%;
                    position: sticky;
                    top: var(--header-height);
                    height: auto;
                    background: var(--bg-glass);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--border);
                    padding: 10px 24px;
                    z-index: 40;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    overflow-x: auto;
                }
                .fixed-sidebar::-webkit-scrollbar { height: 0px; display: none; }
                
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    background: transparent;
                    border: 1px solid var(--border);
                    text-decoration: none;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .back-btn:hover { background: var(--bg-secondary); color: var(--text-main); border-color: var(--primary); }
                
                .sidebar-profile-exec { display: none; }
                
                .cta-sidebar {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--primary);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.85rem;
                    transition: transform 0.2s;
                    white-space: nowrap;
                }
                .cta-sidebar:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
                
                .divider { 
                    width: 1px;
                    height: 24px;
                    background: var(--border);
                    margin: 0 8px;
                }
                
                .side-nav {
                    display: flex;
                    flex-direction: row;
                    gap: 8px;
                    margin-left: auto;
                    justify-content: flex-end;
                }
                
                .nav-link-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 100px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .nav-link-btn:hover { background: rgba(99, 102, 241, 0.05); color: var(--text-main); }
                .nav-link-btn.active { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

                /* Main Content Area */
                .tabbed-content {
                    flex: 1;
                    margin-left: 0;
                    padding: 2rem 2.5rem;
                    min-height: calc(100vh - var(--header-height) - 60px);
                }

                /* Common Section Layout */
                .tab-pane {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .section-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                    box-shadow: var(--shadow);
                }
                .section-card h2 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.35rem;
                    margin-bottom: 1.5rem;
                    color: var(--text-main);
                }

                /* Overview Styles */
                .overview-hero {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 1.75rem;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 1.25rem;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
                    backdrop-filter: blur(10px);
                }
                .overview-accent {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 6px;
                    background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
                }
                .role-badges {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 1rem;
                }
                .badge-modern {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .badge-modern.demand { background: rgba(99, 102, 241, 0.1); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.2); }
                .badge-modern.level { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.2); }
                .badge-modern.type { background: rgba(236, 72, 153, 0.1); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.2); }

                .title-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
                .back-circle {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: var(--bg-secondary); border: 1px solid var(--border);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--text-main); transition: 0.3s;
                }
                .back-circle:hover { background: var(--border); transform: translateX(-3px); }
                .title-row h1 { font-size: 2rem; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
                
                .description-container {
                    max-width: 800px;
                    margin-bottom: 1.75rem;
                }
                .role-desc { 
                    color: var(--text-muted); 
                    line-height: 1.8; 
                    font-size: 1.05rem; 
                    margin: 0;
                }

                .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
                .metric-box-modern { 
                    padding: 1rem; 
                    border-radius: 16px; 
                    display: flex; 
                    align-items: center; 
                    gap: 12px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .metric-box-modern:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                }
                .m-icon {
                    width: 42px; height: 42px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.15rem;
                }
                .m-icon.indigo { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
                .m-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
                .m-icon.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
                
                .m-info { display: flex; flex-direction: column; gap: 2px; }
                .m-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; }
                .m-value { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }

                /* Icons */
                .icon-pink { color: #ec4899; }
                .icon-indigo { color: #6366f1; }
                .icon-purple { color: #a855f7; }
                .icon-cyan { color: #00DFD8; }

                /* Outlook Styles */
                .outlook-card { background: var(--bg-surface); }
                .outlook-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .outlook-item { background: var(--bg-secondary); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border); }
                .outlook-item h4 { margin: 0 0 10px 0; font-size: 1rem; display: flex; align-items: center; gap: 8px; color: var(--primary); }
                .outlook-item p { margin: 0; color: var(--text-main); font-weight: 500; }

                /* Roadmap Styles */
                .roadmap-header { margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
                .roadmap-subtitle { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; display: block; margin-top: 4px; }
                .roadmap-accordion { display: flex; flex-direction: column; gap: 1rem; max-width: 100%; }
                
                .rm-phase-card { 
                    background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border);
                    border-left: 4px solid var(--phase-color); overflow: hidden; transition: all 0.3s ease;
                }
                .rm-phase-card.open { background: var(--bg-surface); box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-color: var(--phase-color); }
                
                .rm-phase-header { 
                    width: 100%; display: flex; justify-content: space-between; align-items: center; 
                    padding: 1.25rem 1.5rem; background: transparent; border: none; cursor: pointer; text-align: left;
                }
                .rm-phase-left { display: flex; align-items: center; gap: 1rem; }
                .rm-phase-num { 
                    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; 
                    justify-content: center; color: white; font-weight: 700; flex-shrink: 0;
                }
                .rm-phase-title-wrap { display: flex; flex-direction: column; gap: 2px; }
                .rm-phase-name { font-size: 1.05rem; font-weight: 700; color: var(--phase-color); }
                .rm-phase-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted); opacity: 0.8; }
                /* Cyber-Glass Prism Design System */
                .cyber-prism-card {
                    position: relative;
                    min-height: 420px;
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 2px;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    perspective: 1000px;
                    transform-style: preserve-3d;
                    overflow: visible;
                    margin-top: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }

                /* 3D Depth on Hover */
                .cyber-prism-card:hover {
                    transform: translateY(-12px) rotateX(4deg) rotateY(-2deg);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                    border-color: rgba(255,255,255,0.25);
                }

                /* Prismatic Background Layer */
                .prism-layer {
                    position: absolute; inset: 0;
                    border-radius: 24px;
                    background: conic-gradient(from 180deg at 50% 50%, 
                        transparent 0deg, 
                        rgba(0, 223, 216, 0.05) 90deg, 
                        transparent 180deg, 
                        rgba(99, 102, 241, 0.05) 270deg, 
                        transparent 360deg);
                    opacity: 0; transition: 0.8s;
                    animation: prism-rotate 10s linear infinite;
                    pointer-events: none;
                }
                .cyber-prism-card:hover .prism-layer { opacity: 1; }

                @keyframes prism-rotate {
                    from { transform: rotate(0deg) scale(1.2); }
                    to { transform: rotate(360deg) scale(1.2); }
                }

                /* Wireframe Pulse */
                .prism-wireframe {
                    position: absolute; inset: -1px;
                    border-radius: 24px;
                    padding: 1px;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude;
                    -webkit-mask-composite: xor;
                    opacity: 0.4; transition: 0.4s;
                }
                .cyber-prism-card.internship:hover .prism-wireframe { background: linear-gradient(45deg, #00DFD8, transparent, #00DFD8); opacity: 0.9; }
                .cyber-prism-card.job:hover .prism-wireframe { background: linear-gradient(45deg, #6366f1, transparent, #6366f1); opacity: 0.9; }
                .cyber-prism-card.project:hover .prism-wireframe { background: linear-gradient(45deg, #a855f7, transparent, #a855f7); opacity: 0.9; }

                .prism-content-wrap {
                    position: relative; z-index: 5;
                    height: 100%; display: flex; flex-direction: column;
                    transform-style: preserve-3d;
                }

                /* Parallax Logo */
                .parallax-logo {
                    position: absolute; top: -30px; left: 30px;
                    transform: translateZ(50px);
                    transition: 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                }
                .logo-orb {
                    width: 64px; height: 64px;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 12px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid rgba(255,255,255,0.4);
                }
                .logo-orb.purple { background: rgba(255, 255, 255, 0.98); border-color: rgba(168, 85, 247, 0.3); }
                .prism-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
                .cyber-prism-card:hover .parallax-logo { transform: translateZ(80px) scale(1.1) rotate(-5deg); }

                .prism-body { padding: 3rem 1.5rem 1.5rem; flex: 1; display: flex; flex-direction: column; transform: translateZ(30px); }
                .prism-header-row { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 1.5rem; }
                
                .prism-pill {
                    font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
                    padding: 4px 12px; border-radius: 20px; letter-spacing: 1px;
                    display: inline-flex; align-items: center; gap: 6px;
                    backdrop-filter: blur(10px);
                    transition: 0.3s;
                }
                .tag-cyan { background: rgba(0, 223, 216, 0.1); color: #00DFD8; border: 1px solid rgba(0, 223, 216, 0.3); }
                .tag-indigo { background: rgba(99, 102, 241, 0.1); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); }
                .tag-purple { background: rgba(168, 85, 247, 0.1); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
                .prism-pill.location, .prism-pill.duration { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid rgba(255, 255, 255, 0.1); }

                .prism-title { font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin: 0 0 8px 0; transform: translateZ(40px); }
                .prism-sub-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; transform: translateZ(20px); }
                .prism-company { font-size: 0.85rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; opacity: 0.7; }
                
                .prism-deadline {
                    display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 800;
                    color: #fbbf24; background: rgba(251, 191, 36, 0.08); padding: 4px 10px; border-radius: 8px;
                }

                .prism-stack { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.5rem; transform: translateZ(15px); }
                .prism-tech-pill {
                    font-size: 0.65rem; font-weight: 700; color: var(--text-muted);
                    background: rgba(255, 255, 255, 0.03); padding: 4px 10px; border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.08); transition: 0.3s;
                }
                .cyber-prism-card:hover .prism-tech-pill { border-color: rgba(255,255,255,0.2); color: var(--text-main); }

                .prism-perks { margin-bottom: 1.5rem; transform: translateZ(10px); }
                .prism-perk-item {
                    display: inline-flex; align-items: center; gap: 10px;
                    background: rgba(255,255,255,0.03); padding: 8px 16px; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.08);
                    font-size: 1rem; font-weight: 800; color: var(--text-main);
                }

                .prism-desc {
                    font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;
                    margin-bottom: 2rem; display: -webkit-box; -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical; overflow: hidden; height: 2.8rem;
                    transform: translateZ(5px);
                }

                .prism-footer { margin-top: auto; transform: translateZ(60px); }
                .prism-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 100%; padding: 1rem; border-radius: 16px;
                    font-size: 0.9rem; font-weight: 800; text-decoration: none; border: none; cursor: pointer;
                    transition: all 0.4s; text-transform: uppercase; letter-spacing: 1px;
                    position: relative; overflow: hidden; outline: none;
                }
                .prism-btn.cyan { background: #00DFD8; color: #000; box-shadow: 0 10px 30px rgba(0, 223, 216, 0.3); }
                .prism-btn.indigo { background: #6366f1; color: #fff; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3); }
                .prism-btn.purple { background: #a855f7; color: #fff; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3); }
                
                .prism-btn::before {
                    content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: 0.5s;
                }
                .prism-btn:hover::before { left: 100%; }
                .prism-btn:hover { transform: translateY(-5px) scale(1.02); filter: brightness(1.1); }
                .prism-btn.cyan:hover { box-shadow: 0 15px 40px rgba(0, 223, 216, 0.5); }
                .prism-btn.indigo:hover { box-shadow: 0 15px 40px rgba(99, 102, 241, 0.5); }
                .prism-btn.purple:hover { box-shadow: 0 15px 40px rgba(168, 85, 247, 0.5); }
                
                .rm-phase-right { display: flex; align-items: center; gap: 1.25rem; }
                .rm-duration-badge { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); background: var(--bg-card); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); }

                /* Grid Optimizations */
                .courses-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                    padding: 1rem 0;
                }
                .jobs-grid, .projects-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    padding: 1rem 0;
                }

                @media (max-width: 1400px) {
                    .courses-grid { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 1100px) {
                    .courses-grid, .projects-grid, .jobs-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .courses-grid, .jobs-grid, .projects-grid { grid-template-columns: 1fr; }
                }
                .rm-chevron { color: var(--text-muted); transition: 0.3s ease; }
                .rm-chevron.rotated { transform: rotate(180deg); }
                
                .rm-phase-body { padding: 0 1.5rem 1.5rem 1.5rem; animation: slideDown 0.3s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                
                .rm-phase-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem; }
                
                .rm-section { margin-bottom: 1.5rem; }
                .rm-section-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px; }
                .rm-section-label svg { color: var(--phase-color); }
                
                .rm-skills-row { display: flex; flex-wrap: wrap; gap: 8px; }
                .rm-skill-pill { font-size: 0.8rem; font-weight: 600; padding: 5px 12px; border-radius: 8px; background: transparent; border: 1px solid; }
                .rm-skill-pill.clickable { cursor: pointer; text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; }
                .rm-skill-pill.clickable:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); border-color: currentColor !important; }
                
                .rm-learn-link { margin-top: 0.75rem; display: inline-flex; align-items: center; gap: 6px; color: #6366f1; font-size: 0.75rem; font-weight: 600; text-decoration: none; transition: gap 0.2s; }
                .rm-learn-link:hover { gap: 10px; text-decoration: underline; }
                
                .rm-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .rm-item-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .rm-item-card { background: var(--bg-secondary); padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
                .rm-item-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
                .rm-item-name { font-size: 0.9rem; font-weight: 700; color: var(--text-main); line-height: 1.4; }
                .rm-platform-tag { font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(99, 102, 241, 0.1); color: #6366f1; border: 1px solid rgba(99, 102, 241, 0.1); }
                .rm-portfolio-tag { font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
                .rm-portfolio-tag.pv-low { background: rgba(100, 116, 139, 0.1); color: #64748b; }
                .rm-portfolio-tag.pv-medium { background: rgba(26, 50, 99, 0.1); color: #1A3263; }
                .rm-portfolio-tag.pv-high { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .rm-portfolio-tag.pv-very-high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .rm-portfolio-tag.pv-essential { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                
                .rm-item-meta { display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
                
                .rm-internship-block { background: rgba(26, 50, 99, 0.05); padding: 1.25rem; border-radius: 12px; border: 1px dashed #1A3263; }
                .rm-intern-content { font-size: 0.9rem; color: var(--text-main); line-height: 1.6; }
                .rm-intern-row { margin-bottom: 4px; }
                .rm-intern-row strong { font-weight: 700; color: #1A3263; margin-right: 6px; }
                
                .roadmap-skeleton { display: flex; flex-direction: column; gap: 1rem; }
                .skeleton-phase { height: 80px; border-radius: 16px; }

                /* Tab Header & Controls */
                .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .controls { display: flex; gap: 1rem; }
                .controls select {
                    background: rgba(255, 255, 255, 0.05); color: var(--text-main); border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 8px 12px; border-radius: 10px; font-size: 0.9rem; outline: none; backdrop-filter: blur(10px);
                }
                .controls select option { background: #0b0f19; color: white; }
                .search-box {
                    display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: 10px; backdrop-filter: blur(10px);
                }
                .search-box input { background: transparent; border: none; color: var(--text-main); outline: none; width: 180px; }

                .tab-subtitle {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin: 0;
                    font-weight: 500;
                }

                .premium-select, .premium-search {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: var(--text-main) !important;
                    padding: 8px 16px !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .premium-select:hover {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
                }



                .premium-search:focus-within {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
                }

                .course-card-ui, .project-card-ui {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                .course-card-ui:hover, .project-card-ui:hover {
                    transform: translateY(-8px);
                    border-color: rgba(99, 102, 241, 0.5);
                    box-shadow: 0 20px 45px rgba(99, 102, 241, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .c-image-wrap { position: relative; height: 160px; overflow: hidden; background: #1e293b; }
                .course-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; transition: 0.5s; }
                .course-card-ui:hover .course-thumb { transform: scale(1.1); opacity: 1; }
                .c-overlay { position: absolute; bottom: 10px; left: 10px; }
                
                .c-content, .p-content { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
                .c-label-row, .p-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
                .free-badge { background: #1A3263; color: white; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
                
                .diff-tag { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 6px; text-transform: uppercase; }
                .diff-tag.Beginner { background: rgba(26, 50, 99, 0.1); color: #1A3263; }
                .diff-tag.Intermediate { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .diff-tag.Advanced { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .course-card-ui h4, .project-card-ui h4 { margin: 0 0 10px 0; font-size: 1.05rem; line-height: 1.5; font-weight: 700; color: var(--text-main); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3.15rem; }
                .c-meta, .p-duration { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
                
                .c-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); }
                .rating { display: flex; align-items: center; gap: 6px; color: #f59e0b; font-weight: 700; font-size: 0.85rem; }
                .view-link-btn { background: var(--primary); color: white; padding: 6px 14px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: 0.2s; }
                .view-link-btn:hover { filter: brightness(1.1); }
                
                /* ELITE HOLOGRAPHIC PROJECT CARDS */
                .project-card-ui {
                    position: relative;
                    background: var(--bg-glass);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 28px;
                    padding: 2rem;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }

                [data-theme='dark'] .project-card-ui {
                    background: rgba(30, 41, 59, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .project-card-ui::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 100%;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent 60%);
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                }

                .project-card-ui:hover {
                    transform: translateY(-12px) scale(1.02);
                    border-color: var(--primary);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15), 0 0 20px rgba(99, 102, 241, 0.2);
                }

                .project-card-ui:hover::before {
                    opacity: 1;
                }

                .p-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .diff-tag-premium {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 100px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .diff-tag-premium.beginner { color: #00DFD8; background: rgba(0, 223, 216, 0.1); border: 1px solid rgba(0, 223, 216, 0.2); }
                .diff-tag-premium.intermediate { color: #6366f1; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); }
                .diff-tag-premium.advanced { color: #ec4899; background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.2); }

                .p-duration-elite {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .project-card-ui h4 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin: 0;
                    line-height: 1.3;
                    letter-spacing: -0.01em;
                }

                .project-description-elite {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .stack-row-premium {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: auto;
                }

                .stack-pill-premium {
                    padding: 5px 12px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: rgba(0, 0, 0, 0.03);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                }

                [data-theme='dark'] .stack-pill-premium {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .project-card-ui:hover .stack-pill-premium {
                    color: var(--text-main);
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.05);
                }

                /* Job Styles */
                .filter-tabs { display: flex; background: var(--bg-secondary); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
                .filter-tabs button {
                    background: transparent; border: none; color: var(--text-muted); padding: 8px 18px;
                    border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: 0.2s;
                }
                .filter-tabs button.active { background: var(--primary); color: white; box-shadow: var(--shadow); }
                .jobs-list { display: flex; flex-direction: column; gap: 1rem; }
                .job-card-ui {
                    background: var(--bg-secondary); padding: 1.25rem 1.5rem; border-radius: 16px;
                    border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;
                }
                .j-main h4 { margin: 0 0 4px 0; font-size: 1.1rem; }
                .j-main p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
                .j-side { display: flex; align-items: center; gap: 2rem; }
                .j-salary { font-weight: 700; color: #1A3263; font-size: 1.05rem; }
                .apply-btn {
                    padding: 10px 20px; background: var(--primary); color: white;
                    border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.9rem;
                    transition: 0.2s;
                }
                .apply-btn:hover { box-shadow: 0 0 15px var(--primary-glow); }

                /* Guidance */
                .guidance-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .guidance-card { background: var(--bg-secondary); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border); }
                .guidance-card h5 { margin: 0 0 1rem 0; font-size: 1.05rem; color: var(--primary); display: flex; align-items: center; gap: 10px; }
                .guidance-card ul { padding-left: 1.25rem; }
                .guidance-card li { margin-bottom: 8px; color: var(--text-muted); line-height: 1.5; font-size: 0.95rem; }

                /* Premium Overview Styles */
                .premium-hero-strategic {
                    padding: 3rem 2rem;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                .premium-hero-strategic::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent);
                    pointer-events: none;
                }
                .premium-label-top {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 2px;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                }
                .premium-headline {
                    font-size: 2.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    color: var(--text-main);
                    margin-bottom: 1.5rem;
                    letter-spacing: -1px;
                }
                .premium-summary-exec {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                    max-width: 800px;
                    font-weight: 500;
                }

                .premium-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }
                .premium-metric-card {
                    background: var(--bg-secondary);
                    backdrop-filter: blur(10px);
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .p-m-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .p-m-value { font-size: 1.4rem; font-weight: 800; color: var(--text-main); }
                .p-m-detail { font-size: 0.8rem; color: #1A3263; font-weight: 600; }

                .premium-section-title {
                    margin: 2.5rem 0 1.5rem 0;
                    padding-left: 0.5rem;
                    border-left: 3px solid var(--primary);
                }
                .premium-section-title.no-pad { margin: 1rem 0; }
                .premium-section-title h3 {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin: 0;
                    letter-spacing: 1px;
                }
                .premium-section-title .sub {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .premium-execution-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 2.5rem;
                }
                .premium-exec-card {
                    background: var(--bg-secondary);
                    padding: 1.75rem;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                }
                .premium-exec-card h4 {
                    font-size: 1rem;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 1.25rem;
                }
                .premium-exec-card ul {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .premium-exec-card li {
                    font-size: 0.9rem;
                    color: var(--text-main);
                    padding-left: 1rem;
                    position: relative;
                }
                .premium-exec-card li::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 9px;
                    width: 4px; height: 4px;
                    background: var(--primary);
                    border-radius: 50%;
                }
                .premium-exec-card .relevance {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    line-height: 1.4;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border);
                }

                .premium-skills-card {
                    background: var(--bg-secondary);
                    padding: 2rem;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .skill-row-exec {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
                .skill-row-exec label {
                    min-width: 180px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .tag-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .tag-exec {
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 4px 12px;
                    border-radius: 6px;
                    border: 1px solid;
                }
                .tag-exec.core { background: rgba(99, 102, 241, 0.05); color: #6366f1; border-color: rgba(99, 102, 241, 0.1); }
                .tag-exec.infra { background: rgba(168, 85, 247, 0.05); color: #a855f7; border-color: rgba(168, 85, 247, 0.1); }
                .tag-exec.strategic { background: rgba(0, 223, 216, 0.05); color: #00DFD8; border-color: rgba(0, 223, 216, 0.1); }

                .premium-two-col-layout {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                .industry-list-exec {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .industry-list-exec.horizontal {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .industry-item-exec {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0.75rem 1.25rem;
                    background: var(--bg-secondary);
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                }
                .industry-item-exec:hover {
                    background: rgba(99, 102, 241, 0.05);
                    border-color: rgba(99, 102, 241, 0.2);
                    transform: translateY(-2px);
                }
                .industry-item-exec svg { color: #1A3263; }

                .premium-outlook-card {
                    padding: 2rem;
                    background: var(--bg-secondary);
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .outlook-row label {
                    display: block;
                    font-size: 0.65rem;
                    letter-spacing: 0.15em;
                    color: #6366f1;
                    margin-bottom: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .outlook-row p {
                    margin: 0;
                    font-size: 1rem;
                    line-height: 1.7;
                    color: var(--text-main);
                    max-width: 800px;
                }

                /* Career Ladder Styles */
                .premium-ladder-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    margin-bottom: 2rem;
                }
                .ladder-step-exec {
                    display: flex;
                    gap: 1.5rem;
                }
                .step-marker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 20px;
                }
                .step-marker .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #6366f1;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
                    z-index: 2;
                }
                .step-marker .line {
                    width: 2px;
                    flex-grow: 1;
                    background: rgba(99, 102, 241, 0.2);
                    margin: 4px 0;
                }
                .step-content {
                    flex-grow: 1;
                    padding-bottom: 0.5rem;
                }
                .step-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.25rem;
                }
                .step-header h4 {
                    margin: 0;
                    font-size: 1rem;
                    color: var(--text-main);
                    font-weight: 600;
                }
                .step-header .years {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    background: var(--bg-card);
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .step-salary {
                    font-size: 0.9rem;
                    color: #1A3263;
                    font-weight: 500;
                }

                /* Outlook Card Styles */
                .premium-outlook-card {
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .outlook-row label {
                    display: block;
                    font-size: 0.65rem;
                    letter-spacing: 0.1em;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }
                .outlook-row p {
                    margin: 0;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.85);
                }

                .career-ladder-exec { }
                /* Shimmer Skeleton */
                .full-loader {
                    height: 100vh; display: flex; flex-direction: column; justify-content: center;
                    align-items: center; background: var(--bg-primary); color: var(--text-main);
                }
                .rocket-spinner { font-size: 4rem; color: var(--primary); animation: rocketMove 2s infinite ease-in-out; margin-bottom: 2rem; }
                @keyframes rocketMove { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-30px) rotate(5deg); } }

                .shimmer {
                    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border) 50%, var(--bg-secondary) 75%);
                    background-size: 200% 100%; animation: shimmerAnim 1.5s infinite;
                }
                @keyframes shimmerAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                .skeleton-row { height: 120px; border-radius: 12px; margin-bottom: 1rem; }
                .skeleton-card { height: 200px; border-radius: 16px; }
                .skeleton-row-lg { height: 80px; border-radius: 16px; margin-bottom: 1rem; }


                /* ELITE AI STRATEGY CONFIGURATION PANEL - REDESIGNED */
                .ai-strategy-panel {
                    background: var(--bg-glass);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 32px;
                    margin-bottom: 3.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                [data-theme='dark'] .ai-strategy-panel {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                }

                .panel-header {
                    margin-bottom: 2.5rem;
                }

                .panel-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.025em;
                }

                .panel-subtext {
                    font-size: 1rem;
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }

                /* STRATEGY SUMMARY SECTION */
                .strategy-summary {
                    margin-bottom: 2.5rem;
                }

                .score-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 0.75rem;
                }

                .score-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .score-value {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .progress-container {
                    width: 100%;
                    height: 8px;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 100px;
                    overflow: hidden;
                    margin-bottom: 1.25rem;
                }

                [data-theme='dark'] .progress-container {
                    background: rgba(255, 255, 255, 0.05);
                }

                .progress-bar {
                    height: 100%;
                    border-radius: 100px;
                    background: linear-gradient(90deg, var(--primary), var(--accent));
                    width: 0%;
                    animation: progressLoad 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }

                @keyframes progressLoad {
                    from { width: 0%; }
                    to { width: 82%; }
                }

                .premium-badges {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .premium-badge {
                    padding: 6px 14px;
                    border-radius: 100px;
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.1);
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .premium-badge.efficiency { color: #1A3263; background: rgba(26, 50, 99, 0.1); border-color: rgba(26, 50, 99, 0.1); }
                .premium-badge.coverage { color: #6366f1; background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.1); }
                .premium-badge.alignment { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.1); }

                /* RESPONSIVE GRID LAYOUT */
                .strategy-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                @media (max-width: 1024px) {
                    .strategy-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .strategy-grid { grid-template-columns: 1fr; }
                    .ai-strategy-panel { padding: 20px; }
                }

                .control-block {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .block-label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-muted);
                }

                /* PREMIUM TOGGLE STYLE */
                .toggle-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .toggle-btn {
                    padding: 10px 16px;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border: 1px solid var(--border);
                    background: var(--bg-secondary);
                    color: var(--text-muted);
                }

                [data-theme='light'] .toggle-btn {
                    background: #ffffff;
                }

                .toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border-color: var(--primary);
                    color: var(--text-main);
                }

                .toggle-btn.active {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 15px var(--primary-glow);
                    transform: translateY(-2px);
                }

                /* CTA BUTTON */
                .panel-footer {
                    display: flex;
                    justify-content: center;
                    margin-top: 3rem;
                }

                .generate-roadmap-btn {
                    padding: 18px 48px;
                    border-radius: 100px;
                    font-size: 1.1rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px var(--primary-glow);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .generate-roadmap-btn:hover:not(:disabled) {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 35px var(--primary-glow);
                    filter: brightness(1.1);
                }

                .generate-roadmap-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-icon {
                    font-size: 1.25rem;
                }

                .section-divider {
                    height: 1px;
                    background: var(--border);
                    margin: 4rem 0;
                }

                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }

                /* REFINED INTERNSHIP CARDS (ELITE) */
                .internship-card-elite {
                    background: var(--bg-secondary);
                    border-radius: 24px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    animation: cardFadeIn 0.6s ease-out backwards;
                }

                .internship-card-elite:hover {
                    transform: translateY(-8px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .card-top {
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%);
                }

                .company-logo-wrap {
                    width: 64px;
                    height: 64px;
                    background: white;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .company-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .card-type-overlay .type-tag {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                    padding: 4px 12px;
                    border-radius: 100px;
                }

                .card-body-elite {
                    padding: 0 24px 24px 24px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .company-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .company-name {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text-muted);
                }

                .location-info {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .internship-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin-bottom: 12px;
                    line-height: 1.3;
                    height: 3.2rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .stipend-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .stipend-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--success);
                }

                .description-text {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 24px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    flex: 1;
                }

                .card-footer-elite {
                    margin-top: auto;
                }

                .apply-now-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px;
                    background: linear-gradient(135deg, var(--primary), #4f46e5);
                    color: white;
                    border-radius: 16px;
                    font-weight: 700;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
                }

                .apply-now-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
                }

                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 992px) {
                    .tabbed-content { margin-left: 0; padding: 1rem; }
                    .outlook-grid { grid-template-columns: 1fr; }
                    .title-row h1 { font-size: 1.5rem; }
                    .premium-two-col-layout { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .panel-header { flex-direction: column; }
                    .ai-strategy-panel { padding: 1.5rem; }
                    .intelligence-score-card { width: 100%; }
                    
                    .premium-headline { font-size: 2rem; }
                    .premium-metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
                    .premium-execution-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .skill-row-exec { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
                    .tag-group { margin-top: 4px; }

                    .tab-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .controls { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
                    .search-box, .premium-search { width: 100%; box-sizing: border-box; }
                    .search-box input { width: 100%; }
                    .premium-select, select { width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 12px; }
                }

                @media (max-width: 480px) {
                    .premium-headline { font-size: 1.6rem; word-break: break-word; }
                    .premium-hero-strategic { padding: 2rem 1.25rem; margin-bottom: 1.5rem; }
                    .premium-metrics-grid { grid-template-columns: 1fr; }
                    .premium-skills-card { padding: 1.25rem; }
                    .premium-exec-card { padding: 1.25rem; }
                    .premium-outlook-card { padding: 1.25rem; gap: 1rem; }
                }
            `}</style>
        </div>
    );
};


// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("RoleAccess Crash:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
                    <h2>Something went wrong in Role Access.</h2>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ef4444' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                    <Link to="/features" style={{ display: 'block', marginTop: '1rem', color: '#6366f1' }}>Back to Roles</Link>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function RoleAccessWithBoundary() {
    return (
        <ErrorBoundary>
            <RoleAccess />
        </ErrorBoundary>
    );
}


import React, { useState, useEffect } from 'react';
import {
    FaBookOpen, FaMicrophone, FaRobot, FaUserTie,
    FaArrowLeft, FaPlayCircle, FaCheckCircle, FaExclamationCircle,
    FaChartLine, FaLightbulb, FaVolumeUp, FaVideo, FaFilePdf, FaChalkboardTeacher, FaGamepad, FaDownload, FaSearch, FaExternalLinkAlt,
    FaClock, FaTrophy, FaRedo, FaLink
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CommunicationIntelligenceLab.css';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const CommunicationIntelligenceLab = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // AI Chat States
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [currentRole, setCurrentRole] = useState('hr'); // for interview

    // AI Speaking States
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState('');
    const [speechAnalysis, setSpeechAnalysis] = useState(null);
    const recognitionRef = React.useRef(null);
    const chatEndRef = React.useRef(null);

    // Data states
    const [grammarTopics, setGrammarTopics] = useState([]);
    const [grammarQuizzes, setGrammarQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [videos, setVideos] = useState([]);
    const [resources, setResources] = useState([]);
    const [pdfs, setPdfs] = useState([]);

    // Optional states for interactions
    const [searchQuery, setSearchQuery] = useState('');
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizScores, setQuizScores] = useState({});

    // Grammar Practice states
    const [practiceTopicSelected, setPracticeTopicSelected] = useState(null);
    const [mockTestActive, setMockTestActive] = useState(false);
    const [mockTestQuestions, setMockTestQuestions] = useState([]);
    const [mockTestAnswers, setMockTestAnswers] = useState({});
    const [mockTestSubmitted, setMockTestSubmitted] = useState(false);
    const [mockTimer, setMockTimer] = useState(600);
    const [mockLoading, setMockLoading] = useState(false);
    const mockTimerRef = React.useRef(null);

    // Section Filter States
    const [activePlatform, setActivePlatform] = useState('All');
    const [activeLevel, setActiveLevel] = useState('All');
    const [activeTopic, setActiveTopic] = useState('All');
    const [activeCat, setActiveCat] = useState('All');
    const [activePdfTopic, setActivePdfTopic] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [gRes, qRes, cRes, vRes, rRes, pRes] = await Promise.all([
                axios.get('/api/comm/grammar', config).catch(() => ({ data: [] })),
                axios.get('/api/comm/quizzes', config).catch(() => ({ data: [] })),
                axios.get('/api/comm/courses', config).catch(() => ({ data: [] })),
                axios.get('/api/comm/videos', config).catch(() => ({ data: [] })),
                axios.get('/api/comm/resources', config).catch(() => ({ data: [] })),
                axios.get('/api/comm/pdfs', config).catch(() => ({ data: [] }))
            ]);

            setGrammarTopics(gRes.data);
            setGrammarQuizzes(qRes.data);
            setCourses(cRes.data);
            setVideos(vRes.data);
            setResources(rRes.data);
            setPdfs(pRes.data);
        } catch (error) {
            console.error("Error fetching lab data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmit = (quizId, selectedOption, correctOption) => {
        setQuizAnswers(prev => ({ ...prev, [quizId]: selectedOption }));
        if (selectedOption === correctOption) {
            setQuizScores(prev => ({ ...prev, [quizId]: true }));
        } else {
            setQuizScores(prev => ({ ...prev, [quizId]: false }));
        }
    };

    // Filter helper
    const filteredContent = (items) => {
        if (!searchQuery) return items;
        return items.filter(item =>
            String(item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup active section state changes
    useEffect(() => {
        setMessages([]);
        setChatInput('');
        setSpeechAnalysis(null);
        setRecordedText('');
        setSelectedTopic(null);
        setPracticeTopicSelected(null);
        setMockTestActive(false);
        setMockTestQuestions([]);
        setMockTestAnswers({});
        setMockTestSubmitted(false);
        setMockTimer(600);
        if (mockTimerRef.current) clearInterval(mockTimerRef.current);
        if (isRecording) stopRecording();

        // Reset filter states
        setActivePlatform('All');
        setActiveLevel('All');
        setActiveTopic('All');
        setActiveCat('All');
        setActivePdfTopic('All');
    }, [activeSection]);

    // Mock test timer
    useEffect(() => {
        if (mockTestActive && !mockTestSubmitted) {
            mockTimerRef.current = setInterval(() => {
                setMockTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(mockTimerRef.current);
                        handleMockSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(mockTimerRef.current);
    }, [mockTestActive, mockTestSubmitted]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const fetchTopicQuiz = async (topicId) => {
        setMockLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/comm/topic-quiz?topicId=${topicId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMockTestQuestions(res.data);
            setMockTestAnswers({});
            setMockTestSubmitted(false);
            setMockTimer(600);
            setMockTestActive(true);
        } catch (err) {
            console.error('Failed to fetch quiz', err);
        } finally {
            setMockLoading(false);
        }
    };

    const handleMockAnswer = (qId, optIdx) => {
        if (mockTestSubmitted) return;
        setMockTestAnswers(prev => ({ ...prev, [qId]: optIdx }));
    };

    const handleMockSubmit = () => {
        clearInterval(mockTimerRef.current);
        setMockTestSubmitted(true);
        setMockTestActive(false);
    };

    const getMockScore = () => {
        return mockTestQuestions.reduce((acc, q) => {
            return acc + (mockTestAnswers[q.id] === q.answer ? 1 : 0);
        }, 0);
    };

    // Speech Recognition Setup
   useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setRecordedText(transcript);
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };
        recognitionRef.current.onerror = (event) => {
            console.log('Speech error:', event.error);
            setIsRecording(false);
        };
    }
}, []);
   
   const isNative = Capacitor.isNativePlatform();

const startRecording = async () => {
    setIsRecording(true);
    setRecordedText('');
    setSpeechAnalysis(null);

    if (isNative) {
        // APK — Capacitor plugin
        await SpeechRecognition.requestPermission();
        await SpeechRecognition.start({
            language: 'en-US',
            partialResults: true,
            popup: false,
        });
        SpeechRecognition.addListener('partialResults', (data) => {
            setRecordedText(data.matches[0] || '');
        });
    } else {
        // Browser — Web Speech API
        if (recognitionRef.current && !isRecording) {
            try {
                recognitionRef.current.abort();
                setTimeout(() => recognitionRef.current.start(), 200);
            } catch (e) {
                setIsRecording(false);
            }
        }
    }
};

const stopRecording = async () => {
    setIsRecording(false);
    if (isNative) {
        await SpeechRecognition.stop();
    } else {
        recognitionRef.current?.stop();
    }
    analyzeSpeech(recordedText);
};


    const analyzeSpeech = async (text) => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/comm/analyze-speech', { text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSpeechAnalysis(res.data);
        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e, aiType) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;
        const msg = chatInput;
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setChatInput('');
        setChatLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = { message: msg, aiType, history: messages.slice(-6) };
            if (aiType === 'interview') payload.interviewRole = currentRole;

            const res = await axios.post('/api/comm/ai-chat', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const sections = [
        { id: 'grammar-learn', title: 'Grammar Learning', icon: <FaChalkboardTeacher />, color: '#6366f1', desc: 'Complete English grammar modules from basics to advanced.' },
        { id: 'grammar-practice', title: 'Grammar Practice', icon: <FaGamepad />, color: '#1A3263', desc: 'Interactive quizzes for all grammar topics.' },
        { id: 'courses', title: 'Communication Courses', icon: <FaBookOpen />, color: '#f59e0b', desc: 'Curated courses from Harvard, Coursera, and more.' },
        { id: 'youtube', title: 'YouTube Learning Hub', icon: <FaVideo />, color: '#ef4444', desc: '200+ selected video lessons on professional speaking.' },
        { id: 'resources', title: 'Resource Library', icon: <FaLightbulb />, color: '#8b5cf6', desc: 'Guides and tips for communication improvement.' },
        { id: 'pdf', title: 'PDF Materials', icon: <FaFilePdf />, color: '#ec4899', desc: 'Downloadable worksheets and professional guides.' },
        { id: 'speaking', title: 'AI Speaking Practice', icon: <FaMicrophone />, color: '#06b6d4', desc: 'Real-time fluency and pronunciation analysis.' },
        { id: 'chat', title: 'AI Conversation Practice', icon: <FaRobot />, color: '#14b8a6', desc: 'Natural dialogue practice with grammar correction.' },
        { id: 'interview', title: 'Interview Communication', icon: <FaUserTie />, color: '#3b82f6', desc: 'Role-play HR and technical interviews.' },
        { id: 'tutor', title: 'Live AI Tutor', icon: <FaUserTie />, color: '#d4af37', desc: 'Real-time mentoring, grammar correction, and coaching.' },
        { id: 'tracker', title: 'Progress Tracker', icon: <FaChartLine />, color: '#0ea5e9', desc: 'Analyze your vocabulary, grammar, and fluency growth.' },
    ];

    return (
        <div className="comm-lab-container">
            <div className="comm-bg-elements">
                <div className="comm-blob blob-gold" />
                <div className="comm-blob blob-purple" />
            </div>

            {!activeSection ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <header className="comm-hero">
                        <div className="comm-badge"><FaLightbulb /><span>Premium Intelligence</span></div>
                        <h1>Communication <span style={{ color: 'var(--primary)' }}>Intelligence Lab</span></h1>
                        <p>Master English Communication with Structured Learning, Real Resources, and AI Practice.</p>
                    </header>

                    <div className="comm-grid">
                        {sections.map((sec, idx) => (
                            <motion.div
                                key={sec.id}
                                className="comm-card-premium"
                                onClick={() => setActiveSection(sec.id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="card-icon-wrapper" style={{ background: `${sec.color}15`, color: sec.color }}>{sec.icon}</div>
                                <div className="card-content">
                                    <h3>{sec.title}</h3>
                                    <p>{sec.desc}</p>
                                </div>
                                <div className="card-footer-elite"><FaPlayCircle /></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className="section-view">
                    <div className="section-header-row">
                        <button className="back-btn-lab" onClick={() => { setActiveSection(null); setSearchQuery(''); }}>
                            <FaArrowLeft /> Dashboard
                        </button>
                        {['courses', 'youtube', 'resources', 'pdf'].includes(activeSection) && (
                            <div className="search-bar-modern">
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="Search in this module..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {activeSection === 'grammar-learn' && (
                                <div className="grammar-learning-view">
                                    {!selectedTopic ? (
                                        <>
                                            <h2 className="section-title-premium">Grammar Mastery</h2>
                                            <div className="grammar-grid">
                                                {grammarTopics.map(topic => (
                                                    <div
                                                        key={topic.id}
                                                        className="grammar-card interactive"
                                                        onClick={() => {
                                                            setSelectedTopic(topic);
                                                            setSelectedSubtopicIndex(0);
                                                        }}
                                                    >
                                                        <h3>{topic.title}</h3>
                                                        <p className="g-desc">{topic.description}</p>
                                                        <div className="read-more-btn">Explore Topic <FaArrowLeft style={{ transform: 'rotate(180deg)' }} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w3-lesson-view">
                                            {/* Subtopic Sidebar */}
                                            <div className="w3-sidebar">
                                                <div className="w3-sidebar-header">
                                                    <button className="w3-back-btn" onClick={() => setSelectedTopic(null)}>
                                                        <FaArrowLeft /> Back to Topics
                                                    </button>
                                                    <h3 className="w3-topic-title">{selectedTopic.title}</h3>
                                                </div>
                                                <div className="w3-sidebar-menu">
                                                    {selectedTopic.subtopics?.map((sub, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={`w3-nav-item ${selectedSubtopicIndex === idx ? 'active' : ''}`}
                                                            onClick={() => setSelectedSubtopicIndex(idx)}
                                                        >
                                                            {sub.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Main Content Area */}
                                            <div className="w3-main-content">
                                                {selectedTopic.subtopics && selectedTopic.subtopics[selectedSubtopicIndex] ? (
                                                    <div className="w3-content-inner">
                                                        <h1 className="w3-lesson-title">{selectedTopic.subtopics[selectedSubtopicIndex].title}</h1>

                                                        {selectedTopic.subtopics[selectedSubtopicIndex].structure && (
                                                            <div className="w3-syntax-box">
                                                                <h4>Structure / Syntax</h4>
                                                                <div className="w3-code-block">
                                                                    {selectedTopic.subtopics[selectedSubtopicIndex].structure}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="w3-explanation">
                                                            <p>{selectedTopic.subtopics[selectedSubtopicIndex].explanation}</p>
                                                        </div>

                                                        {selectedTopic.subtopics[selectedSubtopicIndex].examples && selectedTopic.subtopics[selectedSubtopicIndex].examples.length > 0 && (
                                                            <div className="w3-example-box">
                                                                <h4>Examples</h4>
                                                                <ul className="w3-example-list">
                                                                    {selectedTopic.subtopics[selectedSubtopicIndex].examples.map((ex, j) => (
                                                                        <li key={j}>{ex}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Bottom Navigation */}
                                                        <div className="w3-bottom-nav">
                                                            <button
                                                                className="w3-btn prev-btn"
                                                                disabled={selectedSubtopicIndex === 0}
                                                                onClick={() => setSelectedSubtopicIndex(prev => prev - 1)}
                                                            >
                                                                <FaArrowLeft /> Previous
                                                            </button>
                                                            <button
                                                                className="w3-btn next-btn"
                                                                disabled={selectedSubtopicIndex === (selectedTopic.subtopics.length - 1)}
                                                                onClick={() => setSelectedSubtopicIndex(prev => prev + 1)}
                                                            >
                                                                Next <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                                                            </button>
                                                        </div>

                                                        {/* Practice & Resources at the very bottom */}
                                                        {(selectedTopic.practiceLink || selectedTopic.resourceLink) && (
                                                            <div className="w3-extra-resources">
                                                                <h4>Extra Mastery Materials</h4>
                                                                <div className="practice-resource-links">
                                                                    {selectedTopic.practiceLink && (
                                                                        <a href={selectedTopic.practiceLink} target="_blank" rel="noreferrer" className="practice-btn-lab">
                                                                            <FaGamepad /> Practice Topic
                                                                        </a>
                                                                    )}
                                                                    {selectedTopic.resourceLink && (
                                                                        <a href={selectedTopic.resourceLink} target="_blank" rel="noreferrer" className="resource-btn-lab">
                                                                            <FaExternalLinkAlt /> View Extra Resources
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w3-empty-content">No content available for this lesson.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeSection === 'grammar-practice' && (
                                <div className="grammar-practice-view">
                                    {/* Step 1 — Topic Picker */}
                                    {!practiceTopicSelected && !mockTestActive && !mockTestSubmitted && (
                                        <>
                                            <h2 className="section-title-premium">Grammar Practice</h2>
                                            <p className="practice-subtitle">Choose a grammar topic to practice with real exercises or take an advanced timed mock test.</p>
                                            <div className="practice-topic-grid">
                                                {grammarTopics.map((topic, idx) => (
                                                    <motion.div
                                                        key={topic.id}
                                                        className="practice-topic-card"
                                                        onClick={() => setPracticeTopicSelected(topic)}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        whileHover={{ scale: 1.03 }}
                                                    >
                                                        <div className="ptc-number">#{idx + 1}</div>
                                                        <h4>{topic.title}</h4>
                                                        <p>{topic.description}</p>
                                                        <div className="ptc-footer">
                                                            {topic.practiceLink && <span className="ptc-badge practice"><FaLink /> Practice</span>}
                                                            <span className="ptc-badge quiz"><FaGamepad /> Quiz</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Step 2 — Topic Detail: Practice Links + Start Quiz */}
                                    {practiceTopicSelected && !mockTestActive && !mockTestSubmitted && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="practice-detail-view">
                                            <button className="back-btn-lab" onClick={() => setPracticeTopicSelected(null)}>
                                                <FaArrowLeft /> All Topics
                                            </button>
                                            <h2 className="section-title-premium" style={{ marginTop: '1rem' }}>{practiceTopicSelected.title}</h2>
                                            <p className="practice-subtitle">{practiceTopicSelected.description}</p>

                                            {/* External Practice Links */}
                                            <div className="practice-links-section">
                                                <h3><FaLink /> Practice on These Sites</h3>
                                                <div className="ext-links-grid">
                                                    {practiceTopicSelected.practiceLink && (
                                                        <a href={practiceTopicSelected.practiceLink} target="_blank" rel="noreferrer" className="ext-link-card navy">
                                                            <div className="elc-icon"><FaGamepad /></div>
                                                            <div>
                                                                <div className="elc-title">Interactive Exercises</div>
                                                                <div className="elc-site">{new URL(practiceTopicSelected.practiceLink).hostname.replace('www.', '')}</div>
                                                            </div>
                                                            <FaExternalLinkAlt className="elc-arrow" />
                                                        </a>
                                                    )}
                                                    {practiceTopicSelected.resourceLink && (
                                                        <a href={practiceTopicSelected.resourceLink} target="_blank" rel="noreferrer" className="ext-link-card blue">
                                                            <div className="elc-icon"><FaBookOpen /></div>
                                                            <div>
                                                                <div className="elc-title">Learn & Reference</div>
                                                                <div className="elc-site">{new URL(practiceTopicSelected.resourceLink).hostname.replace('www.', '')}</div>
                                                            </div>
                                                            <FaExternalLinkAlt className="elc-arrow" />
                                                        </a>
                                                    )}
                                                    <a href={`https://www.perfect-english-grammar.com/`} target="_blank" rel="noreferrer" className="ext-link-card purple">
                                                        <div className="elc-icon"><FaChalkboardTeacher /></div>
                                                        <div>
                                                            <div className="elc-title">Perfect English Grammar</div>
                                                            <div className="elc-site">perfect-english-grammar.com</div>
                                                        </div>
                                                        <FaExternalLinkAlt className="elc-arrow" />
                                                    </a>
                                                    <a href={`https://learnenglish.britishcouncil.org/grammar`} target="_blank" rel="noreferrer" className="ext-link-card orange">
                                                        <div className="elc-icon"><FaBookOpen /></div>
                                                        <div>
                                                            <div className="elc-title">British Council Grammar</div>
                                                            <div className="elc-site">britishcouncil.org</div>
                                                        </div>
                                                        <FaExternalLinkAlt className="elc-arrow" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Start Mock Test */}
                                            <div className="mock-cta-section">
                                                <div className="mock-cta-info">
                                                    <FaTrophy className="mock-cta-icon" />
                                                    <div>
                                                        <h3>Advanced Mock Test</h3>
                                                        <p>10 advanced questions · 10 minute timer · Instant score & explanations</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="start-mock-btn"
                                                    onClick={() => fetchTopicQuiz(practiceTopicSelected.id)}
                                                    disabled={mockLoading}
                                                >
                                                    {mockLoading ? 'Loading...' : <><FaGamepad /> Start Mock Test</>}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3 — Mock Test */}
                                    {mockTestActive && !mockTestSubmitted && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mock-test-view">
                                            <div className="mock-test-header">
                                                <div className="mock-test-title">
                                                    <FaGamepad />
                                                    <span>{practiceTopicSelected?.title} — Mock Test</span>
                                                </div>
                                                <div className={`mock-timer ${mockTimer < 60 ? 'danger' : ''}`}>
                                                    <FaClock /> {formatTime(mockTimer)}
                                                </div>
                                            </div>
                                            <div className="mock-progress-bar">
                                                <div className="mock-progress-fill" style={{ width: `${(Object.keys(mockTestAnswers).length / mockTestQuestions.length) * 100}%` }} />
                                            </div>
                                            <p className="mock-progress-text">{Object.keys(mockTestAnswers).length} / {mockTestQuestions.length} answered</p>

                                            <div className="mock-questions-list">
                                                {mockTestQuestions.map((q, idx) => (
                                                    <div key={q.id} className="mock-question-card">
                                                        <div className="mq-number">Q{idx + 1}</div>
                                                        <p className="mq-text">{q.question}</p>
                                                        <div className="mq-options">
                                                            {q.options.map((opt, i) => (
                                                                <button
                                                                    key={i}
                                                                    className={`mq-opt ${mockTestAnswers[q.id] === i ? 'selected' : ''}`}
                                                                    onClick={() => handleMockAnswer(q.id, i)}
                                                                >
                                                                    <span className="mq-opt-letter">{String.fromCharCode(65 + i)}</span>
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mock-submit-row">
                                                <button className="mock-submit-btn" onClick={handleMockSubmit}>
                                                    <FaCheckCircle /> Submit Test
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 4 — Score Summary */}
                                    {mockTestSubmitted && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mock-score-view">
                                            <div className="score-badge-big">
                                                <FaTrophy />
                                                <div className="score-number">{getMockScore()} / {mockTestQuestions.length}</div>
                                                <div className="score-label">
                                                    {getMockScore() >= 8 ? '🏆 Excellent!' : getMockScore() >= 6 ? '👍 Good job!' : getMockScore() >= 4 ? '📚 Keep Practicing!' : '💪 Try Again!'}
                                                </div>
                                            </div>

                                            <div className="score-review-list">
                                                {mockTestQuestions.map((q, idx) => {
                                                    const userAns = mockTestAnswers[q.id];
                                                    const isCorrect = userAns === q.answer;
                                                    return (
                                                        <div key={q.id} className={`score-review-card ${isCorrect ? 'correct' : 'wrong'}`}>
                                                            <div className="src-header">
                                                                <span className="src-num">Q{idx + 1}</span>
                                                                {isCorrect ? <FaCheckCircle className="src-icon correct" /> : <FaExclamationCircle className="src-icon wrong" />}
                                                            </div>
                                                            <p className="src-question">{q.question}</p>
                                                            <div className="src-answers">
                                                                {userAns !== undefined && userAns !== q.answer && (
                                                                    <div className="src-your-answer">Your answer: <strong>{q.options[userAns]}</strong></div>
                                                                )}
                                                                <div className="src-correct-answer">Correct: <strong>{q.options[q.answer]}</strong></div>
                                                            </div>
                                                            <div className="src-explanation"><FaLightbulb /> {q.explanation}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="score-actions">
                                                <button className="score-retry-btn" onClick={() => fetchTopicQuiz(practiceTopicSelected.id)}>
                                                    <FaRedo /> Retry Test
                                                </button>
                                                <button className="score-back-btn" onClick={() => { setMockTestSubmitted(false); setPracticeTopicSelected(null); }}>
                                                    <FaArrowLeft /> Try Another Topic
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {activeSection === 'courses' && (() => {
                                const platforms = ['All', 'Coursera', 'Udemy', 'LinkedIn Learning', 'edX', 'Harvard Online', 'FutureLearn', 'NPTEL', 'Alison', 'Skillshare', 'Google', 'Swayam'];
                                const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
                                const platformColors = {
                                    'Coursera': '#0056D2', 'Udemy': '#a435f0', 'LinkedIn Learning': '#0077b5',
                                    'edX': '#02262B', 'Harvard Online': '#A51C30', 'FutureLearn': '#DE0072',
                                    'NPTEL': '#f57c00', 'Alison': '#5cb85c', 'Skillshare': '#00FF84',
                                    'Google': '#4285F4', 'Swayam': '#1565c0', 'Microsoft Learn': '#00BCF2',
                                };
                                const filtered = courses.filter(c => {
                                    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
                                    const matchPlatform = activePlatform === 'All' || c.platform === activePlatform;
                                    const matchLevel = activeLevel === 'All' || c.level === activeLevel;
                                    return matchSearch && matchPlatform && matchLevel;
                                });
                                const renderStars = (rating) => {
                                    const full = Math.floor(rating);
                                    return '★'.repeat(full) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
                                };
                                return (
                                    <div className="courses-premium-view">
                                        <div className="courses-hero-header">
                                            <div>
                                                <h2 className="section-title-premium">Communication Courses</h2>
                                                <p className="practice-subtitle">{filtered.length} curated courses from world's top learning platforms</p>
                                            </div>
                                        </div>

                                        {/* Platform Filter Pills */}
                                        <div className="course-filter-block">
                                            <div className="filter-label">Platform</div>
                                            <div className="platform-pills">
                                                {platforms.map(p => (
                                                    <button key={p} className={`platform-pill ${activePlatform === p ? 'active' : ''}`}
                                                        style={activePlatform === p && p !== 'All' ? { background: platformColors[p], borderColor: platformColors[p], color: '#fff' } : {}}
                                                        onClick={() => setActivePlatform(p)}>{p}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Level Filter */}
                                        <div className="course-filter-block">
                                            <div className="filter-label">Level</div>
                                            <div className="level-pills">
                                                {levels.map(lv => (
                                                    <button key={lv} className={`level-pill ${activeLevel === lv ? 'active' : ''}`} onClick={() => setActiveLevel(lv)}>{lv}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Course Cards Grid */}
                                        <div className="courses-premium-grid">
                                            {filtered.map((c, idx) => (
                                                <motion.a
                                                    key={c.id}
                                                    href={c.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="course-premium-card"
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                                                    whileHover={{ y: -5 }}
                                                    style={{ '--platform-color': platformColors[c.platform] || '#d4af37' }}
                                                >
                                                    <div className="cpc-top-bar" />
                                                    <div className="cpc-header">
                                                        <span className="cpc-platform" style={{ color: platformColors[c.platform] || '#d4af37' }}>{c.platform}</span>
                                                        <span className={`cpc-level level-${c.level.toLowerCase().replace(/\s+/g, '-')}`}>{c.level}</span>
                                                    </div>
                                                    <h4 className="cpc-title">{c.title}</h4>
                                                    <div className="cpc-category">{c.category}</div>
                                                    <div className="cpc-meta">
                                                        <span className="cpc-rating">
                                                            <span className="stars">{renderStars(c.rating)}</span>
                                                            <span className="rating-num">{c.rating}</span>
                                                        </span>
                                                        <span className="cpc-dot">·</span>
                                                        <span className="cpc-students">{c.students}</span>
                                                    </div>
                                                    <div className="cpc-footer">
                                                        <span className="cpc-duration">⏱ {c.duration}</span>
                                                        <span className="cpc-enroll">Enroll Free <FaExternalLinkAlt /></span>
                                                    </div>
                                                </motion.a>
                                            ))}
                                        </div>

                                        {filtered.length === 0 && (
                                            <div className="courses-empty">
                                                <FaSearch style={{ fontSize: '3rem', opacity: 0.3 }} />
                                                <p>No courses found. Try a different search or filter.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}


                            {activeSection === 'youtube' && (() => {
                                const topicsFilter = ['All', 'Spoken English', 'Grammar', 'Business English', 'Interview Prep', 'Soft Skills', 'Fluency', 'Pronunciation', 'Public Speaking'];
                                const filtered = videos.filter(v => {
                                    const matchSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase());
                                    const matchTopic = activeTopic === 'All' || v.topic === activeTopic;
                                    return matchSearch && matchTopic;
                                });
                                return (
                                    <div className="youtube-premium-view">
                                        <div className="section-header-flex">
                                            <h2 className="section-title-premium">YouTube Learning Hub <span className="item-count">({filtered.length})</span></h2>
                                        </div>
                                        <div className="topic-pills-row">
                                            {topicsFilter.map(t => (
                                                <button key={t} className={`topic-pill ${activeTopic === t ? 'active' : ''}`} onClick={() => setActiveTopic(t)}>{t}</button>
                                            ))}
                                        </div>
                                        <div className="video-premium-grid">
                                            {filtered.map((v, idx) => (
                                                <motion.a
                                                    key={v.id} href={v.link} target="_blank" rel="noreferrer" className="video-premium-card"
                                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                                                >
                                                    <div className="vp-thumb" style={{ backgroundImage: `url(${v.thumbnail})` }}>
                                                        <div className="vp-play-bg"><FaPlayCircle /></div>
                                                        <div className="vp-duration">{v.duration}</div>
                                                    </div>
                                                    <div className="vp-info">
                                                        <span className="vp-topic">{v.topic}</span>
                                                        <h4 className="vp-title">{v.title}</h4>
                                                        <div className="vp-footer">
                                                            <span className="vp-channel">{v.channel}</span>
                                                        </div>
                                                    </div>
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {activeSection === 'resources' && (() => {
                                const categoriesFilter = ['All', 'Grammar', 'Speaking', 'Writing', 'Listening', 'Vocabulary', 'Test Prep', 'Practice'];
                                const filtered = resources.filter(r => {
                                    const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.siteName.toLowerCase().includes(searchQuery.toLowerCase());
                                    const matchCat = activeCat === 'All' || r.category === activeCat;
                                    return matchSearch && matchCat;
                                });
                                return (
                                    <div className="resources-premium-view">
                                        <h2 className="section-title-premium">Resource Library <span className="item-count">({filtered.length})</span></h2>
                                        <div className="topic-pills-row">
                                            {categoriesFilter.map(c => (
                                                <button key={c} className={`topic-pill ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>
                                            ))}
                                        </div>
                                        <div className="resources-premium-grid">
                                            {filtered.map((r, idx) => (
                                                <motion.a
                                                    key={r.id} href={r.link} target="_blank" rel="noreferrer" className="resource-premium-card"
                                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                                                >
                                                    <div className="rp-header">
                                                        <span className="rp-category">{r.category}</span>
                                                        <span className="rp-site">{r.siteName}</span>
                                                    </div>
                                                    <h4 className="rp-title">{r.title}</h4>
                                                    <p className="rp-desc">{r.description}</p>
                                                    <div className="rp-footer">Visit Website <FaExternalLinkAlt /></div>
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {activeSection === 'pdf' && (() => {
                                const topicsPdfFilter = ['All', 'Grammar', 'Speaking', 'Writing', 'Interview', 'Exam Prep', 'Vocabulary'];
                                const filtered = pdfs.filter(p => {
                                    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
                                    const matchTopic = activePdfTopic === 'All' || p.topic === activePdfTopic;
                                    return matchSearch && matchTopic;
                                });
                                return (
                                    <div className="pdf-premium-view">
                                        <h2 className="section-title-premium">PDF Materials <span className="item-count">({filtered.length})</span></h2>
                                        <div className="topic-pills-row">
                                            {topicsPdfFilter.map(t => (
                                                <button key={t} className={`topic-pill ${activePdfTopic === t ? 'active' : ''}`} onClick={() => setActivePdfTopic(t)}>{t}</button>
                                            ))}
                                        </div>
                                        <div className="pdf-premium-grid">
                                            {filtered.map((p, idx) => (
                                                <motion.a
                                                    key={p.id} href={p.link} target="_blank" rel="noreferrer" className="pdf-premium-card"
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                                                >
                                                    <div className="pp-icon"><FaFilePdf /></div>
                                                    <div className="pp-content">
                                                        <span className="pp-topic">{p.topic}</span>
                                                        <h4 className="pp-title">{p.title}</h4>
                                                        <p className="pp-desc">{p.description}</p>
                                                    </div>
                                                    <div className="pp-download"><FaArrowDown /></div>
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}


                            {/* AI Modules */}
                            {activeSection === 'speaking' && (
                                <div className="speaking-lab-view">
                                    <h2 className="section-title-premium">AI Speaking Practice</h2>
                                    <div className="speaking-console">
                                        <div className="mic-container">
                                            <motion.div
                                                className={`mic-ring ${isRecording ? 'active' : ''}`}
                                                onClick={isRecording ? stopRecording : startRecording}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isRecording ? <FaRobot size={40} className="pulse-icon" /> : <FaMicrophone size={40} />}
                                            </motion.div>
                                            <p>{isRecording ? 'Listening... click to stop' : 'Click microphone to start speaking'}</p>
                                        </div>

                                        <div className="transcript-box">
                                            <div className="box-header"><FaVolumeUp /> Live Transcript</div>
                                            <div className="box-content">{recordedText || "Your words will appear here..."}</div>
                                        </div>

                                        {loading && isRecording === false && recordedText && (
                                            <div className="analysis-loader">Analyzing your speech patterns...</div>
                                        )}

                                        {speechAnalysis && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="analysis-results">
                                                <div className="score-cards">
                                                    <div className="s-card"><span className="label">Pronunciation</span><span className="value">{speechAnalysis.pronunciation}%</span></div>
                                                    <div className="s-card"><span className="label">Fluency</span><span className="value">{speechAnalysis.fluency}%</span></div>
                                                    <div className="s-card"><span className="label">Confidence</span><span className="value">{speechAnalysis.confidence}%</span></div>
                                                </div>
                                                <div className="feedback-box">
                                                    <h4><FaLightbulb /> AI Feedback</h4>
                                                    <p>{speechAnalysis.feedback}</p>
                                                    {speechAnalysis.grammarFixes && speechAnalysis.grammarFixes.length > 0 && (
                                                        <div className="grammar-fixes">
                                                            <strong>Corrections:</strong>
                                                            <ul>
                                                                {speechAnalysis.grammarFixes.map((fix, i) => <li key={i}>{fix}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {['chat', 'interview', 'tutor'].includes(activeSection) && (
                                <div className="ai-chat-view">
                                    <div className="ai-chat-header">
                                        <h2 className="section-title-premium m-0">{sections.find(s => s.id === activeSection)?.title}</h2>
                                        {activeSection === 'interview' && (
                                            <div className="role-selector">
                                                <button className={currentRole === 'hr' ? 'active' : ''} onClick={() => setCurrentRole('hr')}>HR Manager</button>
                                                <button className={currentRole === 'tech' ? 'active' : ''} onClick={() => setCurrentRole('tech')}>Tech Lead</button>
                                                <button className={currentRole === 'manager' ? 'active' : ''} onClick={() => setCurrentRole('manager')}>Executive</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="chat-interface">
                                        <div className="chat-messages">
                                            {messages.length === 0 && (
                                                <div className="chat-empty-state">
                                                    <FaRobot size={48} />
                                                    <h3>Ready when you are</h3>
                                                    <p>
                                                        {activeSection === 'chat' ? "Practice casual conversations, introducing yourself, or talking about hobbies." :
                                                            activeSection === 'interview' ? "Let's begin your mock interview. I will ask questions and evaluate your communication." :
                                                                "I'm your live AI tutor. I'll correct your grammar gently and suggest better professional phrasing."}
                                                    </p>
                                                </div>
                                            )}
                                            {messages.map((msg, idx) => (
                                                <div key={idx} className={`chat-message ${msg.role}`}>
                                                    <div className="msg-avatar">{msg.role === 'assistant' ? <FaRobot /> : <FaUserTie />}</div>
                                                    <div className="msg-bubble">{msg.content}</div>
                                                </div>
                                            ))}
                                            {chatLoading && (
                                                <div className="chat-message assistant">
                                                    <div className="msg-avatar"><FaRobot /></div>
                                                    <div className="msg-bubble typing"><span></span><span></span><span></span></div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <form className="chat-input-area" onSubmit={(e) => handleSendMessage(e, activeSection)}>
                                            <input
                                                type="text"
                                                placeholder="Type your response..."
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                                disabled={chatLoading}
                                            />
                                            <button type="submit" disabled={chatLoading || !chatInput.trim()}>Send</button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'tracker' && (
                                <div className="progress-tracker-view">
                                    <h2 className="section-title-premium">Learning Progress Tracker</h2>
                                    <p className="tracker-subtitle">Monitor your communication improvements over time</p>

                                    <div className="metrics-overview">
                                        <div className="metric-box">
                                            <div className="m-icon" style={{ color: '#6366f1' }}><FaChalkboardTeacher /></div>
                                            <div className="m-info">
                                                <span>Grammar Accuracy</span>
                                                <h3>85%</h3>
                                            </div>
                                        </div>
                                        <div className="metric-box">
                                            <div className="m-icon" style={{ color: '#1A3263' }}><FaMicrophone /></div>
                                            <div className="m-info">
                                                <span>Speaking Fluency</span>
                                                <h3>78%</h3>
                                            </div>
                                        </div>
                                        <div className="metric-box">
                                            <div className="m-icon" style={{ color: '#f59e0b' }}><FaBookOpen /></div>
                                            <div className="m-info">
                                                <span>Vocabulary Growth</span>
                                                <h3>+120 words</h3>
                                            </div>
                                        </div>
                                        <div className="metric-box">
                                            <div className="m-icon" style={{ color: '#ec4899' }}><FaChartLine /></div>
                                            <div className="m-info">
                                                <span>Comm. Confidence</span>
                                                <h3>92%</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="charts-container">
                                        <div className="chart-wrapper">
                                            <h3>Weekly Performance Trend</h3>
                                            <div className="mock-css-chart">
                                                <div className="bar-group">
                                                    <div className="bar" style={{ height: '40%', background: '#6366f1' }}></div>
                                                    <span>Week 1</span>
                                                </div>
                                                <div className="bar-group">
                                                    <div className="bar" style={{ height: '60%', background: '#6366f1' }}></div>
                                                    <span>Week 2</span>
                                                </div>
                                                <div className="bar-group">
                                                    <div className="bar" style={{ height: '55%', background: '#6366f1' }}></div>
                                                    <span>Week 3</span>
                                                </div>
                                                <div className="bar-group">
                                                    <div className="bar" style={{ height: '80%', background: '#6366f1' }}></div>
                                                    <span>Week 4</span>
                                                </div>
                                                <div className="bar-group">
                                                    <div className="bar" style={{ height: '85%', background: '#6366f1' }}></div>
                                                    <span>Week 5</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="chart-wrapper">
                                            <h3>Skill Distribution</h3>
                                            <div className="mock-skills-list">
                                                <div className="skill-row">
                                                    <span>Pronunciation</span>
                                                    <div className="progress-bg"><div className="progress-fill" style={{ width: '75%', background: '#1A3263' }}></div></div>
                                                </div>
                                                <div className="skill-row">
                                                    <span>Sentence Structure</span>
                                                    <div className="progress-bg"><div className="progress-fill" style={{ width: '85%', background: '#3b82f6' }}></div></div>
                                                </div>
                                                <div className="skill-row">
                                                    <span>Professional Tone</span>
                                                    <div className="progress-bg"><div className="progress-fill" style={{ width: '90%', background: '#8b5cf6' }}></div></div>
                                                </div>
                                                <div className="skill-row">
                                                    <span>Vocabulary</span>
                                                    <div className="progress-bg"><div className="progress-fill" style={{ width: '65%', background: '#f59e0b' }}></div></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default CommunicationIntelligenceLab;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import {
    FaMicrophone, FaClock, FaArrowRight, FaRobot,
    FaChartBar, FaUserTie, FaVolumeUp
} from 'react-icons/fa';

const InterviewEngine = ({ config, onComplete, onCancel }) => {
    const { t } = useLanguage();
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(180);
    const [loading, setLoading] = useState(true);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Pro Metrics (Simulated real-time)
    const [metrics, setMetrics] = useState({
        confidence: 85,
        clarity: 90,
        relevance: 0
    });

    const timerRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post('https://tenshiro.onrender.com/api/interview/generate', config, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuestions(res.data.questions);
                setLoading(false);
                startTimer();
            } catch (err) {
                console.error("Failed to fetch questions", err);
                setLoading(false);
            }
        };
        fetchQuestions();

        // Setup Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setCurrentAnswer(prev => prev + event.results[i][0].transcript + ' ');
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // Simulate metric boost on speaking
                setMetrics(prev => ({
                    ...prev,
                    relevance: Math.min(100, prev.relevance + 5)
                }));
            };
        }

        return () => {
            clearInterval(timerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [config]);

    const startTimer = () => {
        clearInterval(timerRef.current);
        setTimeLeft(180);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) return 0;
                return prev - 1;
            });
        }, 1000);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            setIsVoiceMode(true);
        }
    };

    const handleNext = async () => {
        const newAnswers = [...answers];
        newAnswers[currentIdx] = currentAnswer;
        setAnswers(newAnswers);

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setCurrentAnswer('');
            setMetrics(m => ({ ...m, relevance: 0 }));
            startTimer();
        } else {
            setAnalyzing(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post('https://tenshiro.onrender.com/api/interview/analyze', {
                    questions,
                    answers: newAnswers,
                    config
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onComplete(res.data);
            } catch (err) {
                console.error("Analysis failed", err);
                setAnalyzing(false);
            }
        }
    };

    if (loading) return <div className="engine-loading"><div className="spinner"></div><h3>Initiating Secure Uplink...</h3></div>;
    if (analyzing) return <div className="engine-loading"><div className="spinner"></div><h3>Compiling High-Performance Feedback...</h3></div>;

    return (
        <div className="simulation-workspace">
            {/* Left Column: The Booth */}
            <div className="booth-container">
                <div className="interviewer-booth">
                    <div className="ai-glow"></div>
                    <div className="interviewer-avatar">
                        <FaRobot size={150} color="var(--primary)" />
                    </div>
                    <div className="interviewer-status">
                        {isListening ? "Listening..." : "Waiting for Input"}
                    </div>
                    <div className="wave-animation">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s`, opacity: isListening ? 1 : 0.2 }}></div>
                        ))}
                    </div>

                    <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                        <div className="timer-box" style={{ background: 'rgba(0,0,0,0.5)', borderColor: timeLeft < 30 ? '#ef4444' : 'var(--primary)' }}>
                            <FaClock /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    </div>
                </div>

                <div className="question-card" style={{ marginTop: '2rem', minHeight: '150px' }}>
                    <div className="question-number">Question {currentIdx + 1} of {questions.length}</div>
                    <h2 className="question-text" style={{ fontSize: '1.8rem' }}>{questions[currentIdx]}</h2>
                </div>

                <div className="answer-card" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Your Professional Response</h4>
                        <button
                            className={`voice-toggle ${isListening ? 'active' : ''}`}
                            onClick={toggleListening}
                            style={{ border: 'none', padding: '0.8rem 1.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 800 }}
                        >
                            <FaMicrophone /> {isListening ? "STOP MICROPHONE" : "START VOICE"}
                        </button>
                    </div>
                    <textarea
                        className="answer-area"
                        placeholder="Type your response here or use the voice assistant..."
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        style={{ background: 'var(--bg-surface)', border: '2px solid var(--border)', borderRadius: '1.5rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn-primary" onClick={handleNext} style={{ padding: '1rem 3rem', borderRadius: '1rem', fontSize: '1.1rem' }}>
                            {currentIdx === questions.length - 1 ? "FINISH SIMULATION" : "NEXT QUESTION"} <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Pro Stats */}
            <div className="stats-panel-pro">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FaChartBar color="var(--primary)" /> Real-time Analytics
                </h3>

                <div className="pro-metric">
                    <div className="metric-header">
                        <span className="metric-title">Self-Confidence</span>
                        <span className="metric-value">{metrics.confidence}%</span>
                    </div>
                    <div className="metric-bar-bg">
                        <div className="metric-bar-fill" style={{ width: `${metrics.confidence}%` }}></div>
                    </div>
                </div>

                <div className="pro-metric">
                    <div className="metric-header">
                        <span className="metric-title">Clarity of Speech</span>
                        <span className="metric-value">{metrics.clarity}%</span>
                    </div>
                    <div className="metric-bar-bg">
                        <div className="metric-bar-fill" style={{ width: `${metrics.clarity}%` }}></div>
                    </div>
                </div>

                <div className="pro-metric">
                    <div className="metric-header">
                        <span className="metric-title">Content Relevance</span>
                        <span className="metric-value">{metrics.relevance}%</span>
                    </div>
                    <div className="metric-bar-bg">
                        <div className="metric-bar-fill" style={{ width: `${metrics.relevance}%` }}></div>
                    </div>
                </div>

                <div className="live-feedback-box">
                    <div style={{ fontWeight: 800, fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>AI SUGGESTION</div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {currentAnswer.length < 50
                            ? "Try to provide more details about your specific experiences."
                            : "Excellent detail. Maintain this level of technical depth."}
                    </p>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <FaUserTie size={40} color="var(--border)" />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                        The interviewer is analyzing your body language and tone of voice. Remain calm and maintain steady eye contact.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InterviewEngine;

const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const dataController = require('../controllers/dataController');
const aiController = require('../controllers/aiController');
const interviewController = require('../controllers/interviewController');
const assistantController = require('../controllers/assistantController');
const communicationController = require('../controllers/communicationController');
const scheduleController = require('../controllers/scheduleController');

// Auth Routes
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
router.post('/auth/dev-login', userController.devLogin);
router.get('/auth/user', auth, userController.getProfile);
router.put('/auth/update-language', auth, userController.updateLanguage);

// Google OAuth Routes
router.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: 'https://tenshiro.onrender.com/login?error=auth_failed'
    }),
    userController.googleAuth
);

// Data Routes
router.get('/domains', auth, dataController.getDomains);
router.get('/domains/:domainId/roles', auth, dataController.getRolesByDomain);
router.get('/roles/:id', auth, dataController.getRoleDetails);
router.get('/roles/:id/study-plan', auth, dataController.getStudyPlan); // New
router.get('/roadmap/:roleId', auth, dataController.getRoadmap);

// Jobs & Internships Routes
router.get('/jobs', auth, dataController.getAllJobs);
router.get('/jobs/role/:roleId', auth, dataController.getJobsByRole);
router.get('/applications', auth, dataController.getUserApplications);
router.post('/applications', auth, dataController.trackApplication);
router.put('/applications/:id', auth, dataController.updateApplicationStage);
router.delete('/applications/:id', auth, dataController.deleteApplication);

// AI Routes
router.post('/ai/chat', auth, aiController.chat);
router.post('/ai/premium-overview', auth, aiController.getPremiumOverview);
router.get('/ai/chat-history', auth, aiController.getChatHistory); // New
router.post('/ai/course-recommendation', auth, aiController.courseRecommendation); // New
router.post('/ai/project-suggestion', auth, aiController.projectSuggestion); // New
router.post('/ai/job-recommendation', auth, aiController.jobRecommendation); // New
router.post('/ai/placement-guidance', auth, aiController.placementGuidance); // New
router.post('/ai/roadmap', auth, aiController.generateRoadmap); // New
router.post('/ai/translate', auth, aiController.translate); // New

// Interview Intelligence Routes
router.post('/interview/generate', auth, interviewController.generateQuestions);
router.post('/interview/analyze', auth, interviewController.analyzeInterview);
router.post('/interview/prep-data', auth, interviewController.getPrepData);
router.get('/interview/history', auth, interviewController.getHistory);

// Communication Intelligence Content Routes
router.get('/comm/grammar', auth, communicationController.getGrammarTopics);
router.get('/comm/quizzes', auth, communicationController.getGrammarQuizzes);
router.get('/comm/courses', auth, communicationController.getCourses);
router.get('/comm/videos', auth, communicationController.getVideos);
router.get('/comm/resources', auth, communicationController.getResources);
router.get('/comm/pdfs', auth, communicationController.getPdfs);
router.post('/comm/analyze-speech', auth, communicationController.analyzeSpeech);
router.post('/comm/ai-chat', auth, communicationController.handleAiChat);
router.get('/comm/topic-quiz', auth, communicationController.getTopicQuiz);

// Schedule Routes
router.get('/schedules', auth, scheduleController.getSchedules);
router.post('/schedules', auth, scheduleController.addSchedule);
router.delete('/schedules/:id', auth, scheduleController.deleteSchedule);
router.put('/schedules/:id/toggle', auth, scheduleController.toggleCompletion);

// Enhanced AI features
router.post('/ai/save-roadmap', auth, aiController.saveUserRoadmap);
router.get('/ai/my-roadmaps', auth, aiController.getUserRoadmaps);

// PathPilot AI — Primary unified endpoint (no auth — accessible to all users)
router.post('/pathpilot-ai', assistantController.pathpilotChat);

// Legacy endpoint (backward compat)
router.post('/assistant', assistantController.chat);

module.exports = router;

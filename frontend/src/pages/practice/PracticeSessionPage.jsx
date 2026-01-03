// src/pages/practice/PracticeSessionPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Clock, CheckCircle, Circle, Star, ChevronLeft, ChevronRight,
  AlertCircle, Send, Eye, Maximize, AlertTriangle
} from 'lucide-react';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import { practiceAPI } from '@api/endpoints/practiceAPI';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const TIMER_DURATION = 30 * 60; // 30 minutes in seconds

const PracticeSessionPage = () => {
  const { subjectId, topicId, setId, level } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
    enterFullscreen();
    return () => exitFullscreen();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [questions]);

  // Mark question as visited when navigating
  useEffect(() => {
    if (questions.length > 0) {
      setVisitedQuestions(prev => new Set([...prev, currentIndex]));
    }
  }, [currentIndex, questions.length]);

  // Listen for fullscreen changes - Force fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If user exits fullscreen (e.g., pressing ESC), show warning
      if (!isCurrentlyFullscreen && !showExitDialog) {
        setShowFullscreenWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showExitDialog]);

  const fetchQuestions = async () => {
    try {
      const response = await practiceAPI.getSetQuestions(subjectId, topicId, setId);
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast.error(parseError(error).message);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleReview = (questionId) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionId, index) => {
    const answered = answers[questionId] !== undefined && answers[questionId] !== '';
    const reviewed = markedForReview.has(questionId);
    const visited = visitedQuestions.has(index);
    
    if (answered && reviewed) return 'review';
    if (answered) return 'answered';
    if (!answered && visited) return 'visited';
    return 'unvisited';
  };

  const handleAutoSubmit = async () => {
    await handleSubmit(true);
  };

  const handleSubmitClick = () => {
    const visitedUnanswered = questions.filter((q, idx) => 
      visitedQuestions.has(idx) && (!answers[q.question_id] || answers[q.question_id] === '')
    ).length;
    
    setUnansweredCount(visitedUnanswered);
    setShowSubmitDialog(true);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && showSubmitDialog) {
      setShowSubmitDialog(false);
    }

    setIsSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const userAnswers = questions.map(q => ({
        question_id: q.question_id,
        user_answer: answers[q.question_id] || ''
      }));

      const response = await practiceAPI.submitAttempt(subjectId, topicId, setId, userAnswers);
      
      exitFullscreen();
      
      navigate(`/subjects/${subjectId}/topics/${topicId}/sets/${level}/practice/${setId}/results`, {
        state: { results: response.data }
      });
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleExitConfirm = () => {
    setShowFullscreenWarning(false); // Close any fullscreen warning
    exitFullscreen();
    navigate(-1);
  };

  const handleReturnToFullscreen = () => {
    setShowFullscreenWarning(false);
    enterFullscreen();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const statusCounts = {
    answered: questions.filter((q, idx) => getQuestionStatus(q.question_id, idx) === 'answered').length,
    unanswered: questions.filter((q, idx) => getQuestionStatus(q.question_id, idx) === 'visited').length,
    review: questions.filter((q, idx) => getQuestionStatus(q.question_id, idx) === 'review').length,
    unvisited: questions.filter((q, idx) => getQuestionStatus(q.question_id, idx) === 'unvisited').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleExitClick}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <p className="w-30 h-5 text-red-600" >End Test</p>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Practice Session</h2>
            <p className="text-xs text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-medium
          ${timeLeft < 300 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-primary-50 text-primary-700 border border-primary-200'}
        `}>
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>

        {/* Stats & Fullscreen */}
        <div className="flex items-center gap-3">
          <StatBadge icon={CheckCircle} count={statusCounts.answered} color="emerald" label="Answered" />
          <StatBadge icon={AlertCircle} count={statusCounts.unanswered} color="orange" label="Unanswered" />
          <StatBadge icon={Star} count={statusCounts.review} color="amber" label="Review" />
          <StatBadge icon={Eye} count={statusCounts.unvisited} color="gray" label="Not Visited" />
          
          {!isFullscreen && (
            <button
              onClick={enterFullscreen}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Enter Fullscreen"
            >
              <Maximize className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-61px)]">
        {/* Question Navigator */}
        <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q.question_id, idx);
              return (
                <button
                  key={q.question_id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                    w-9 h-9 rounded-md text-xs font-medium transition-all
                    ${currentIndex === idx ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
                    ${status === 'answered' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                    ${status === 'visited' ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                    ${status === 'review' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                    ${status === 'unvisited' ? 'bg-gray-200 hover:bg-gray-300 text-gray-600' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <div className="grid grid-cols-2 h-full">
                  {/* Left: Question & Image */}
                  <div className="border-r border-gray-200 p-6 overflow-y-auto custom-scrollbar">
                    <div className="max-w-2xl">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <span className="text-xs text-gray-500 font-medium">Question {currentIndex + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                              {currentQuestion.question_type}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleReview(currentQuestion.question_id)}
                          className={`
                            p-2 rounded-lg transition-colors
                            ${markedForReview.has(currentQuestion.question_id) 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }
                          `}
                        >
                          <Star className={`w-4 h-4 ${markedForReview.has(currentQuestion.question_id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="prose prose-sm max-w-none mb-6">
                        <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {currentQuestion.question_text}
                        </p>
                      </div>

                      {/* Question Image */}
                      {currentQuestion.image_url && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <img 
                            src={currentQuestion.image_url} 
                            alt="Question" 
                            className="max-w-full h-auto rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Answer Options */}
                  <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50">
                    <div className="max-w-2xl">
                      <h3 className="text-xs font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        {currentQuestion.question_type === 'MSQ' ? 'Select Multiple Answers' : 'Select Your Answer'}
                      </h3>
                      <AnswerOptions
                        question={currentQuestion}
                        value={answers[currentQuestion.question_id] || ''}
                        onChange={(val) => handleAnswerChange(currentQuestion.question_id, val)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-xs text-gray-500">
              {statusCounts.answered} answered • {statusCounts.unanswered} unanswered • {statusCounts.unvisited} not visited
            </div>

            {currentIndex === questions.length - 1 ? (
              <Button variant="success" onClick={handleSubmitClick} loading={isSubmitting} className="text-sm">
                <Send className="w-4 h-4" />
                Submit Test
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                className="text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Warning Dialog (Blocks everything) */}
      <FullscreenWarningDialog
        isOpen={showFullscreenWarning}
        onReturnToFullscreen={handleReturnToFullscreen}
      />

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={handleExitConfirm}
        title="Exit Practice Session?"
        message="Are you sure you want to exit? All your progress will be lost and cannot be recovered."
        confirmText="Exit"
        confirmVariant="danger"
        icon={AlertTriangle}
        iconColor="red"
      />

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={() => handleSubmit(false)}
        title="Submit Practice Test?"
        message={
          unansweredCount > 0 
            ? `You have ${unansweredCount} visited question${unansweredCount > 1 ? 's' : ''} left unanswered. Do you want to submit anyway?`
            : "Are you sure you want to submit your test? You won't be able to make changes after submission."
        }
        confirmText="Submit Test"
        confirmVariant="success"
        icon={Send}
        iconColor="green"
        showWarning={unansweredCount > 0}
      />
    </div>
  );
};

// Answer Options Component
const AnswerOptions = ({ question, value, onChange }) => {
  if (question.question_type === 'MCQ') {
    return (
      <div className="space-y-2">
        {['a', 'b', 'c', 'd'].map(opt => (
          <label
            key={opt}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border-2
              ${value === opt 
                ? 'bg-primary-50 border-primary-500 shadow-sm' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <input
              type="radio"
              name="answer"
              value={opt}
              checked={value === opt}
              onChange={(e) => onChange(e.target.value)}
              className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-xs text-gray-700 uppercase">{opt})</span>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">{question[`option_${opt}`]}</p>
            </div>
          </label>
        ))}
      </div>
    );
  }

  if (question.question_type === 'MSQ') {
    const selected = value ? value.split('') : [];
    const toggleOption = (opt) => {
      let newSelected = [...selected];
      if (newSelected.includes(opt)) {
        newSelected = newSelected.filter(o => o !== opt);
      } else {
        newSelected.push(opt);
      }
      onChange(newSelected.sort().join(''));
    };

    return (
      <div className="space-y-2">
        {['a', 'b', 'c', 'd'].map(opt => (
          <label
            key={opt}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border-2
              ${selected.includes(opt) 
                ? 'bg-primary-50 border-primary-500 shadow-sm' 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggleOption(opt)}
              className="mt-0.5 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-xs text-gray-700 uppercase">{opt})</span>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">{question[`option_${opt}`]}</p>
            </div>
          </label>
        ))}
      </div>
    );
  }

  if (question.question_type === 'NAT') {
    return (
      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Numerical Answer
        </label>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your answer"
          className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
        />
      </div>
    );
  }

  return null;
};

// Stat Badge
const StatBadge = ({ icon: Icon, count, color, label }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div 
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${colorClasses[color]}`} 
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{count}</span>
    </div>
  );
};

// Fullscreen Warning Dialog Component (Blocks all interaction)
const FullscreenWarningDialog = ({ isOpen, onReturnToFullscreen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden mx-4"
      >
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <Maximize className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Fullscreen Mode Required
          </h2>
          
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            This practice session must be completed in fullscreen mode to ensure a distraction-free environment. 
            Please click the button below to return to fullscreen mode and continue your test.
          </p>
          
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-orange-900 mb-1">Important Notice</p>
                <p className="text-xs text-orange-800">
                  You cannot interact with the test until you return to fullscreen mode. Your timer is still running.
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onReturnToFullscreen}
            className="text-base font-semibold"
          >
            <Maximize className="w-5 h-5" />
            Return to Fullscreen
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Confirm Dialog Component
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  confirmVariant = 'primary',
  icon: Icon,
  iconColor = 'blue',
  showWarning = false
}) => {
  if (!isOpen) return null;

  const iconColorClasses = {
    red: 'bg-red-100 text-red-600',
    green: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${iconColorClasses[iconColor]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
              
              {showWarning && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-800">Make sure to review all questions before submitting.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            className="text-sm"
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className="text-sm"
          >
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PracticeSessionPage;
// src/pages/practice/ResultsPage.jsx
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, TrendingUp, Target, CheckCircle, XCircle, Home,
  Trophy, BarChart3, ArrowRight, TrendingDown
} from 'lucide-react';
import Button from '@components/common/Button';
import { USER_ROLES } from '@utils/constants';
import { useAuth } from '@context/AuthContext';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId, topicId, level } = useParams();
  const { user } = useAuth();

  const results = location.state?.results;
  
  if (!results) {
    navigate(-1);
    return null;
  }

  const { evaluation, saved, score_increment, previous_best_score, current_score, level_completed } = results;
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const passed = evaluation.passed;

  const totalQuestions = evaluation.results?.length || 0;
  const correctCount=evaluation.correctCount;
  const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;
  const percentage = ((evaluation.scored_marks / evaluation.total_marks) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg font-bold text-gray-900">Practice Results</h1>
          <p className="text-sm text-gray-600 mt-0.5">Review your performance and track your progress</p>
        </div>
      </div>
      <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/subjects/${subjectId}/topics/${topicId}/sets/${level}`)}
          >
            <Home className="w-5 h-5" />
            Back to Practice Sets
          </Button>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Result Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            rounded-xl p-8 shadow-lg border-2
            ${passed 
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300' 
              : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`
                p-4 rounded-2xl
                ${passed ? 'bg-emerald-500' : 'bg-orange-500'}
              `}>
                {passed ? (
                  <Trophy className="w-12 h-12 text-white" />
                ) : (
                  <Target className="w-12 h-12 text-white" />
                )}
              </div>
              
              <div>
                <h2 className={`text-3xl font-bold mb-1 ${passed ? 'text-emerald-900' : 'text-orange-900'}`}>
                  {passed ? 'Well Done!' : 'Keep Practicing'}
                </h2>
                <p className={`text-sm ${passed ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {passed 
                    ? "You've successfully passed this practice set" 
                    : "You're making progress - keep going!"
                  }
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-5xl font-bold text-gray-900 mb-1">
                {percentage}%
              </div>
              <div className="text-sm text-gray-600">
                {evaluation.scored_marks} / {evaluation.total_marks} marks
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={Award}
            label="Score"
            value={`${evaluation.scored_marks}/${evaluation.total_marks}`}
            color="blue"
            trend={passed ? 'up' : 'neutral'}
          />
          <MetricCard
            icon={Target}
            label="Threshold"
            value={`${evaluation.threshold_percentage}%`}
            color="purple"
          />
          <MetricCard
            icon={CheckCircle}
            label="Accuracy"
            value={`${percentage}%`}
            color="emerald"
            trend={accuracy >= 70 ? 'up' : 'down'}
          />
          <MetricCard
            icon={BarChart3}
            label="Questions"
            value={totalQuestions}
            subtitle={`${correctCount} correct, ${totalQuestions - correctCount} wrong`}
            color="amber"
          />
        </div>

        {/* Student Progress (if applicable) */}
        {isStudent && saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border-2 border-primary-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your Progress</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Performance tracking for this set</p>
                </div>
              </div>
              
              {level_completed && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 border-2 border-emerald-300 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-semibold text-emerald-900">Level {level} Completed!</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <ProgressStat 
                label="Score Increment" 
                value={score_increment}
                prefix="+"
                highlight={score_increment > 0}
              />
              <ProgressStat 
                label="Previous Best" 
                value={previous_best_score}
              />
              <ProgressStat 
                label="Current Score" 
                value={current_score}
                highlight
              />
            </div>
          </motion.div>
        )}

        {/* Question-wise Results (Non-Students) */}
        {!isStudent && evaluation.results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Detailed Results</h3>
              <p className="text-xs text-gray-600 mt-0.5">Question-by-question breakdown</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {evaluation.results.map((result, idx) => (
                  <div
                    key={result.question_id}
                    className={`
                      p-4 rounded-lg border-2 transition-all hover:shadow-md
                      ${result.is_correct 
                        ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' 
                        : 'bg-red-50 border-red-200 hover:border-red-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          p-1.5 rounded-lg
                          ${result.is_correct ? 'bg-emerald-500' : 'bg-red-500'}
                        `}>
                          {result.is_correct ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Question {idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`
                          text-sm font-bold px-2 py-1 rounded
                          ${result.is_correct ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'}
                        `}>
                          {result.gained_marks > 0 ? '+' : ''}{result.gained_marks} marks
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Your Answer</p>
                        <p className="font-semibold text-gray-900">
                          {result.user_answer || <span className="text-gray-400 italic">Not answered</span>}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs text-emerald-700 mb-1 font-medium">Correct Answer</p>
                        <p className="font-semibold text-emerald-900">{result.correct_answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, subtitle, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${colorClasses[color]} rounded-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-orange-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </span>
        )}
      </div>
      
      {subtitle && <p className="text-xs text-gray-600 mt-2">{subtitle}</p>}
    </motion.div>
  );
};

// Progress Stat Component
const ProgressStat = ({ label, value, prefix = '', highlight = false }) => (
  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
    <p className="text-xs text-gray-600 font-medium mb-2">{label}</p>
    <p className={`text-2xl font-bold ${highlight ? 'text-primary-600' : 'text-gray-900'}`}>
      {prefix}{value}
    </p>
  </div>
);

export default ResultsPage;
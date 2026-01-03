// src/pages/sets/LevelsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import Spinner from '@components/common/Spinner';
import LevelCard from '@components/sets/LevelCard';
import { useAuth } from '@context/AuthContext';
import { setAPI } from '@api/endpoints/setAPI';
import { USER_ROLES } from '@utils/constants';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const LevelsPage = () => {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState([]);
  const [topicName, setTopicName] = useState('');

  useEffect(() => {
    fetchLevels();
  }, [subjectId, topicId]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await setAPI.getLevelsByTopic(subjectId, topicId);
      setLevels(response.data.levels || []);
      
      // Get topic name from previous navigation or fetch
      setTopicName(sessionStorage.getItem(`topic_${topicId}_name`) || 'Topic');
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === USER_ROLES.STUDENT;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/subjects/${subjectId}/topics`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary-600" />
                {topicName}
              </h1>
              <p className="text-gray-600 mt-1">Choose your practice level</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <Spinner size="xl" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {levels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LevelCard
                  level={level}
                  subjectId={subjectId}
                  topicId={topicId}
                  isStudent={isStudent}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default LevelsPage;
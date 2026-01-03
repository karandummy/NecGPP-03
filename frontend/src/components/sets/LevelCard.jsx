// src/components/sets/LevelCard.jsx
import { motion } from 'framer-motion';
import { Lock, Unlock, Layers, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LevelCard = ({ level, subjectId, topicId, isStudent = false }) => {
  const navigate = useNavigate();
  
  const levelInfo = {
    '1': { name: 'Level 1', desc: 'Medium Difficulty', color: 'green', icon: Layers },
    '2': { name: 'Level 2', desc: 'Hard Difficulty', color: 'purple', icon: Star }
  };

  const info = levelInfo[level.level];
  const Icon = info.icon;
  const isLocked = isStudent && level.levLocked;

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/subjects/${subjectId}/topics/${topicId}/sets/${level.level}`);
    }
  };

  return (
    <motion.div
      whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
      onClick={handleClick}
      className={`
        relative bg-white rounded-xl shadow-lg p-8 border-2
        transition-all duration-300
        ${isLocked 
          ? 'border-gray-300 cursor-not-allowed opacity-60' 
          : `border-${info.color}-300 hover:border-${info.color}-500 cursor-pointer hover:shadow-2xl`
        }
      `}
    >
      {/* New Sets Badge */}
      {level.havingAdditional && (
        <div className="absolute top-4 right-4 p-2 bg-amber-100 rounded-full animate-pulse">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
      )}

      {/* Lock Badge */}
      {isLocked && (
        <div className="absolute top-4 right-4 p-3 bg-red-100 rounded-full">
          <Lock className="w-6 h-6 text-red-600" />
        </div>
      )}

      <div className="text-center space-y-4">
        {/* Icon */}
        <div className={`inline-flex p-6 bg-${info.color}-100 rounded-full`}>
          <Icon className={`w-12 h-12 text-${info.color}-600`} />
        </div>

        {/* Level Name */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{info.name}</h3>
          <p className={`text-${info.color}-600 font-medium mt-1`}>{info.desc}</p>
        </div>

        {/* Sets Count */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-800">
              {level.setCount} {level.setCount === 1 ? 'Set' : 'Sets'}
            </span>
          </div>
        </div>

        {/* Status */}
        {isStudent && (
          <div className={`
            py-2 px-4 rounded-lg font-medium
            ${isLocked 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
            }
          `}>
            {isLocked ? (
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Complete Level 1 to unlock
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Unlock className="w-4 h-4" />
                Unlocked
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LevelCard;
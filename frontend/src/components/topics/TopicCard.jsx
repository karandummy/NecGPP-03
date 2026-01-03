// src/components/topics/TopicCard.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  MoreVertical, 
  Edit, 
  Download, 
  Trash2,
  Layers,
  GripVertical
} from 'lucide-react';

const TopicCard = ({ 
  topic, 
  subjectId,
  onEdit, 
  onDelete, 
  onExport,
  canEdit,
  hasSuperAccess,
  isDragging = false,
  dragHandleProps
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (e) => {
    if (
      e.target.closest('.three-dot-menu') || 
      e.target.closest('button') ||
      isDragging
    ) {
      return;
    }
    navigate(`/subjects/${subjectId}/topics/${topic.topic_id}/sets`);
  };

  const handleMenuClick = (e, action) => {
    e.stopPropagation();
    setMenuOpen(false);
    action();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.05 : 1,
        rotate: isDragging ? 2 : 0
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isDragging ? { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } : {}}
      onClick={handleCardClick}
      className={`
        bg-white rounded-xl shadow-md p-6 relative
        transition-all duration-300 border-2
        ${isDragging ? 'border-primary-500 shadow-2xl cursor-grabbing' : 'border-transparent hover:border-primary-300 cursor-pointer'}
      `}
    >
      {/* Drag Handle */}
      {canEdit && (
        <div 
          {...dragHandleProps}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded-lg transition-colors"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Topic Name */}
      <div className="mb-4 ml-8">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {topic.topic_name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Layers className="w-4 h-4" />
          <span>2 Levels</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 ml-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/subjects/${subjectId}/topics/${topic.topic_id}/sets`);
          }}
          className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          View Sets
        </button>

        {(canEdit || hasSuperAccess) && (
          <div className="relative three-dot-menu" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10"
                >
                  {canEdit && (
                    <>
                      <MenuItem
                        icon={Edit}
                        label="Edit Name"
                        onClick={(e) => handleMenuClick(e, () => onEdit(topic))}
                      />
                      <MenuItem
                        icon={Download}
                        label="Export Data"
                        onClick={(e) => handleMenuClick(e, () => onExport(topic))}
                      />
                    </>
                  )}

                  {hasSuperAccess && (
                    <>
                      {canEdit && <div className="border-t border-gray-200 my-1" />}
                      <MenuItem
                        icon={Trash2}
                        label="Delete Topic"
                        onClick={(e) => handleMenuClick(e, () => onDelete(topic))}
                        danger
                      />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 
      ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}
      transition-colors text-left
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </button>
);

export default TopicCard;
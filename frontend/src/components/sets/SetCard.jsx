// src/components/sets/SetCard.jsx
import { motion } from "framer-motion";
import {
  Lock,
  Play,
  FileText,
  Award,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const SetCard = ({
  set,
  subjectId,
  topicId,
  level,
  isAccessible,
  displayOrder,
  canEdit,
  onEdit,
  onDelete,
  onExport,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isLocked = !isAccessible;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (e) => {
    if (e.target.closest(".three-dot-menu") || e.target.closest("button")) {
      return;
    }
    if (!isLocked) {
      navigate(
        `/subjects/${subjectId}/topics/${topicId}/sets/${level}/practice/${set.set_id}`
      );
    }
  };

  const handleMenuClick = (e, action) => {
    e.stopPropagation();
    setMenuOpen(false);
    action();
  };

  return (
    <motion.div
      whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
      onClick={handleClick}
      className={`
        relative bg-white rounded-xl shadow-md p-6 border-2
        transition-all duration-300
        ${
          isLocked
            ? "border-gray-300 cursor-not-allowed opacity-50"
            : "border-transparent hover:border-primary-500 cursor-pointer hover:shadow-xl"
        }
      `}
    >
      {/* Lock Badge */}
      {isLocked && (
        <div className="absolute top-4 right-4 p-2 bg-red-100 rounded-full">
          <Lock className="w-5 h-5 text-red-600" />
        </div>
      )}

      {/* Three Dot Menu */}
      {canEdit && !isLocked && (
        <div className="absolute top-4 right-4 three-dot-menu" ref={menuRef}>
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
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10"
              >
                <button
                  onClick={(e) => handleMenuClick(e, onEdit)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <Edit className="w-4 h-4" />
                  <span className="font-medium">Edit Questions</span>
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, onExport)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Export Set</span>
                </button>

                <button
                  onClick={(e) => handleMenuClick(e, onDelete)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Delete Set</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Set Number */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {displayOrder}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Set {displayOrder}
            </h3>
            <p className="text-sm text-gray-500">Practice Questions</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Award className="w-4 h-4" />
            <span>Total Marks:</span>
          </div>
          <span className="font-bold text-gray-800">{set.total_marks}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>Threshold:</span>
          </div>
          <span className="font-bold text-gray-800">
            {set.threshold_percentage}%
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Negative Marking:</span>
          </div>
          <span
            className={`font-bold ${
              set.negative_marking === 1 ? "text-red-600" : "text-green-600"
            }`}
          >
            {set.negative_marking === 1 ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {/* Action */}
      {!isLocked && (
        <button className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          <Play className="w-5 h-5" />
          Start Practice
        </button>
      )}

      {isLocked && (
        <div className="mt-6 py-3 bg-gray-200 text-gray-600 rounded-lg text-center font-medium">
          Complete Previous Sets
        </div>
      )}
    </motion.div>
  );
};

export default SetCard;

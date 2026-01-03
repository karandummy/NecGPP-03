// src/components/subjects/SubjectCard.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  MoreVertical, 
  Lock, 
  Unlock as LockOpen, 
  Edit, 
  Users, 
  Download, 
  Trash2, 
  LogOut,
  Eye,
  EyeOff,
  Crown
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { rolePermissions } from '@utils/rolePermissions';
import { USER_ROLES } from '@utils/constants';

const SubjectCard = ({ 
  subject, 
  onEdit, 
  onDelete, 
  onToggleLock, 
  onToggleDeptLock,
  onManageMembers, 
  onExport,
  onLeave,
  isOtherSubject = false 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canEdit = rolePermissions.canEditSubject(subject, user?.role);
  const hasSuperAccess = rolePermissions.hasSuperAccess(subject, user?.role);
  const canToggleDept = rolePermissions.canToggleDeptLock(subject, user?.role);

  const handleCardClick = (e) => {
    // Navigate to topics only if clicking on card body (not buttons/menu)
    if (
      e.target.closest('.three-dot-menu') || 
      e.target.closest('button') ||
      isOtherSubject
    ) {
      return;
    }
    navigate(`/subjects/${subject.subject_id}/topics`);
  };

  const handleMenuClick = (e, action) => {
    e.stopPropagation();
    setMenuOpen(false);
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
      onClick={handleCardClick}
      className={`
        bg-white rounded-xl shadow-md p-6 relative
        transition-all duration-300 border-2 border-transparent
        ${!isOtherSubject ? 'hover:border-primary-300 cursor-pointer' : ''}
      `}
    >
      {/* Super Access Badge */}
      {hasSuperAccess && (
        <div className="absolute top-4 right-4 p-2 bg-amber-100 rounded-lg">
          <Crown className="w-4 h-4 text-amber-600" />
        </div>
      )}

      {/* Subject Name & Topics */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {subject.subject_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>{subject.topics_count || 0} Topics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Status & Creator */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        {/* Subject Lock */}
        {canEdit && (
          <div className="flex items-center gap-1">
            {subject.isLocked === 1 ? (
              <>
                <Lock className="w-4 h-4 text-red-600" />
                <span className="text-red-600 font-medium">Locked</span>
              </>
            ) : (
              <>
                <LockOpen className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Unlocked</span>
              </>
            )}
          </div>
        )}

        {/* Dept Lock */}
        {canToggleDept && (
          <div className="flex items-center gap-1">
            {subject.isDeptSubLocked === 1 ? (
              <>
                <EyeOff className="w-4 h-4 text-orange-600" />
                <span className="text-orange-600 font-medium">Dept Hidden</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium">Dept Visible</span>
              </>
            )}
          </div>
        )}

        {/* Creator */}
        <div className="ml-auto text-gray-500">
          <span className="font-medium">by {subject.creator || 'Unknown'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        {!isOtherSubject && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/subjects/${subject.subject_id}/topics`);
            }}
            className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View Topics
          </button>
        )}

        {/* Three Dot Menu */}
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
                        icon={Users}
                        label="Manage Members"
                        onClick={(e) => handleMenuClick(e, () => onManageMembers(subject))}
                      />
                      <MenuItem
                        icon={Edit}
                        label="Edit Name"
                        onClick={(e) => handleMenuClick(e, () => onEdit(subject))}
                      />
                      <MenuItem
                        icon={subject.isLocked === 1 ? LockOpen : Lock}
                        label={subject.isLocked === 1 ? 'Unlock Subject' : 'Lock Subject'}
                        onClick={(e) => handleMenuClick(e, () => onToggleLock(subject))}
                      />
                      {canToggleDept && (
                        <MenuItem
                          icon={subject.isDeptSubLocked === 1 ? Eye : EyeOff}
                          label={subject.isDeptSubLocked === 1 ? 'Show to Dept' : 'Hide from Dept'}
                          onClick={(e) => handleMenuClick(e, () => onToggleDeptLock(subject))}
                        />
                      )}
                      <MenuItem
                        icon={Download}
                        label="Export Data"
                        onClick={(e) => handleMenuClick(e, () => onExport(subject))}
                      />
                    </>
                  )}

                  {(USER_ROLES.ADMIN||USER_ROLES.DEPT_HEAD) && (
                    <>
                      {canEdit && <div className="border-t border-gray-200 my-1" />}
                      {user?.role === USER_ROLES.ADMIN ? (
                        <MenuItem
                          icon={Trash2}
                          label="Delete Subject"
                          onClick={(e) => handleMenuClick(e, () => onDelete(subject))}
                          danger
                        />
                      ) : (
                        user?.role === USER_ROLES.DEPT_HEAD && (
                          subject.superAccess ? (
                            <MenuItem
                              icon={Trash2}
                              label="Delete Subject"
                              onClick={(e) => handleMenuClick(e, () => onDelete(subject))}
                              danger
                            />
                          ) : (
                            <MenuItem
                              icon={LogOut}
                              label="Leave Subject"
                              onClick={(e) => handleMenuClick(e, () => onLeave(subject))}
                              danger
                            />
                          )
                        )
                      )}
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

// Menu Item Component
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

export default SubjectCard;
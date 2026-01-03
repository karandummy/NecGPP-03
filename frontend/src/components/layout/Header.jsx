// src/components/layout/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  User, 
  KeyRound, 
  LogOut, 
  ChevronDown,
  BookOpen,
  BarChart3,
  Settings,
  Users,
  Trophy,
  Target,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { userAPI } from '@api/endpoints/userAPI';
import { USER_ROLES, ROUTES } from '@utils/constants';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [basicProfile, setBasicProfile] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch basic profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getBasicProfile();
        setBasicProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const isActive = (path) => location.pathname === path;

  // Navigation links based on role
  const getNavLinks = () => {
    const links = [
      { path: ROUTES.SUBJECTS, label: 'Subjects', icon: BookOpen },
      { path: '/tests', label: 'Tests', icon: Trophy },
      { path: '/progress', label: 'Progress Explorer', icon: BarChart3 }
    ];

    if (user?.role === USER_ROLES.ADMIN) {
      links.push({ path: '/admin', label: 'Admin Settings', icon: Settings });
    }

    if (user?.role === USER_ROLES.STAFF) {
      links.push({ path: ROUTES.TUTOR_STUDENTS, label: 'Tutor Ward', icon: Users });
    }

    return links;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Name */}
          <Link to={ROUTES.SUBJECTS} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-primary-600 rounded-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800 leading-tight">NEC GATE Portal</h1>
              <p className="text-xs text-gray-500">Excellence in Education</p>
            </div>
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">
                {basicProfile?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role}
                {basicProfile?.dashboard?.dept_code && ` / ${basicProfile.dashboard.dept_code}`}
              </p>
            </div>
          </div>

          {/* Student Stats */}
          {user?.role === USER_ROLES.STUDENT && basicProfile?.dashboard && (
            <div className="hidden lg:flex items-center gap-4 px-6 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
              <StatBadge 
                icon={Trophy} 
                value={basicProfile.dashboard.practice_score} 
                color="text-amber-600"
                tooltip="Practice Score"
              />
              <StatBadge 
                icon={Target} 
                value={basicProfile.dashboard.test_score} 
                color="text-blue-600"
                tooltip="Test Score"
              />
              <StatBadge 
                icon={CheckCircle2} 
                value={basicProfile.dashboard.no_of_lev1_completed} 
                color="text-green-600"
                tooltip="Level 1 Completed"
              />
              <StatBadge 
                icon={CheckCircle2} 
                value={basicProfile.dashboard.no_of_lev2_completed} 
                color="text-purple-600"
                tooltip="Level 2 Completed"
              />
              <StatBadge 
                icon={BookOpen} 
                value={basicProfile.dashboard.no_of_topics_completed} 
                color="text-primary-600"
                tooltip="Topics Completed"
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {getNavLinks().map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${active 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {basicProfile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-700">
                    <p className="text-white font-semibold truncate">
                      {basicProfile?.full_name || 'User'}
                    </p>
                    <p className="text-primary-100 text-sm truncate">{user?.email}</p>
                  </div>

                  <div className="p-2">
                    <DropdownItem
                      icon={User}
                      label="My Profile"
                      onClick={() => {
                        navigate(ROUTES.PROFILE);
                        setProfileOpen(false);
                      }}
                    />
                    <DropdownItem
                      icon={KeyRound}
                      label="Change Password"
                      onClick={() => {
                        navigate(ROUTES.CHANGE_PASSWORD);
                        setProfileOpen(false);
                      }}
                    />
                    <div className="my-2 border-t border-gray-200" />
                    <DropdownItem
                      icon={LogOut}
                      label="Logout"
                      onClick={handleLogout}
                      className="text-red-600 hover:bg-red-50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

// Stat Badge Component for Students
const StatBadge = ({ icon: Icon, value, color, tooltip }) => (
  <div 
    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm group relative"
    title={tooltip}
  >
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-sm font-bold text-gray-800">{value}</span>
    
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      {tooltip}
    </div>
  </div>
);

// Dropdown Item Component
const DropdownItem = ({ icon: Icon, label, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg 
      text-gray-700 hover:bg-gray-100 transition-colors text-left
      ${className}
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </button>
);

export default Header;
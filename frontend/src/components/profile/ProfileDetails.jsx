import { motion } from 'framer-motion';
import { Trophy, Target, BookOpen, User } from 'lucide-react';
import Card from '@components/common/Card';

const ProfileDetails = ({ profile }) => {
  const isStudent = profile.practice_score !== undefined;
  const isStaff = profile.is_tutor !== undefined;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Student Scores */}
      {isStudent && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Practice Score</p>
                  <p className="text-4xl font-bold text-green-800">{profile.practice_score || 0}</p>
                </div>
                <div className="p-4 bg-green-200 rounded-full">
                  <Target className="w-8 h-8 text-green-700" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-green-600">Keep practicing to improve your score!</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Test Score</p>
                  <p className="text-4xl font-bold text-blue-800">{profile.test_score || 0}</p>
                </div>
                <div className="p-4 bg-blue-200 rounded-full">
                  <Trophy className="w-8 h-8 text-blue-700" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-600">Your performance in tests</p>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {/* Tutor Info */}
      {profile.tutor_name && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-200 rounded-full">
                <User className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Your Tutor</p>
                <p className="text-xl font-bold text-purple-800">{profile.tutor_name}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Staff - Tutor Status */}
      {isStaff && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${profile.is_tutor ? 'from-indigo-50 to-purple-100 border-indigo-200' : 'from-gray-50 to-slate-100 border-gray-200'} border`}>
            <div className="flex items-center gap-4">
              <div className={`p-4 ${profile.is_tutor ? 'bg-indigo-200' : 'bg-gray-200'} rounded-full`}>
                <BookOpen className={`w-8 h-8 ${profile.is_tutor ? 'text-indigo-700' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${profile.is_tutor ? 'text-indigo-700' : 'text-gray-600'}`}>Tutor Status</p>
                <p className={`text-xl font-bold ${profile.is_tutor ? 'text-indigo-800' : 'text-gray-700'}`}>
                  {profile.is_tutor ? 'Active Tutor' : 'Not a Tutor'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Additional Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="md:col-span-2"
      >
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <InfoRow label="User ID" value={profile.user_id} />
            <InfoRow label="Email" value={profile.email} />
            {profile.phone_number && <InfoRow label="Phone" value={profile.phone_number} />}
            {profile.dept_name && <InfoRow label="Department" value={profile.dept_name} />}
            {profile.batch_year && <InfoRow label="Batch Year" value={profile.batch_year} />}
            <InfoRow label="Role" value={profile.role} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-sm text-gray-800 font-semibold">{value}</p>
  </div>
);

export default ProfileDetails;
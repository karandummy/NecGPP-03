import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import ProfileDetails from '@components/profile/ProfileDetails';
import Button from '@components/common/Button';
import { userAPI } from '@api/endpoints/userAPI';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';

const MyProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await userAPI.getCompleteProfile();
      setProfile({ ...response.data, role: user?.role });
      
      if (isRefresh) {
        toast.success('Profile refreshed successfully!');
      }
    } catch (error) {
      const errorMsg = parseError(error).message;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <Button onClick={() => fetchProfile()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-1">View and manage your account information</p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchProfile(true)}
            loading={refreshing}
          >
            {!refreshing && <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
        </div>

        <ProfileDetails profile={profile} />
      </motion.div>
    </MainLayout>
  );
};

export default MyProfilePage;
// src/pages/subjects/SubjectsPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, Search } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import Button from '@components/common/Button';
import SearchBar from '@components/common/SearchBar';
import Pagination from '@components/common/Pagination';
import EmptyState from '@components/common/EmptyState';
import ConfirmDialog from '@components/common/ConfirmDialog';
import Spinner from '@components/common/Spinner';
import SubjectCard from '@components/subjects/SubjectCard';
import CreateSubjectModal from '@components/subjects/CreateSubjectModal';
import EditSubjectModal from '@components/subjects/EditSubjectModal';
import ManageMembersModal from '@components/subjects/ManageMembersModal';
import ExportModal from '@components/subjects/ExportModal';
import { useAuth } from '@context/AuthContext';
import { subjectAPI } from '@api/endpoints/subjectAPI';
import { subjectMemberAPI } from '@api/endpoints/subjectMemberAPI';
import { rolePermissions } from '@utils/rolePermissions';
import { USER_ROLES } from '@utils/constants';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

const SubjectsPage = () => {
  const { user } = useAuth();
  
  // Data States
  const [mySubjects, setMySubjects] = useState([]);
  const [otherSubjects, setOtherSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'other'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  
  // Selected Subject
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Action Loading
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await subjectAPI.getSubjects();
      setMySubjects(response.data.mySubjects || []);
      setOtherSubjects(response.data.otherSubjects || []);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setLoading(false);
    }
  };

  // Get active subjects based on tab
  const activeSubjects = activeTab === 'my' ? mySubjects : otherSubjects;

  // Filter subjects by search query
  const filteredSubjects = activeSubjects.filter((subject) =>
    subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.subject_id.toString().includes(searchQuery)
  );

  // Paginate subjects
  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // === HANDLERS ===

  const handleCreateSubject = async (data) => {
    setActionLoading(true);
    try {
      await subjectAPI.createSubject(data);
      toast.success('Subject created successfully!');
      setCreateModalOpen(false);
      await fetchSubjects();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubject = async (subjectId, subjectName) => {
    setActionLoading(true);
    try {
      await subjectAPI.updateSubjectName(subjectId, subjectName);
      toast.success('Subject name updated!');
      setEditModalOpen(false);
      await fetchSubjects();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLock = async (subject) => {
    setActionLoading(true);
    try {
      await subjectAPI.toggleSubjectLock(subject.subject_id, {
        notifyDeptHeads: true,
        notifyParticipants: true
      });
      toast.success(subject.locked === 1 ? 'Subject unlocked!' : 'Subject locked!');
      await fetchSubjects();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDeptLock = async (subject) => {
    setActionLoading(true);
    try {
      await subjectAPI.toggleDeptSubjectLock(subject.subject_id, {
        notifyParticipants: true
      });
      toast.success(subject.dept_sub_lock === 1 ? 'Dept access enabled!' : 'Dept access disabled!');
      await fetchSubjects();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (subjectId, type) => {
    setActionLoading(true);
    try {
      const blob = await subjectAPI.exportSubject(subjectId, type);
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subject_${subjectId}_${type}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export downloaded successfully!');
      setExportModalOpen(false);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const blob = await subjectAPI.deleteSubject(selectedSubject.subject_id);
      
      // Download backup
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subject_${selectedSubject.subject_id}_backup.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Subject deleted! Backup downloaded.');
      setDeleteDialogOpen(false);
      await fetchSubjects();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await subjectMemberAPI.leaveSubject(selectedSubject.subject_id);
      toast.success('You have left the subject');
      setLeaveDialogOpen(false);
      await fetchSubjects();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestAccess = async (subject) => {
    setActionLoading(true);
    try {
      await subjectMemberAPI.requestAccess(subject.subject_id);
      toast.success('Access request sent to subject creator!');
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const canCreateSubject = rolePermissions.canCreateSubject(user?.role);
  const isDeptHead = user?.role === USER_ROLES.DEPT_HEAD;

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary-600" />
              Subjects
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and access your GATE preparation subjects
            </p>
          </div>

          {canCreateSubject && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Create Subject
            </Button>
          )}
        </motion.div>

        {/* Search & Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search subjects by name or ID..."
          />

          {/* Tabs (Only for Dept Head) */}
          {isDeptHead && (
            <div className="flex gap-2 border-b border-gray-200">
              <TabButton
                active={activeTab === 'my'}
                onClick={() => setActiveTab('my')}
                icon={BookOpen}
                label="My Subjects"
                count={mySubjects.length}
              />
              <TabButton
                active={activeTab === 'other'}
                onClick={() => setActiveTab('other')}
                icon={Users}
                label="Other Subjects"
                count={otherSubjects.length}
              />
            </div>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <Spinner size="xl" />
          </div>
        ) : paginatedSubjects.length === 0 ? (
          <EmptyState
            icon={activeTab === 'my' ? BookOpen : Search}
            title={searchQuery ? 'No subjects found' : activeTab === 'my' ? 'No subjects yet' : 'No other subjects available'}
            description={
              searchQuery
                ? 'Try adjusting your search query'
                : activeTab === 'my'
                ? 'Create your first subject to get started'
                : 'All subjects you have access to are in "My Subjects"'
            }
            action={
              canCreateSubject && activeTab === 'my' && !searchQuery && (
                <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-5 h-5" />
                  Create First Subject
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Subject Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedSubjects.map((subject, index) => (
                <motion.div
                  key={subject.subject_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {activeTab === 'my' ? (
                    <SubjectCard
                      subject={subject}
                      onEdit={(s) => {
                        setSelectedSubject(s);
                        setEditModalOpen(true);
                      }}
                      onDelete={(s) => {
                        setSelectedSubject(s);
                        setDeleteDialogOpen(true);
                      }}
                      onToggleLock={handleToggleLock}
                      onToggleDeptLock={handleToggleDeptLock}
                      onManageMembers={(s) => {
                        setSelectedSubject(s);
                        setMembersModalOpen(true);
                      }}
                      onExport={(s) => {
                        setSelectedSubject(s);
                        setExportModalOpen(true);
                      }}
                      onLeave={(s) => {
                        setSelectedSubject(s);
                        setLeaveDialogOpen(true);
                      }}
                    />
                  ) : (
                    <OtherSubjectCard
                      subject={subject}
                      onRequestAccess={handleRequestAccess}
                      onManageMembers={(s) => {
                        setSelectedSubject(s);
                        setMembersModalOpen(true);
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredSubjects.length}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateSubjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubject}
        loading={actionLoading}
      />

      <EditSubjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubject}
        subject={selectedSubject}
        loading={actionLoading}
      />

      <ManageMembersModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        subject={selectedSubject}
        onMemberChange={fetchSubjects}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        subject={selectedSubject}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${selectedSubject?.subject_name}"? A backup will be downloaded automatically.`}
        confirmText="Delete Subject"
        loading={actionLoading}
        danger
      />

      <ConfirmDialog
        isOpen={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onConfirm={handleLeave}
        title="Leave Subject?"
        message={`Are you sure you want to leave "${selectedSubject?.subject_name}"? You'll lose access to all its content.`}
        confirmText="Leave Subject"
        loading={actionLoading}
        danger
      />
    </MainLayout>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-3 font-medium transition-all relative
      ${active
        ? 'text-primary-600 border-b-2 border-primary-600'
        : 'text-gray-600 hover:text-gray-800'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    {label}
    <span className={`
      px-2 py-0.5 rounded-full text-sm font-semibold
      ${active ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-700'}
    `}>
      {count}
    </span>
  </button>
);

// Other Subject Card (simplified version for non-accessible subjects)
const OtherSubjectCard = ({ subject, onRequestAccess, onManageMembers }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    await onRequestAccess(subject);
    setLoading(false);
  };

  const canViewMembers = rolePermissions.canViewMembers(user?.role);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {subject.subject_name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span>{subject.topics_count || 0} Topics</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-gray-500">Created by</span>
        <span className="font-medium text-gray-700">{subject.creator || 'Unknown'}</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleRequest}
          loading={loading}
        >
          <Plus className="w-4 h-4" />
          Request Access
        </Button>
        {/*{canViewMembers && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageMembers(subject)}
          }>
            <Users className="w-4 h-4" />
          </Button>
        )*/}
      </div>
    </motion.div>
  );
};

export default SubjectsPage;
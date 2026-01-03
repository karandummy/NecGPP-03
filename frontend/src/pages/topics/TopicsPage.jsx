// src/pages/topics/TopicsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, BookOpen, ArrowUpDown } from 'lucide-react';
import MainLayout from '@components/layout/MainLayout';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import EmptyState from '@components/common/EmptyState';
import ConfirmDialog from '@components/common/ConfirmDialog';
import TopicCard from '@components/topics/TopicCard';
import CreateTopicModal from '@components/topics/CreateTopicModal';
import EditTopicModal from '@components/topics/EditTopicModal';
import ReorderTopicsModal from '@components/topics/ReorderTopicsModal';
import ExportTopicModal from '@components/topics/ExportTopicModal';
import { useAuth } from '@context/AuthContext';
import { topicAPI } from '@api/endpoints/topicAPI';
import { subjectAPI } from '@api/endpoints/subjectAPI';
import { rolePermissions } from '@utils/rolePermissions';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const TopicsPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [topics, setTopics] = useState([]);
  const [subject, setSubject] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [hasSuperAccess, setHasSuperAccess] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch topics
      const topicsRes = await topicAPI.getTopicsBySubject(subjectId);
      setTopics(topicsRes.data.topics || []);

      // Fetch subject details to check permissions
      const subjectsRes = await subjectAPI.getSubjects();
      const currentSubject = [...(subjectsRes.data.mySubjects || []), ...(subjectsRes.data.otherSubjects || [])]
        .find(s => s.subject_id === parseInt(subjectId));

      if (currentSubject) {
        setSubject(currentSubject);
        setCanEdit(rolePermissions.canEditSubject(currentSubject, user?.role));
        setHasSuperAccess(rolePermissions.hasSuperAccess(currentSubject, user?.role));
      }
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (data) => {
    setActionLoading(true);
    try {
      await topicAPI.createTopic(subjectId, data);
      toast.success('Topic created successfully!');
      setCreateModalOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTopic = async (topicId, topicName) => {
    setActionLoading(true);
    try {
      await topicAPI.updateTopicName(subjectId, topicId, topicName);
      toast.success('Topic name updated!');
      setEditModalOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorderTopics = async (orderedTopicIds) => {
    setActionLoading(true);
    try {
      await topicAPI.reorderTopics(subjectId, orderedTopicIds);
      toast.success('Topics reordered successfully!');
      setReorderModalOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async (topicId, type) => {
    setActionLoading(true);
    try {
      const blob = await topicAPI.exportTopic(subjectId, topicId, type);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `topic_${topicId}_${type}.xlsx`;
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
      const blob = await topicAPI.deleteTopic(subjectId, selectedTopic.topic_id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `topic_${selectedTopic.topic_id}_backup.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Topic deleted! Backup downloaded.');
      setDeleteDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

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
              onClick={() => navigate('/subjects')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary-600" />
                {subject?.subject_name || 'Topics'}
              </h1>
              <p className="text-gray-600 mt-1">
                {topics.length} {topics.length === 1 ? 'topic' : 'topics'} available
              </p>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3">
              {topics.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setReorderModalOpen(true)}
                >
                  <ArrowUpDown className="w-5 h-5" />
                  Reorder
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
                Create Topic
              </Button>
            </div>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <Spinner size="xl" />
          </div>
        ) : topics.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No topics yet"
            description="Create your first topic to start adding practice sets"
            action={
              canEdit && (
                <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-5 h-5" />
                  Create First Topic
                </Button>
              )
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {topics.map((topic, index) => (
              <motion.div
                key={topic.topic_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TopicCard
                  topic={topic}
                  subjectId={subjectId}
                  onEdit={(t) => {
                    setSelectedTopic(t);
                    setEditModalOpen(true);
                  }}
                  onDelete={(t) => {
                    setSelectedTopic(t);
                    setDeleteDialogOpen(true);
                  }}
                  onExport={(t) => {
                    setSelectedTopic(t);
                    setExportModalOpen(true);
                  }}
                  canEdit={canEdit}
                  hasSuperAccess={hasSuperAccess}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateTopicModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTopic}
        loading={actionLoading}
        subjectName={subject?.subject_name}
      />

      <EditTopicModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditTopic}
        topic={selectedTopic}
        loading={actionLoading}
      />

      <ReorderTopicsModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        onSubmit={handleReorderTopics}
        topics={topics}
        loading={actionLoading}
      />

      <ExportTopicModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        topic={selectedTopic}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Topic?"
        message={`Are you sure you want to delete "${selectedTopic?.topic_name}"? A backup will be downloaded automatically.`}
        confirmText="Delete Topic"
        loading={actionLoading}
        danger
      />
    </MainLayout>
  );
};

export default TopicsPage;
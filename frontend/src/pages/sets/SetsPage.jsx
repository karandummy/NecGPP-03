// src/pages/sets/SetsPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Layers,
  Plus,
  ArrowUpDown,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import MainLayout from "@components/layout/MainLayout";
import Button from "@components/common/Button";
import Spinner from "@components/common/Spinner";
import EmptyState from "@components/common/EmptyState";
import ConfirmDialog from "@components/common/ConfirmDialog";
import SetCard from "@components/sets/SetCard";
import CreateSetModal from "@components/sets/CreateSetModal";
import ReorderSetsModal from "@components/sets/ReorderSetsModal";
import UpdateQuestionsModal from "@components/sets/UpdateQuestionsModal";
import ExportSetModal from "@components/sets/ExportSetModal"; // ← Add this line
import { useAuth } from "@context/AuthContext";
import { setAPI } from "@api/endpoints/setAPI";
import { practiceAPI } from "@api/endpoints/practiceAPI";
import { USER_ROLES } from "@utils/constants";
import { parseError } from "@utils/errorHandler";
import toast from "react-hot-toast";

const SetsPage = () => {
  const { subjectId, topicId, level } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState([]);
  const [accessibleIds, setAccessibleIds] = useState([]);
  const [levelCompleted, setLevelCompleted] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const [selectedSet, setSelectedSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSets();
  }, [subjectId, topicId, level]);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const response = await setAPI.getSetsByLevel(subjectId, topicId, level);

      const allSets = response.data.all_sets_ids || [];
      const allSetSCompleteInfo = response.data.allSets;
      const accessibleSetIds = response.data.accessible_sets_ids || [];

      const setsData = allSetSCompleteInfo.map((set) => ({
        set_id: set.set_id,
        display_order: set.display_order,
        total_marks: set.total_marks || 0,
        threshold_percentage: set.threshold_percentage || 50,
        negative_marking: set.negative_marking || 0,
        isAccessible: accessibleSetIds.includes(set.set_id),
      }));

      setSets(setsData);
      setAccessibleIds(accessibleSetIds);
      setLevelCompleted(response.data.lvCompleted || false);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (data) => {
    setActionLoading(true);
    try {
      await setAPI.createSet(subjectId, topicId, data);
      toast.success("Set created successfully!");
      setCreateModalOpen(false);
      await fetchSets();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorder = async (orderedIds) => {
    setActionLoading(true);
    try {
      await setAPI.reorderSets(subjectId, topicId, {
        level,
        ordered_set_ids: orderedIds,
      });
      toast.success("Sets reordered successfully!");
      setReorderModalOpen(false);
      await fetchSets();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionData) => {
    setActionLoading(true);
    try {
      console.log(questionData);
      await setAPI.updateQuestion(
        subjectId,
        topicId,
        selectedSet.set_id,
        questionData
      );
      toast.success("Question updated successfully!");
      await fetchQuestions(selectedSet.set_id);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };


const handleExport = async (setId, exportType) => {
  setActionLoading(true);
  try {
    const blob = await setAPI.exportSet(subjectId, topicId, setId, exportType);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `set_${setId}_${exportType}.xlsx`;  // Correct: uses setId
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Set exported successfully!');
    setExportModalOpen(false);
  } catch (error) {
    toast.error(parseError(error).message || 'Export failed');
  } finally {
    setActionLoading(false);
  }
};
  

  const fetchQuestions = async (setId) => {
    try {
      const response = await practiceAPI.getSetQuestions(
        subjectId,
        topicId,
        setId
      );
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  const handleEditQuestions = async (set) => {
    setSelectedSet(set);
    await fetchQuestions(set.set_id);
    setUpdateModalOpen(true);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const blob = await setAPI.deleteSet(
        subjectId,
        topicId,
        selectedSet.set_id
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `set_${selectedSet.set_id}_backup.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Set deleted! Backup downloaded.");
      setDeleteDialogOpen(false);
      await fetchSets();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const canEdit =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.DEPT_HEAD;
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const levelName = level === "1" ? "Level 1 - Medium" : "Level 2 - Hard";

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
              onClick={() =>
                navigate(`/subjects/${subjectId}/topics/${topicId}/sets`)
              }
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Layers className="w-8 h-8 text-primary-600" />
                {levelName}
              </h1>
              <p className="text-gray-600 mt-1">
                {sets.length} practice {sets.length === 1 ? "set" : "sets"}{" "}
                available
              </p>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3">
              {sets.length > 0 && (
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
                Create Set
              </Button>
            </div>
          )}
        </motion.div>

        {/* Level Completion Badge */}
        {isStudent && levelCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🎉</span>
            </div>
            <div>
              <p className="font-bold text-green-800">Level Completed!</p>
              <p className="text-sm text-green-600">
                Great job! You've mastered this level.
              </p>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-20">
            <Spinner size="xl" />
          </div>
        ) : sets.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No practice sets yet"
            description="Create your first practice set to get started"
            action={
              canEdit && (
                <Button
                  variant="primary"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                  Create First Set
                </Button>
              )
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sets.map((set, index) => {
              const isAccessible = accessibleIds.includes(set.set_id);
              return (
                <motion.div
                  key={set.set_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SetCard
                    set={set}
                    subjectId={subjectId}
                    topicId={topicId}
                    level={level}
                    isAccessible={!isStudent || isAccessible}
                    displayOrder={set.display_order}
                    canEdit={canEdit}
                    onEdit={() => handleEditQuestions(set)}
                    onExport={() => {
                      setSelectedSet(set);
                      setExportModalOpen(true);
                    }}
                    onDelete={() => {
                      setSelectedSet(set);
                      setDeleteDialogOpen(true);
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateSetModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSet}
        subjectId={subjectId}
        topicId={topicId}
        level={level}
        loading={actionLoading}
      />

      <ReorderSetsModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        onSubmit={handleReorder}
        sets={sets}
        loading={actionLoading}
      />

      <UpdateQuestionsModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onSubmit={handleUpdateQuestion}
        questions={questions}
        loading={actionLoading}
      />
      <ExportSetModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        set={selectedSet}
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Set?"
        message={`Are you sure you want to delete Set ${selectedSet?.display_order}? A backup will be downloaded automatically.`}
        confirmText="Delete Set"
        loading={actionLoading}
        danger
      />
    </MainLayout>
  );
};

export default SetsPage;

// src/components/subjects/ManageMembersModal.jsx
import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserPlus } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import { subjectMemberAPI } from '@api/endpoints/subjectMemberAPI';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const ManageMembersModal = ({ isOpen, onClose, subject, onMemberChange }) => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [members, setMembers] = useState({ accessIn: [], accessOut: [] });
  const [showAddList, setShowAddList] = useState(false);

  useEffect(() => {
    if (isOpen && subject) {
      fetchMembers();
    }
  }, [isOpen, subject]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await subjectMemberAPI.getSubjectMembers(subject.subject_id);
      setMembers(response.data);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (deptId) => {
    setActionLoading(`add-${deptId}`);
    try {
      await subjectMemberAPI.addMember(subject.subject_id, deptId, {
        notifyDeptHead: true
      });
      toast.success('Department added successfully');
      await fetchMembers();
      onMemberChange();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (deptId) => {
    setActionLoading(`remove-${deptId}`);
    try {
      await subjectMemberAPI.removeMember(subject.subject_id, deptId, {
        notifyDeptHead: true
      });
      toast.success('Department removed successfully');
      await fetchMembers();
      onMemberChange();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Manage Members - ${subject?.subject_name}`} 
      size="lg"
    >
      {loading ? (
        <div className="py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Departments WITH Access */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Departments with Access ({members.accessIn.length})
              </h3>
            </div>

            {members.accessIn.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No departments have access yet
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.accessIn.map((dept) => (
                  <div
                    key={dept.dept_id}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{dept.dept_name}</p>
                      <p className="text-sm text-gray-600">{dept.dept_code}</p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveMember(dept.dept_id)}
                      loading={actionLoading === `remove-${dept.dept_id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Departments WITHOUT Access */}
          {members.accessOut.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Available Departments ({members.accessOut.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddList(!showAddList)}
                >
                  {showAddList ? 'Hide' : 'Show'} List
                </Button>
              </div>

              {showAddList && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.accessOut.map((dept) => (
                    <div
                      key={dept.dept_id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{dept.dept_name}</p>
                        <p className="text-sm text-gray-600">{dept.dept_code}</p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddMember(dept.dept_id)}
                        loading={actionLoading === `add-${dept.dept_id}`}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ManageMembersModal;
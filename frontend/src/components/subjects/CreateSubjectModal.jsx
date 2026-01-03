// src/components/subjects/CreateSubjectModal.jsx
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { departmentsAPI } from '@api/endpoints/departmentsAPI';
import { validators } from '@utils/validators';
import toast from 'react-hot-toast';

const CreateSubjectModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    subject_name: '',
    dept_ids: [],
    notifyDeptHeads: false
  });
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Fetch departments
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const response = await departmentsAPI.getDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleDepartment = (deptId) => {
    setFormData(prev => ({
      ...prev,
      dept_ids: prev.dept_ids.includes(deptId)
        ? prev.dept_ids.filter(id => id !== deptId)
        : [...prev.dept_ids, deptId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validators.required(formData.subject_name, 'Subject name');
    if (nameError) newErrors.subject_name = nameError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      subject_name: formData.subject_name.trim(),
      dept_ids: formData.dept_ids,
      notifyDeptHeads: formData.notifyDeptHeads
    });

    // Reset form
    setFormData({
      subject_name: '',
      dept_ids: [],
      notifyDeptHeads: false
    });
  };

  const handleClose = () => {
    setFormData({
      subject_name: '',
      dept_ids: [],
      notifyDeptHeads: false
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Subject" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Subject Name"
          name="subject_name"
          value={formData.subject_name}
          onChange={handleChange}
          placeholder="Enter subject name"
          error={errors.subject_name}
          required
          disabled={loading}
        />

        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Departments (Optional)
          </label>
          
          {loadingDepts ? (
            <div className="text-center py-4 text-gray-500">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No departments available</div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
              {departments.map((dept) => (
                <label
                  key={dept.dept_id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.dept_ids.includes(dept.dept_id)}
                    onChange={() => toggleDepartment(dept.dept_id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{dept.dept_name}</p>
                    <p className="text-sm text-gray-500">{dept.dept_code}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {formData.dept_ids.length > 0 && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>{formData.dept_ids.length}</strong> department(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Notify Checkbox */}
        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            name="notifyDeptHeads"
            checked={formData.notifyDeptHeads}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
          <span className="text-sm text-gray-700">
            Notify all department heads about this subject creation
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            fullWidth
          >
            <Plus className="w-5 h-5" />
            Create Subject
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSubjectModal;
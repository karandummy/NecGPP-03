// src/components/topics/CreateTopicModal.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { validators } from '@utils/validators';

const CreateTopicModal = ({ isOpen, onClose, onSubmit, loading, subjectName }) => {
  const [formData, setFormData] = useState({
    topic_name: '',
    notifyDeptHeads: false,
    notifyParticipants: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validators.required(formData.topic_name, 'Topic name');
    if (nameError) {
      setError(nameError);
      return;
    }

    await onSubmit(formData);

    setFormData({
      topic_name: '',
      notifyDeptHeads: false,
      notifyParticipants: false
    });
  };

  const handleClose = () => {
    setFormData({
      topic_name: '',
      notifyDeptHeads: false,
      notifyParticipants: false
    });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create Topic - ${subjectName}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Topic Name"
          name="topic_name"
          value={formData.topic_name}
          onChange={handleChange}
          placeholder="Enter topic name"
          error={error}
          required
          disabled={loading}
        />

        <div className="space-y-3">
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
              Notify department heads
            </span>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              name="notifyParticipants"
              checked={formData.notifyParticipants}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-700">
              Notify students
            </span>
          </label>
        </div>

        <div className="flex gap-3">
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
            Create Topic
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTopicModal;
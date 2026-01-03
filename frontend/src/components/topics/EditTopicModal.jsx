// src/components/topics/EditTopicModal.jsx
import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { validators } from '@utils/validators';

const EditTopicModal = ({ isOpen, onClose, onSubmit, topic, loading }) => {
  const [topicName, setTopicName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && topic) {
      setTopicName(topic.topic_name);
    }
  }, [isOpen, topic]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validators.required(topicName, 'Topic name');
    if (nameError) {
      setError(nameError);
      return;
    }

    if (topicName.trim() === topic.topic_name) {
      setError('New name must be different from current name');
      return;
    }

    await onSubmit(topic.topic_id, topicName.trim());
    handleClose();
  };

  const handleClose = () => {
    setTopicName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Topic Name" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Topic Name"
          value={topicName}
          onChange={(e) => {
            setTopicName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter new topic name"
          error={error}
          required
          disabled={loading}
        />

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
            <Edit className="w-5 h-5" />
            Update Name
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTopicModal;
// src/components/subjects/EditSubjectModal.jsx
import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { validators } from '@utils/validators';

const EditSubjectModal = ({ isOpen, onClose, onSubmit, subject, loading }) => {
  const [subjectName, setSubjectName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && subject) {
      setSubjectName(subject.subject_name);
    }
  }, [isOpen, subject]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validators.required(subjectName, 'Subject name');
    if (nameError) {
      setError(nameError);
      return;
    }

    if (subjectName.trim() === subject.subject_name) {
      setError('New name must be different from current name');
      return;
    }

    await onSubmit(subject.subject_id, subjectName.trim());
    handleClose();
  };

  const handleClose = () => {
    setSubjectName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Subject Name" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Subject Name"
          value={subjectName}
          onChange={(e) => {
            setSubjectName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter new subject name"
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

export default EditSubjectModal;
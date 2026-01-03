// src/components/sets/CreateSetModal.jsx
import { useState } from 'react';
import { Plus, Upload, X, Trash2 } from 'lucide-react';
import Modal from '@components/common/Modal';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { setAPI } from '@api/endpoints/setAPI';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const CreateSetModal = ({ isOpen, onClose, onSubmit, subjectId, topicId, level, loading }) => {
  const [formData, setFormData] = useState({
    threshold_percentage: 50,
    is_negative_marking: false,
    notifyDeptHeads: false,
    notifyParticipants: false
  });
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await setAPI.parseExcelQuestions(subjectId, topicId, file);
      setQuestions(response.data.questions || []);
      toast.success(`${response.data.total_parsed} questions parsed successfully!`);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addManualQuestion = () => {
    setQuestions([...questions, {
      question_type: 'MCQ',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      marks: 1,
      image_url: ''
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    await onSubmit({
      level,
      threshold_percentage: Number(formData.threshold_percentage),
      is_negative_marking: formData.is_negative_marking,
      questions,
      notifyDeptHeads: formData.notifyDeptHeads,
      notifyParticipants: formData.notifyParticipants
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({ threshold_percentage: 50, is_negative_marking: false, notifyDeptHeads: false, notifyParticipants: false });
    setQuestions([]);
    onClose();
  };

  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 1), 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create Set - Level ${level}`} size="xl">
      <div className="space-y-6">
        {/* Set Config */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Threshold %"
            type="number"
            name="threshold_percentage"
            value={formData.threshold_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
          <div className="flex items-end">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer w-full">
              <input
                type="checkbox"
                name="is_negative_marking"
                checked={formData.is_negative_marking}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium">Negative Marking</span>
            </label>
          </div>
        </div>

        {/* Upload Excel */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
            disabled={uploading}
          />
          <label
            htmlFor="excel-upload"
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Upload Excel (Bulk Questions)'}
            </span>
          </label>
        </div>

        {/* Questions List */}
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {questions.map((q, index) => (
            <QuestionForm
              key={index}
              question={q}
              index={index}
              onUpdate={updateQuestion}
              onRemove={removeQuestion}
            />
          ))}
        </div>

        {/* Add Manual Question */}
        <Button variant="outline" fullWidth onClick={addManualQuestion}>
          <Plus className="w-5 h-5" />
          Add Question Manually
        </Button>

        {/* Summary */}
        {questions.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{questions.length}</strong> questions | Total Marks: <strong>{totalMarks}</strong>
            </p>
          </div>
        )}

        {/* Notifications */}
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              name="notifyDeptHeads"
              checked={formData.notifyDeptHeads}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm">Notify department heads</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              name="notifyParticipants"
              checked={formData.notifyParticipants}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm">Notify students</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} fullWidth>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit} loading={loading} fullWidth>
            <Plus className="w-5 h-5" />
            Create Set
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Question Form Component
const QuestionForm = ({ question, index, onUpdate, onRemove }) => {
  const showOptions = ['MCQ', 'MSQ'].includes(question.question_type);

  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800">Question {index + 1}</span>
        <button onClick={() => onRemove(index)} className="p-1 hover:bg-red-50 rounded">
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <select
          value={question.question_type}
          onChange={(e) => onUpdate(index, 'question_type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="MCQ">MCQ</option>
          <option value="MSQ">MSQ</option>
          <option value="NAT">NAT</option>
        </select>
        <input
          type="number"
          value={question.marks}
          onChange={(e) => onUpdate(index, 'marks', e.target.value)}
          placeholder="Marks"
          min="1"
          max="2"
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          value={question.correct_answer}
          onChange={(e) => onUpdate(index, 'correct_answer', e.target.value)}
          placeholder="Answer"
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <textarea
        value={question.question_text}
        onChange={(e) => onUpdate(index, 'question_text', e.target.value)}
        placeholder="Question text"
        rows="2"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />

      {showOptions && (
        <div className="grid grid-cols-2 gap-2">
          {['a', 'b', 'c', 'd'].map(opt => (
            <input
              key={opt}
              type="text"
              value={question[`option_${opt}`]}
              onChange={(e) => onUpdate(index, `option_${opt}`, e.target.value)}
              placeholder={`Option ${opt.toUpperCase()}`}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateSetModal;
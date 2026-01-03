// src/components/sets/UpdateQuestionsModal.jsx
import { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import Input from '@components/common/Input';

const UpdateQuestionsModal = ({ isOpen, onClose, onSubmit, questions, loading }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditData({ ...questions[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData({});
  };

  const handleUpdate = async () => {
    await onSubmit(editData);
    cancelEdit();
  };

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const showOptions = editData.question_type && ['MCQ', 'MSQ'].includes(editData.question_type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Questions" size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {questions.map((q, index) => (
          <div key={q.question_id} className="p-4 border border-gray-200 rounded-lg">
            {editingIndex === index ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-800">Editing Question {index + 1}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button variant="success" size="sm" onClick={handleUpdate} loading={loading}>
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={editData.question_type}
                    onChange={(e) => updateField('question_type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="MSQ">MSQ</option>
                    <option value="NAT">NAT</option>
                  </select>
                  <input
                    type="number"
                    value={editData.marks}
                    onChange={(e) => updateField('marks', e.target.value)}
                    placeholder="Marks"
                    min="1"
                    max="2"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editData.correct_answer}
                    onChange={(e) => updateField('correct_answer', e.target.value)}
                    placeholder="Answer"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <textarea
                  value={editData.question_text}
                  onChange={(e) => updateField('question_text', e.target.value)}
                  placeholder="Question text"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                {showOptions && (
                  <div className="grid grid-cols-2 gap-2">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <input
                        key={opt}
                        type="text"
                        value={editData[`option_${opt}`] || ''}
                        onChange={(e) => updateField(`option_${opt}`, e.target.value)}
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <Input
                  label="Image URL (Optional)"
                  value={editData.image_url || ''}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">Question {index + 1}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {q.question_type}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {q.marks} marks
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit(index)}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>

                <p className="text-gray-700 mb-2">{q.question_text||''}</p>

                {['MCQ', 'MSQ'].includes(q.question_type) && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">A:</span> {q.option_a||''}
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">B:</span> {q.option_b||''}
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">C:</span> {q.option_c||''}
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">D:</span> {q.option_d||''}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Correct Answer:</span>{' '}
                  <span className="font-bold text-green-600">{q.correct_answer||''}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default UpdateQuestionsModal;
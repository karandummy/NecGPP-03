// src/components/topics/ReorderTopicsModal.jsx
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// removed framer-motion to avoid transform conflicts with DnD
import { GripVertical, ArrowUpDown, RotateCcw } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';

const ReorderTopicsModal = ({ isOpen, onClose, onSubmit, topics, loading }) => {
  const [orderedTopics, setOrderedTopics] = useState([]);

  useEffect(() => {
    if (isOpen && topics) {
      setOrderedTopics([...topics]);
    }
  }, [isOpen, topics]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(orderedTopics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedTopics(items);
  };

  const handleReset = () => {
    setOrderedTopics([...topics]);
  };

  const handleSubmit = async () => {
    const topicIds = orderedTopics.map(t => t.topic_id);
    await onSubmit(topicIds);
  };

  const hasChanges = JSON.stringify(orderedTopics.map(t => t.topic_id)) !== 
                     JSON.stringify(topics.map(t => t.topic_id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reorder Topics" size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <ArrowUpDown className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              Drag topics to reorder them
            </span>
          </div>
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="topics">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`
                  space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors
                  ${snapshot.isDraggingOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}
                `}
              >
                {orderedTopics.map((topic, index) => (
                  <Draggable key={topic.topic_id} draggableId={String(topic.topic_id)} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                        className={`
                          flex items-center gap-3 p-4 bg-white rounded-lg border-2 
                          transition-all duration-200
                          ${snapshot.isDragging 
                            ? 'border-primary-500 shadow-2xl' 
                            : 'border-gray-200 hover:border-primary-300 shadow-md'
                          }
                        `}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 font-bold rounded-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{topic.topic_name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            loading={loading}
            disabled={!hasChanges}
            fullWidth
          >
            <ArrowUpDown className="w-5 h-5" />
            Confirm Reorder
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReorderTopicsModal;
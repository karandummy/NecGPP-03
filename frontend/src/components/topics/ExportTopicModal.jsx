// src/components/topics/ExportTopicModal.jsx
import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';

const ExportTopicModal = ({ isOpen, onClose, onExport, topic, loading }) => {
  const [exportType, setExportType] = useState('content');

  const handleExport = async () => {
    await onExport(topic.topic_id, exportType);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Export Data - ${topic?.topic_name}`} 
      size="sm"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Export Type
          </label>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50">
              <input
                type="radio"
                name="exportType"
                value="content"
                checked={exportType === 'content'}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-800">Content Data</span>
                </div>
                <p className="text-sm text-gray-600">
                  Export all sets and questions in this topic
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50">
              <input
                type="radio"
                name="exportType"
                value="attempts"
                checked={exportType === 'attempts'}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-800">Attempts Data</span>
                </div>
                <p className="text-sm text-gray-600">
                  Export all student practice attempts for this topic
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The export will download as an Excel file (.xlsx)
          </p>
        </div>

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
            onClick={handleExport}
            loading={loading}
            fullWidth
          >
            <Download className="w-5 h-5" />
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportTopicModal;
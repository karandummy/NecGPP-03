// src/components/sets/ExportSetModal.jsx
import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';

const ExportSetModal = ({ isOpen, onClose, onExport, set, loading }) => {
  const [exportType, setExportType] = useState('content');

  const handleExport = async () => {
  if (!set?.set_id) return;
  await onExport(set.set_id, exportType);  // Calls the parent's handleExport
};

  const title = set
    ? `Export Set ${set.display_order}`
    : 'Export Set';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Export Type
          </label>

          <div className="space-y-3">
            {/* Content Export */}
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
                  Export set details and all questions with options, answers, and marks.
                </p>
              </div>
            </label>

            {/* Attempts Export */}
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
                  Export student practice attempts, best scores, total attempts, and last attempt date.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The file will download as an Excel (.xlsx) named{' '}
            <code className="font-mono bg-blue-100 px-1 rounded">
              set_{set?.set_id || 'ID'}_{exportType}.xlsx
            </code>
          </p>
        </div>

        {/* Action Buttons */}
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
            disabled={!set?.set_id}
          >
            <Download className="w-5 h-5" />
            Export Set
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportSetModal;
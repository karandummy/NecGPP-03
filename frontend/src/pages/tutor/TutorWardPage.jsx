// src/pages/tutor/TutorWardPage.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, UserMinus, Search, Filter, X,
  CheckCircle, AlertCircle, GraduationCap, Mail,
  Calendar, Building2, Plus, Trash2, RefreshCw
} from 'lucide-react';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';
import MainLayout from '@components/layout/MainLayout';
import { tutorAPI } from '@api/endpoints/tutorAPI';
import { userAPI } from '@api/endpoints/userAPI';
import { parseError } from '@utils/errorHandler';
import toast from 'react-hot-toast';

const TutorWardPage = () => {
  const [loading, setLoading] = useState(true);
  const [myStudents, setMyStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [departments, setDepartments] = useState([]);
  const [batches] = useState(generateBatchYears());
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    await Promise.all([
      fetchMyStudents(),
      fetchDepartments()
    ]);
  };

  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      const response = await tutorAPI.getMyStudents();
      setMyStudents(response.data.students || []);
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await userAPI.getDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchUnassignedStudents = async () => {
    if (!filterBatch || !filterDept) {
      toast.error('Please select both batch and department');
      return;
    }

    try {
      setAssignLoading(true);
      const response = await tutorAPI.getUnassignedStudents(filterBatch, filterDept);
      setUnassignedStudents(response.data.students || []);
      setShowAddDialog(true);
      setSearchTerm(''); // Reset search when opening dialog
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      setAssignLoading(true);
      const studentIds = Array.from(selectedStudents);
      await tutorAPI.bulkAssignStudents(studentIds);
      
      toast.success(`${studentIds.length} student${studentIds.length > 1 ? 's' : ''} assigned successfully`);
      setShowAddDialog(false);
      setSelectedStudents(new Set());
      setUnassignedStudents([]);
      setFilterBatch('');
      setFilterDept('');
      fetchMyStudents();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      setAssignLoading(true);
      await tutorAPI.removeStudent(studentToRemove.student_id);
      
      toast.success('Student removed from your ward');
      setShowRemoveDialog(false);
      setStudentToRemove(null);
      fetchMyStudents();
    } catch (error) {
      toast.error(parseError(error).message);
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredUnassignedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredUnassignedStudents.map(s => s.student_id)));
    }
  };

  const filteredMyStudents = myStudents.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnassignedStudents = unassignedStudents.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Spinner size="xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Page Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              My Tutor Wards
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Manage and track your assigned students
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-8 py-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <p className="text-3xl font-bold text-white">{myStudents.length}</p>
              <p className="text-xs text-primary-100 mt-1 font-medium">Total Students</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchMyStudents}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search & Filter Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Filters & Search</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Search */}
              <div className="lg:col-span-5">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Search Students
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
              
              {/* Batch */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Batch Year
                </label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
              
              {/* Department */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.dept_code}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Add Button */}
              <div className="lg:col-span-1 flex items-end">
                <Button
                  variant="primary"
                  onClick={fetchUnassignedStudents}
                  loading={assignLoading}
                  disabled={!filterBatch || !filterDept}
                  className="w-full"
                  size="lg"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Assigned Students ({filteredMyStudents.length})
              </h3>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear Search
                </button>
              )}
            </div>
          </div>
          
          {filteredMyStudents.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'No students match your search criteria. Try adjusting your filters.' 
                  : 'You haven\'t been assigned any students yet. Use the filters above to find and assign students to your ward.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
              {filteredMyStudents.map((student, index) => (
                <StudentCard
                  key={student.student_id}
                  student={student}
                  index={index}
                  onRemove={() => {
                    setStudentToRemove(student);
                    setShowRemoveDialog(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Students Dialog */}
      <AddStudentsDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setUnassignedStudents([]);
          setSelectedStudents(new Set());
          setSearchTerm('');
        }}
        students={filteredUnassignedStudents}
        selectedStudents={selectedStudents}
        onToggleStudent={toggleStudentSelection}
        onToggleSelectAll={toggleSelectAll}
        onAssign={handleBulkAssign}
        loading={assignLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        batch={filterBatch}
        department={departments.find(d => d.dept_id == filterDept)?.dept_code}
      />

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onClose={() => {
          setShowRemoveDialog(false);
          setStudentToRemove(null);
        }}
        onConfirm={handleRemoveStudent}
        loading={assignLoading}
        student={studentToRemove}
      />
    </MainLayout>
  );
};

// Generate batch years from 2000 to current year
const generateBatchYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year.toString());
  }
  return years;
};

// Student Card Component with Animation
const StudentCard = ({ student, index, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-primary-300 transition-all duration-300"
  >
    <div className="flex flex-col items-center text-center mb-4">
      <div className="relative mb-3">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      
      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
        {student.full_name}
      </h4>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg p-2">
        <Mail className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
        <span className="truncate">{student.email}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white rounded-lg p-2">
          <Calendar className="w-3.5 h-3.5 text-primary-500" />
          <span className="font-medium">{student.batch_year}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white rounded-lg p-2">
          <Building2 className="w-3.5 h-3.5 text-primary-500" />
          <span className="font-medium truncate">{student.dept_name}</span>
        </div>
      </div>
    </div>
    
    <Button
      variant="danger"
      size="sm"
      onClick={onRemove}
      className="w-full group-hover:shadow-md transition-shadow"
    >
      <UserMinus className="w-3.5 h-3.5" />
      Remove
    </Button>
  </motion.div>
);

// Add Students Dialog with Better UI
const AddStudentsDialog = ({
  isOpen,
  onClose,
  students,
  selectedStudents,
  onToggleStudent,
  onToggleSelectAll,
  onAssign,
  loading,
  searchTerm,
  onSearchChange,
  batch,
  department
}) => {
  if (!isOpen) return null;

  const allSelected = students.length > 0 && selectedStudents.size === students.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Add Students to Ward</h3>
                <p className="text-sm text-primary-100 mt-0.5">
                  {batch} • {department}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Search & Select All */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {students.length > 0 && (
              <label className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Select All
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
          {students.length === 0 ? (
            <div className="flex items-center justify-center h-full p-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Students Available</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {searchTerm 
                    ? 'No students found matching your search criteria' 
                    : 'No unassigned students found for the selected batch and department'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
              {students.map((student) => (
                <label
                  key={student.student_id}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border-2
                    ${selectedStudents.has(student.student_id)
                      ? 'bg-primary-50 border-primary-400 shadow-md scale-[1.02]'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.student_id)}
                    onChange={() => onToggleStudent(student.student_id)}
                    className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 truncate flex-1">
                        {student.full_name}
                      </h4>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 truncate">{student.email}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{student.batch_year}</span>
                        <span>•</span>
                        <span className="truncate">{student.dept_name}</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary-600" />
            <p className="text-sm font-semibold text-gray-900">
              {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onAssign}
              loading={loading}
              disabled={selectedStudents.size === 0}
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Assign Students {selectedStudents.size > 0 && `(${selectedStudents.size})`}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Confirm Remove Dialog
const ConfirmDialog = ({ isOpen, onClose, onConfirm, loading, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Remove Student from Ward?
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Are you sure you want to remove <strong className="text-gray-900">{student.full_name}</strong> from your ward? 
            </p>
            
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">Important Notice</p>
                  <p className="text-xs text-orange-800 leading-relaxed">
                    This action cannot be undone. The student will become unassigned and you'll need to reassign them if needed later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} size="lg">
            <Trash2 className="w-4 h-4" />
            Remove Student
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorWardPage;
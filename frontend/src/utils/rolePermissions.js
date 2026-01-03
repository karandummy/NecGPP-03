// src/utils/rolePermissions.js
import { USER_ROLES } from './constants';

export const rolePermissions = {
  // Check if user can create subjects
  canCreateSubject: (role) => {
    return [USER_ROLES.ADMIN, USER_ROLES.DEPT_HEAD].includes(role);
  },

  // Check if user can edit subject (based on canEdit flag from backend)
  canEditSubject: (subject, role) => {
    if (role === USER_ROLES.ADMIN) return true;
    if (role === USER_ROLES.DEPT_HEAD) return subject.canEdit === true;
    return false;
  },

  // Check if user has super access (can delete/leave)
  hasSuperAccess: (subject, role) => {
    if (role === USER_ROLES.ADMIN) return true;
    if (role === USER_ROLES.DEPT_HEAD) return subject.superAccess === true;
    return false;
  },

  // Check if user can manage members
  canManageMembers: (subject, role) => {
    return rolePermissions.canEditSubject(subject, role);
  },

  // Check if user can lock/unlock subject
  canToggleLock: (subject, role) => {
    return rolePermissions.canEditSubject(subject, role);
  },

  // Check if user can toggle dept subject lock (Dept Head specific)
  canToggleDeptLock: (subject, role) => {
    return role === USER_ROLES.DEPT_HEAD && subject.canEdit === true;
  },

  // Check if user can request access
  canRequestAccess: (role) => {
    return role === USER_ROLES.DEPT_HEAD;
  },

  // Check if user can view member list
  canViewMembers: (role) => {
    return [USER_ROLES.ADMIN, USER_ROLES.DEPT_HEAD].includes(role);
  }
};
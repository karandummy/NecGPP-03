import { HTTP_STATUS } from './constants';

export const parseError = (error) => {
  // Network error
  if (!error.response) {
    return {
      message: 'Network error. Please check your internet connection.',
      type: 'network'
    };
  }

  const { status, data } = error.response;

  // Handle specific status codes
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return {
        message: data?.message || 'Session expired. Please login again.',
        type: 'auth',
        shouldLogout: true
      };

    case HTTP_STATUS.FORBIDDEN:
      return {
        message: data?.message || 'You do not have permission to perform this action.',
        type: 'permission'
      };

    case HTTP_STATUS.NOT_FOUND:
      return {
        message: data?.message || 'Requested resource not found.',
        type: 'notfound'
      };

    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return {
        message: data?.message || 'Too many requests. Please try again later.',
        type: 'ratelimit',
        timer: data?.timer
      };

    case HTTP_STATUS.BAD_REQUEST:
      return {
        message: data?.message || 'Invalid request. Please check your input.',
        type: 'validation'
      };

    case HTTP_STATUS.SERVER_ERROR:
    default:
      return {
        message: 'Something went wrong. Please try again later.',
        type: 'server'
      };
  }
};

export const handleAPIError = (error, fallbackMessage = 'An error occurred') => {
  const parsed = parseError(error);
  return parsed.message || fallbackMessage;
};
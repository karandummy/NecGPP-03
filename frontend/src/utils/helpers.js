export const helpers = {
  // Debounce function
  debounce: (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle function
  throttle: (func, limit = 300) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Deep clone
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Generate unique ID
  generateId: () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if object is empty
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },

  // Sleep function
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }
};
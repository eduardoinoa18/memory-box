export { auth, db, storage, functions } from './firebase.js';

// Utility functions that can be shared across all apps
export const checkAdminRole = async (user) => {
  if (!user) return false;
  const token = await user.getIdTokenResult();
  return token.claims.admin === true;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

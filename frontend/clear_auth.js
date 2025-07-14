// Run this in browser console to clear authentication and force re-login
console.log('🔄 Clearing authentication data...');

// Clear localStorage
localStorage.removeItem('auth_token');
localStorage.removeItem('userEmail');
console.log('✅ localStorage cleared');

// Clear cookies
document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
console.log('✅ Cookies cleared');

// Redirect to login
window.location.href = '/login';
console.log('🚀 Redirecting to login...');

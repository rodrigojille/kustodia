require('dotenv').config();

async function investigateDirectBackend() {
  console.log('🔍 INVESTIGATING DIRECT BACKEND APPROACH');
  console.log('=========================================');
  
  // 1. CHECK BACKEND CORS CONFIGURATION
  console.log('\n📋 1. BACKEND CORS ANALYSIS');
  console.log('============================');
  
  console.log('Expected CORS setup for direct calls:');
  console.log('- Origin: http://localhost:3000 (frontend)');
  console.log('- Target: http://localhost:4000 (backend)');
  console.log('- Headers: Authorization, Content-Type');
  console.log('- Methods: GET, POST, PATCH, DELETE');
  
  // 2. SIMULATE THE EXACT authFetch CALL
  console.log('\n🧪 2. SIMULATING authFetch("payments") CALL');
  console.log('==============================================');
  
  const endpoint = 'payments';
  let cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  cleanEndpoint = cleanEndpoint.replace(/^api\//, ''); // Remove 'api/' prefix
  
  console.log('Original endpoint:', endpoint);
  console.log('Cleaned endpoint:', cleanEndpoint);
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const directUrl = `${backendUrl}/api/${cleanEndpoint}`;
  console.log('Final URL:', directUrl);
  
  // 3. TEST BACKEND CONNECTIVITY
  console.log('\n🌐 3. TESTING BACKEND CONNECTIVITY');
  console.log('===================================');
  
  try {
    console.log('Testing basic backend connectivity...');
    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No auth token for basic connectivity test
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('✅ Backend is reachable - 401 means auth is required (expected)');
    } else if (response.status === 200) {
      console.log('✅ Backend is reachable - 200 means no auth required (unexpected)');
    } else {
      console.log('⚠️ Unexpected status code');
    }
    
  } catch (error) {
    console.error('❌ Backend connectivity failed:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('🔍 CORS Error detected - backend not allowing frontend origin');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🔍 Connection refused - backend not running on port 4000');
    } else if (error.message.includes('fetch')) {
      console.log('🔍 Fetch error - network or DNS issue');
    }
  }
  
  // 4. TEST WITH MOCK JWT TOKEN
  console.log('\n🔐 4. TESTING WITH MOCK JWT TOKEN');
  console.log('==================================');
  
  // Create a mock JWT token structure (not valid, just for testing)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  try {
    console.log('Testing with mock Authorization header...');
    const authResponse = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      }
    });
    
    console.log('Auth response status:', authResponse.status);
    
    if (authResponse.status === 401) {
      console.log('✅ Backend is processing auth headers - 401 means token invalid (expected)');
    } else if (authResponse.status === 403) {
      console.log('✅ Backend is processing auth headers - 403 means token valid but no permission');
    } else {
      console.log('⚠️ Unexpected auth response');
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
  }
  
  // 5. CHECK BACKEND CORS MIDDLEWARE
  console.log('\n🛡️ 5. BACKEND CORS CONFIGURATION CHECK');
  console.log('=======================================');
  
  console.log('Expected CORS middleware in backend:');
  console.log('- app.use(cors({ origin: "http://localhost:3000", credentials: true }))');
  console.log('- Or app.use(cors({ origin: true })) for development');
  console.log('');
  console.log('Check backend/src/index.ts or app.ts for CORS setup');
  
  // 6. RECOMMENDATIONS
  console.log('\n✅ 6. INVESTIGATION RESULTS & RECOMMENDATIONS');
  console.log('==============================================');
  
  console.log('Based on this investigation:');
  console.log('');
  console.log('If backend is reachable with 401:');
  console.log('  ✅ Direct backend approach can work');
  console.log('  🔧 Need to verify JWT token is valid');
  console.log('  🔧 Need to check CORS allows frontend origin');
  console.log('');
  console.log('If backend is not reachable:');
  console.log('  ❌ Direct backend approach won\'t work');
  console.log('  🔧 Need to use Next.js proxy approach');
  console.log('  🔧 Or fix backend CORS configuration');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check browser Network tab for actual error messages');
  console.log('2. Verify backend CORS configuration');
  console.log('3. Test with real JWT token from localStorage');
  console.log('4. Consider switching to proxy approach if CORS issues persist');
}

// Run the investigation
investigateDirectBackend();

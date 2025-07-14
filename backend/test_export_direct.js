const fetch = require('node-fetch');
const fs = require('fs');

const testExportDirect = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJyb2RyaWdvamlsbGU2QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsIndhbGxldF9hZGRyZXNzIjoiMHg0ODZCODhDYTg3NTMzMjk0RkI0NTI0NzM4NzE2OWYwODFmMzEwMmZmIiwiaWF0IjoxNzUyNTA2ODI3LCJleHAiOjE3NTMxMTE2Mjd9.1qVluyyJV8eItWZYKjBGv7XQ0nCk77ZcHxWJtyHyY8I';

  console.log('🧪 Testing Export Endpoint Directly...\n');

  try {
    // Test PDF Export
    console.log('📄 Testing PDF Export...');
    const pdfResponse = await fetch('http://localhost:4000/api/analytics/export?format=pdf&period=current_month', {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('PDF Response Status:', pdfResponse.status);
    console.log('PDF Response Headers:', Object.fromEntries(pdfResponse.headers.entries()));
    
    if (pdfResponse.ok) {
      const pdfContent = await pdfResponse.text();
      console.log('PDF Content Length:', pdfContent.length);
      console.log('PDF Content Preview:', pdfContent.substring(0, 200));
      
      // Save to file for testing
      fs.writeFileSync('test-export.pdf', pdfContent);
      console.log('✅ PDF saved as test-export.pdf');
    }

    console.log('\n---\n');

    // Test Excel Export
    console.log('📊 Testing Excel Export...');
    const excelResponse = await fetch('http://localhost:4000/api/analytics/export?format=excel&period=current_month', {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('Excel Response Status:', excelResponse.status);
    console.log('Excel Response Headers:', Object.fromEntries(excelResponse.headers.entries()));
    
    if (excelResponse.ok) {
      const excelContent = await excelResponse.text();
      console.log('Excel Content Length:', excelContent.length);
      console.log('Excel Content Preview:', excelContent.substring(0, 200));
      
      // Save to file for testing
      fs.writeFileSync('test-export.csv', excelContent);
      console.log('✅ CSV saved as test-export.csv');
    }

  } catch (error) {
    console.error('❌ Export test error:', error.message);
  }
};

testExportDirect();

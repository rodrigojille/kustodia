import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Production credentials
const PROD_API_KEY = process.env.JUNO_PROD_API_KEY!;
const PROD_API_SECRET = process.env.JUNO_PROD_API_SECRET!;
const PROD_BASE_URL = process.env.JUNO_PROD_BASE_URL!;

// Staging credentials
const STAGE_API_KEY = process.env.JUNO_STAGE_API_KEY!;
const STAGE_API_SECRET = process.env.JUNO_STAGE_API_SECRET!;
const STAGE_BASE_URL = process.env.JUNO_STAGE_BASE_URL!;

interface TestResult {
  endpoint: string;
  method: string;
  environment: string;
  status: 'SUCCESS' | 'FAILED';
  statusCode?: number;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];

function createSignature(apiSecret: string, nonce: string, method: string, path: string, body: string = '') {
  const message = nonce + method + path + body;
  return crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
}

async function testEndpoint(
  environment: 'production' | 'staging',
  endpoint: string,
  method: 'GET' | 'POST',
  path: string,
  body: any = {}
): Promise<TestResult> {
  const isProduction = environment === 'production';
  const apiKey = isProduction ? PROD_API_KEY : STAGE_API_KEY;
  const apiSecret = isProduction ? PROD_API_SECRET : STAGE_API_SECRET;
  const baseUrl = isProduction ? PROD_BASE_URL : STAGE_BASE_URL;
  
  const url = `${baseUrl}${path}`;
  const nonce = Date.now().toString();
  const jsonBody = method === 'POST' ? JSON.stringify(body) : '';
  const signature = createSignature(apiSecret, nonce, method, path, jsonBody);
  const authHeader = `Bitso ${apiKey}:${nonce}:${signature}`;

  console.log(`\n=== Testing ${endpoint} (${environment.toUpperCase()}) ===`);
  console.log(`${method} ${url}`);
  console.log(`Auth: ${authHeader}`);
  if (method === 'POST') console.log(`Body: ${jsonBody}`);

  try {
    const config = {
      method: method.toLowerCase(),
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      ...(method === 'POST' && { data: jsonBody })
    };

    const response = await axios(config);
    
    console.log(`✅ SUCCESS - Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    return {
      endpoint,
      method,
      environment,
      status: 'SUCCESS',
      statusCode: response.status,
      response: response.data
    };

  } catch (error: any) {
    console.log(`❌ FAILED - Status: ${error.response?.status || 'Network Error'}`);
    
    if (error.response) {
      console.log(`Error Response:`, JSON.stringify(error.response.data, null, 2));
      
      return {
        endpoint,
        method,
        environment,
        status: 'FAILED',
        statusCode: error.response.status,
        error: error.response.data?.error?.message || error.message,
        response: error.response.data
      };
    } else {
      console.log(`Network Error:`, error.message);
      
      return {
        endpoint,
        method,
        environment,
        status: 'FAILED',
        error: error.message
      };
    }
  }
}

async function testAllEndpoints() {
  console.log('🧪 COMPREHENSIVE JUNO API ENDPOINT TESTING');
  console.log('==========================================');
  console.log(`Production API Key: ${PROD_API_KEY}`);
  console.log(`Staging API Key: ${STAGE_API_KEY}`);
  console.log('');

  // Test endpoints in both environments - ALL endpoints we actually use
  const endpoints = [
    {
      name: 'List SPEI Deposits',
      method: 'GET' as const,
      path: '/spei/v1/deposits/'
    },
    {
      name: 'Create CLABE',
      method: 'POST' as const,
      path: '/mint_platform/v1/clabes',
      body: {}
    },
    {
      name: 'Get Registered Bank Accounts',
      method: 'GET' as const,
      path: '/mint_platform/v1/accounts/banks'
    },
    {
      name: 'MXNB Redemption (SPEI)',
      method: 'POST' as const,
      path: '/mint_platform/v1/redemptions',
      body: {
        amount: 1,
        destination_bank_account_id: 'test-bank-account-id',
        asset: 'mxn'
      }
    },
    {
      name: 'MXNB Withdrawal (Crypto)',
      method: 'POST' as const,
      path: '/mint_platform/v1/withdrawals',
      body: {
        amount: 1,
        asset: 'MXNB',
        address: '0xC8d5563BF6df6C5E5F6DFc42BeEC1CC8598aC38F',
        blockchain: 'ARBITRUM'
      }
    },
    {
      name: 'Register Bank Account',
      method: 'POST' as const,
      path: '/mint_platform/v1/accounts/banks',
      body: {
        clabe: '123456789012345678',
        account_holder_name: 'Test Account Holder'
      }
    }
  ];

  // Test each endpoint in both environments
  for (const endpoint of endpoints) {
    // Test in staging first
    const stagingResult = await testEndpoint(
      'staging',
      endpoint.name,
      endpoint.method,
      endpoint.path,
      endpoint.body
    );
    results.push(stagingResult);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test in production
    const productionResult = await testEndpoint(
      'production',
      endpoint.name,
      endpoint.method,
      endpoint.path,
      endpoint.body
    );
    results.push(productionResult);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

function generateSummaryReport() {
  console.log('\n\n📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('=====================================');

  // Group by environment
  const stagingResults = results.filter(r => r.environment === 'staging');
  const productionResults = results.filter(r => r.environment === 'production');

  console.log('\n🟦 STAGING ENVIRONMENT RESULTS:');
  console.log('API Key:', STAGE_API_KEY);
  console.log('Base URL:', STAGE_BASE_URL);
  stagingResults.forEach(result => {
    const status = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${status} ${result.method} ${result.endpoint} - ${result.status} ${result.statusCode ? `(${result.statusCode})` : ''}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  });

  console.log('\n🟥 PRODUCTION ENVIRONMENT RESULTS:');
  console.log('API Key:', PROD_API_KEY);
  console.log('Base URL:', PROD_BASE_URL);
  productionResults.forEach(result => {
    const status = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${status} ${result.method} ${result.endpoint} - ${result.status} ${result.statusCode ? `(${result.statusCode})` : ''}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  });

  // Compare environments
  console.log('\n🔍 ENVIRONMENT COMPARISON:');
  const endpointNames = [...new Set(results.map(r => r.endpoint))];
  
  endpointNames.forEach(endpointName => {
    const staging = stagingResults.find(r => r.endpoint === endpointName);
    const production = productionResults.find(r => r.endpoint === endpointName);
    
    console.log(`\n📍 ${endpointName}:`);
    console.log(`   Staging: ${staging?.status === 'SUCCESS' ? '✅' : '❌'} ${staging?.status} ${staging?.statusCode ? `(${staging.statusCode})` : ''}`);
    console.log(`   Production: ${production?.status === 'SUCCESS' ? '✅' : '❌'} ${production?.status} ${production?.statusCode ? `(${production.statusCode})` : ''}`);
    
    if (staging?.status !== production?.status) {
      console.log(`   🚨 MISMATCH: Staging ${staging?.status}, Production ${production?.status}`);
      if (production?.error) console.log(`   Production Error: ${production.error}`);
    }
  });

  // Generate support ticket information
  console.log('\n\n📧 JUNO SUPPORT TICKET INFORMATION');
  console.log('==================================');
  console.log('Subject: Production API Permissions Issue - Multiple Endpoints');
  console.log('');
  console.log('Dear Juno Support,');
  console.log('');
  console.log('We have conducted comprehensive testing of our Juno API integration');
  console.log('and identified permission issues in our production environment.');
  console.log('');
  console.log('ACCOUNT DETAILS:');
  console.log(`- Production API Key: ${PROD_API_KEY}`);
  console.log(`- Staging API Key: ${STAGE_API_KEY}`);
  console.log('');
  console.log('ISSUE SUMMARY:');
  
  const failedProduction = productionResults.filter(r => r.status === 'FAILED');
  const successfulStaging = stagingResults.filter(r => r.status === 'SUCCESS');
  
  if (failedProduction.length > 0) {
    console.log('The following endpoints FAIL in production but work in staging:');
    failedProduction.forEach(result => {
      const stagingEquivalent = stagingResults.find(r => r.endpoint === result.endpoint);
      if (stagingEquivalent?.status === 'SUCCESS') {
        console.log(`- ${result.method} ${result.endpoint}: ${result.statusCode} ${result.error}`);
      }
    });
  }
  
  console.log('');
  console.log('WORKING ENDPOINTS (both environments):');
  productionResults.filter(r => r.status === 'SUCCESS').forEach(result => {
    console.log(`- ✅ ${result.method} ${result.endpoint}`);
  });
  
  console.log('');
  console.log('Please review our production account permissions and enable the');
  console.log('necessary permissions for the failing endpoints.');
  console.log('');
  console.log('Thank you for your assistance.');
}

async function main() {
  try {
    await testAllEndpoints();
    generateSummaryReport();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

main().catch(console.error);

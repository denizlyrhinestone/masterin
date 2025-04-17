import fetch from 'node-fetch';

// Configuration
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://your-deployment-url.vercel.app';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'your-admin-key';

async function verifyDeployment() {
  console.log('Starting deployment verification...');
  
  // Test 1: Basic application availability
  try {
    console.log('\n1. Checking if application is accessible...');
    const homeResponse = await fetch(DEPLOYMENT_URL);
    console.log(`Status: ${homeResponse.status}`);
    if (homeResponse.ok) {
      console.log('✅ Application is accessible');
    } else {
      console.error(`❌ Application returned status: ${homeResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to access application:', error.message);
  }
  
  // Test 2: API Health Check
  try {
    console.log('\n2. Testing API health endpoint...');
    const healthResponse = await fetch(`${DEPLOYMENT_URL}/api/health`);
    console.log(`Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ API health check successful');
      console.log('Response:', data);
    } else {
      console.error(`❌ API health check returned status: ${healthResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to test API health:', error.message);
  }
  
  // Test 3: Admin API without authentication
  try {
    console.log('\n3. Testing admin API without authentication...');
    const unauthResponse = await fetch(`${DEPLOYMENT_URL}/api/admin/health`);
    console.log(`Status: ${unauthResponse.status}`);
    if (unauthResponse.status === 401) {
      console.log('✅ Admin API correctly returned 401 Unauthorized');
    } else if (unauthResponse.status === 404) {
      console.error('❌ Admin API returned 404 Not Found - route may be missing');
    } else {
      console.error(`❌ Expected 401, got: ${unauthResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to test admin API without auth:', error.message);
  }
  
  // Test 4: Admin API with authentication
  try {
    console.log('\n4. Testing admin API with authentication...');
    const authResponse = await fetch(`${DEPLOYMENT_URL}/api/admin/health`, {
      headers: {
        'x-admin-key': ADMIN_API_KEY
      }
    });
    console.log(`Status: ${authResponse.status}`);
    if (authResponse.ok) {
      const data = await authResponse.json();
      console.log('✅ Admin API authenticated successfully');
      console.log('Response:', data);
    } else {
      console.error(`❌ Admin API returned status: ${authResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to test admin API with auth:', error.message);
  }
  
  // Test 5: AI Tutor API
  try {
    console.log('\n5. Testing AI tutor API...');
    const aiResponse = await fetch(`${DEPLOYMENT_URL}/api/ai-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, can you help me with a math problem?' }]
      })
    });
    console.log(`Status: ${aiResponse.status}`);
    if (aiResponse.ok) {
      const data = await aiResponse.json();
      console.log('✅ AI tutor responded successfully');
      console.log('Response preview:', data.content ? data.content.substring(0, 50) + '...' : 'No content');
    } else {
      console.error(`❌ AI tutor returned status: ${aiResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to test AI tutor:', error.message);
  }
  
  console.log('\nVerification complete!');
}

verifyDeployment();

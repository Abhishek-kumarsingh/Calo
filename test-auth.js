// Simple test to check authentication
const { getToken } = require('next-auth/jwt');

async function testAuth() {
  console.log('Testing NextAuth configuration...');
  
  // Check environment variables
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Set' : 'Not set');
  
  // Test token generation
  try {
    const token = await getToken({ 
      req: { 
        headers: { 
          cookie: 'next-auth.session-token=test' 
        } 
      },
      secret: process.env.NEXTAUTH_SECRET 
    });
    console.log('Token test result:', token ? 'Success' : 'No token');
  } catch (error) {
    console.error('Token test error:', error.message);
  }
}

testAuth(); 
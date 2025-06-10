// Test script to verify HR assistant functionality
const fetch = require('node-fetch');

async function testEmployeeQuery(name) {
  console.log(`\n=== Testing query for employee: ${name} ===`);
  
  try {
    // Test 1: Direct database query
    console.log('\n1. Testing direct database query...');
    const dbResponse = await fetch('http://localhost:3000/api/test-db');
    const dbData = await dbResponse.json();
    console.log('Database connection successful');
    
    // Find the employee in the database
    const employee = dbData.people.find(p => 
      p.name && p.name.toLowerCase().includes(name.toLowerCase())
    );
    
    if (employee) {
      console.log(`Found employee in database:`, {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        enneagram_type: employee.enneagram_type
      });
    } else {
      console.log(`Employee "${name}" not found in database. Available employees:`);
      console.log(dbData.people.map(p => `- ${p.name} (${p.role})`).join('\n'));
      return;
    }
    
    // Test 2: Test HR Intelligence API
    console.log('\n2. Testing HR Intelligence API...');
    const hrResponse = await fetch('http://localhost:3000/api/test-hr-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: `What is ${name}'s enneagram type?` })
    });
    
    if (!hrResponse.ok) {
      throw new Error(`HTTP error! status: ${hrResponse.status}`);
    }
    
    const hrData = await hrResponse.json();
    console.log('HR Intelligence Response:', JSON.stringify(hrData, null, 2));
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test with a sample employee name
testEmployeeQuery('Rachel Green');

// Simple test script to check HR queries
const testQueries = [
  "Who should I put on a new AI project team?",
  "Tell me about Michael Chen",
  "Who works in engineering?",
  "What are the conflict resolution guidelines?",
  "Show me employees with React skills"
];

async function testHRIntelligence() {
  for (const query of testQueries) {
    console.log(`\n\nTesting query: "${query}"`);
    console.log("=".repeat(60));
    
    try {
      const response = await fetch("http://localhost:3000/api/test-hr-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: query }),
      });
      
      const data = await response.json();
      console.log("Intent detected:", data.results?.intent?.intent);
      console.log("Entities found:", data.results?.intent?.entities);
      console.log("People in context:", data.results?.context?.people?.length || 0);
      console.log("Documents in context:", data.results?.context?.documents?.length || 0);
      console.log("Total employees in DB:", data.results?.directQueries?.totalEmployees);
      
      if (data.results?.directQueries?.peopleByName) {
        console.log("Direct name queries:", data.results.directQueries.peopleByName);
      }
      
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

// Run the test
testHRIntelligence();

// Check database contents
fetch('http://localhost:3000/api/test-db')
  .then(r => r.json())
  .then(data => {
    console.log('People in database:');
    data.people.forEach(p => {
      console.log(`- ${p.name} (${p.role}) - Enneagram: ${p.enneagram_type || 'Not set'}`);
    });
    console.log(`\nTotal people: ${data.peopleCount}`);
    console.log(`Total departments: ${data.departmentCount}`);
    console.log(`Total documents: ${data.documentCount}`);
  })
  .catch(console.error);

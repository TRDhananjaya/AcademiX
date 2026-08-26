const fetch = require('node-fetch'); // or use dynamic import if Node > 18

async function testRAG(overall, score1, score2, score3, incorrect1) {
  const requestBody = {
    studentId: 'st031',
    overall_score: overall,
    lessonId: '6a33c6b4d67ba7d81f63916b',
    modules_data: [
      { module_id: '1.1', score: score1, incorrect_questions: incorrect1 },
      { module_id: '1.2', score: score2, incorrect_questions: [] },
      { module_id: '1.3', score: score3, incorrect_questions: [] }
    ]
  };

  console.log(`Testing RAG API with overall: ${overall}`);
  const startTime = Date.now();
  try {
    const response = await fetch('http://localhost:8000/generate_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    const timeTaken = Date.now() - startTime;
    console.log(`Status: ${response.status} in ${timeTaken}ms`);
    if(response.ok) {
       console.log('SUCCESS');
    } else {
       console.log('FAILED');
    }
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}

async function main() {
  await testRAG(49.16, 0, 0, 0, []);
  await testRAG(50, 50, 50, 50, ['What is data?']);
  await testRAG(98.33, 95, 100, 100, ['Q1']);
}

main();

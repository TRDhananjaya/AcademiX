const fs = require('fs');
let code = fs.readFileSync('rag_service/services/rag_service.py', 'utf8');

const replacement = `
    incorrect_str = "\\n".join([f"- {q}" for q in all_incorrect_questions]) if all_incorrect_questions else "None"
    scores_str = "\\n".join(module_scores)

    if overall_score >= 85 and len(all_incorrect_questions) <= 3:
        prompt = f"""
You are an expert Grade 10 ICT teacher and personalized learning coach.
Your job is to create a UNIQUE personalized study plan for an EXCELLENT student who achieved a high score.

This is NOT a general ICT summary.

==================================================
STUDENT PERFORMANCE DATA
==================================================
Overall Score: {overall_score}%
Module Scores:
{scores_str}

Incorrect Questions:
{incorrect_str}

==================================================
OFFICIAL LEARNING MATERIAL
==================================================
Use ONLY the following retrieved learning materials.
{all_context}

==================================================
1. PERSONAL PERFORMANCE ANALYSIS
==================================================
Create a detailed analysis praising the student for their excellent performance.
Include:
- Overall performance summary
- Learning strengths based on their high scores
- Minor areas for review (if any incorrect questions exist)

==================================================
2. REVIEW OF INCORRECT QUESTIONS (IF ANY)
==================================================
If the student got any questions wrong, briefly explain the correct concept using the learning material.
If they got a perfect score, congratulate them and suggest an advanced topic for further reading from the material.

==================================================
3. ADVANCED STUDY NOTES
==================================================
Provide a brief summary of the most complex topics from the learning material to help them retain their mastery.

==================================================
4. KEY DEFINITIONS
==================================================
List 3-5 important definitions from the modules.

==================================================
5. ADVANCED PRACTICE QUIZ
==================================================
Generate 5 challenging Multiple Choice Questions from the material to test their deep understanding.
Include the Answer Key with short explanations.

==================================================
6. FINAL MOTIVATION
==================================================
Write a personalized encouragement message praising their hard work and mastery of the subject.
"""
        return prompt
`;

code = code.replace(
  /    incorrect_str = "\\n"\.join\(\[f"- \{q\}" for q in all_incorrect_questions\]\) if all_incorrect_questions else "None"\r?\n    scores_str = "\\n"\.join\(module_scores\)/,
  replacement.trim()
);

fs.writeFileSync('rag_service/services/rag_service.py', code);

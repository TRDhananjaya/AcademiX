const fs = require('fs');
let code = fs.readFileSync('rag_service/services/rag_service.py', 'utf8');

const target1 = `    incorrect_str = "\\n".join([f"- {q}" for q in all_incorrect_questions]) if all_incorrect_questions else "None"
    scores_str = "\\n".join(module_scores)`;

const replacement = `    incorrect_str = "\\n".join([f"- {q}" for q in all_incorrect_questions]) if all_incorrect_questions else "None"
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
    elif not all_incorrect_questions:
        prompt = f"""
You are an expert Grade 10 ICT teacher, personalized learning coach, and educational diagnostician.

Your job is to create a UNIQUE personalized study plan for this student.

This is NOT a general ICT summary.

You must analyze:
- Student performance
- Learning gaps based on module scores
- Retrieved official learning materials

==================================================
STUDENT PERFORMANCE DATA
==================================================

Overall Score:
{overall_score}%


Module Scores:
{scores_str}


==================================================
OFFICIAL LEARNING MATERIAL
==================================================

Use ONLY the following retrieved learning materials.

All explanations, notes, definitions, examples, and revision points MUST come from this content.

Do not add outside ICT information.

Retrieved Content:

{all_context}


==================================================
IMPORTANT RULES
==================================================

1. Create a plan ONLY for this student.

2. Focus on the modules where the student scored the lowest.

3. Every recommendation must be connected to:
   - a weak concept
   - retrieved learning material

4. Do not create generic textbook notes.

5. Never mention:
   - AI
   - RAG
   - prompts
   - retrieved content
   - language models


==================================================
STUDENT LEARNING PROFILE
==================================================

Analyze the student's learning pattern based on module scores.

Identify:

- Strong areas
- Weak areas
- Priority topics


==================================================
1. PERSONAL PERFORMANCE ANALYSIS
==================================================

Create a detailed analysis.

Include:

- Overall performance
- Learning strengths
- Main difficulties
- Improvement opportunities


==================================================
2. WEAK CONCEPT PRIORITY MAP
==================================================

Group the learning material concepts from the lowest scoring modules.

Rank from highest priority to lowest.

For each concept include:

Concept:
(Name)

Why It Is Important:
(Brief explanation)

Key Revision Notes:
(2-3 bullet points from material)


==================================================
3. ACTIONABLE STUDY SCHEDULE
==================================================

Create a 3-day micro-study schedule focusing on the weakest modules.

Format:
Day 1: [Specific Topic] - [Action, e.g., Read page X]
Day 2: [Specific Topic] - [Action]
Day 3: [Specific Topic] - [Action]


==================================================
4. KEY DEFINITIONS
==================================================

List 3-5 important definitions the student should memorize.


==================================================
5. PRACTICE QUESTIONS
==================================================

Generate 3 Multiple Choice Questions from the weak modules to test their understanding.
Provide the Answer Key at the end.


==================================================
6. MOTIVATION
==================================================

Write a short, inspiring message to encourage them to improve.
"""
        return prompt`;

code = code.replace(target1, replacement);
fs.writeFileSync('rag_service/services/rag_service.py', code);

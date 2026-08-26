const fs = require('fs');
let code = fs.readFileSync('rag_service/services/rag_service.py', 'utf8');

const newBranch = `
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
        return prompt
`;

const target = `    prompt = f"""
You are an expert Grade 10 ICT teacher, personalized learning coach, and educational diagnostician.`;

code = code.replace(target, newBranch + '\n' + target);
fs.writeFileSync('rag_service/services/rag_service.py', code);

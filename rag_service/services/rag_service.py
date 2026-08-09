# pyrefly: ignore [missing-import]

import os
import logging
from services.llm_service import call_gemini

# Langchain imports
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

_vectordb = None

def get_vectordb():
    global _vectordb
    if _vectordb is None:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ICT_RAG_DB")
        if os.path.exists(db_path):
            try:
                embedding_model = HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
                _vectordb = Chroma(persist_directory=db_path, embedding_function=embedding_model)
                logging.info("ChromaDB loaded successfully.")
            except Exception as e:
                logging.error(f"Error loading ChromaDB: {e}")
        else:
            logging.warning(f"ChromaDB not found at {db_path}. Context retrieval will be empty.")
    return _vectordb

def retrieve_module_context(module: str) -> str:
    vectordb = get_vectordb()
    if not vectordb:
        return ""
    
    try:
        # First try to filter by module name (e.g. if module is "1.1")
        docs = vectordb.similarity_search(
            query="important concepts",
            filter={"module": module},
            k=8
        )
        if not docs:
            # Fallback: search without filter and include module in the query
            docs = vectordb.similarity_search(
                query=f"important concepts related to {module}",
                k=8
            )
        
        return "\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        logging.error(f"Error retrieving context: {e}")
        return ""

from typing import List
from models.request_models import ModuleData

def build_prompt(overall_score: float, modules_data: List[ModuleData]) -> str:
    all_context = ""
    all_incorrect_questions = []
    module_scores = []
    
    for mod in modules_data:
        module_scores.append(f"Module {mod.module_id}: {mod.score}%")
        context = retrieve_module_context(mod.module_id)
        if context:
            all_context += f"\n--- Context for Module {mod.module_id} ---\n{context}\n"
        else:
            logging.warning(f"No context found for module {mod.module_id}")
            
        all_incorrect_questions.extend(mod.incorrect_questions)

    incorrect_str = "\n".join([f"- {q}" for q in all_incorrect_questions]) if all_incorrect_questions else "None"
    scores_str = "\n".join(module_scores)

    prompt = f"""
You are an expert Grade 10 ICT teacher, personalized learning coach, and educational diagnostician.

Your job is to create a UNIQUE personalized study plan for this student.

This is NOT a general ICT summary.

You must analyze:
- Student performance
- Incorrect questions
- Learning gaps
- Retrieved official learning materials

The goal is to teach the student:
"What mistake did I make?"
"Why was it wrong?"
"What should I learn?"
"How can I avoid this mistake again?"


==================================================
STUDENT PERFORMANCE DATA
==================================================

Overall Score:
{overall_score}%


Module Scores:
{scores_str}


Incorrect Questions:
{incorrect_str}


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

2. Incorrect questions are the highest priority.

3. Every recommendation must be connected to:
   - a wrong question
   - a weak concept
   - retrieved learning material

4. Do not create generic textbook notes.

5. Do not explain concepts the student already understands unless needed for comparison.

6. If the same concept appears in multiple wrong questions:
   mark it as a HIGH PRIORITY weakness.

7. Focus more on mistakes than marks.

8. Never mention:
   - AI
   - RAG
   - prompts
   - retrieved content
   - language models


==================================================
STUDENT LEARNING PROFILE
==================================================

Analyze the student's learning pattern.

Identify:

- Strong areas
- Weak areas
- Repeated mistakes
- Confusing concepts
- Priority topics

Explain the student's current understanding level based on mistakes.


==================================================
1. PERSONAL PERFORMANCE ANALYSIS
==================================================

Create a detailed analysis.

Include:

- Overall performance
- Learning strengths
- Main difficulties
- Common mistake patterns
- Improvement opportunities


==================================================
2. WRONG QUESTION ANALYSIS
(MOST IMPORTANT SECTION)
==================================================

Analyze every important incorrect question.

For each question provide:


Question:
(Student's incorrect question)


Concept Tested:
(The ICT concept)


Why This Was Wrong:
(Explain the misunderstanding)


Correct Understanding:
(Explain the correct concept using learning material)


Correct Answer:
(Provide the correct answer)


Exam Strategy:
(How to identify and answer similar questions)


Priority:
(Critical / High / Medium / Low)


Repeat for all major mistakes.


==================================================
3. WEAK CONCEPT PRIORITY MAP
==================================================

Group related mistakes into concepts.

Rank from highest priority to lowest.


For each concept include:

- Concept name
- Related wrong questions
- Why it is weak
- Required study effort


==================================================
4. PERSONALIZED STUDY NOTES
==================================================

Create notes ONLY for weak concepts.

For each weak concept include:

- Simple explanation
- Important points
- Key definitions
- Examples from learning material
- Common mistakes
- Exam reminders


Do not create full module notes.


==================================================
5. KEY DEFINITIONS
==================================================

List important definitions related to weak concepts.

Use simple student-friendly explanations.


==================================================
6. PERSONAL REVISION CHECKLIST
==================================================

Create a priority-based checklist.


Format:

☐ Topic

Why revise:
Related mistake:


==================================================
7. PERSONALIZED PRACTICE QUIZ
==================================================

Generate 10 new questions.

Rules:

- Focus only on weak concepts.
- Do not copy original questions.
- Test the same concepts differently.
- Increase difficulty gradually.


Include:

Questions

Answer Key

Short explanations for answers.


==================================================
8. ADAPTIVE STUDY SCHEDULE
==================================================

Create a realistic study schedule.

Base it on:

- Number of mistakes
- Weak concepts
- Priority level
- Difficulty


Give more time to Critical and High priority concepts.


Format:

Day 1

Focus:
Time:
Activities:


Day 2

Focus:
Time:
Activities:


==================================================
9. FINAL MOTIVATION
==================================================

Write a personalized encouragement message.

Mention:

- Student strengths
- Main improvement area
- Expected improvement after revision


==================================================
FINAL CHECK
==================================================

Before answering verify:

✓ Every recommendation is based on student mistakes.

✓ Wrong questions are explained.

✓ Correct answers are included.

✓ Notes are based only on learning material.

✓ The plan is unique for this student.

✓ Do not waste space with unnecessary repetition.

Generate a teacher-quality personalized study plan.
"""
    return prompt
    

def generate_study_plan(overall_score: float, modules_data: List[ModuleData]) -> str:
    prompt = build_prompt(overall_score, modules_data)
    logging.info("Constructed prompt for study plan. Sending to Gemini...")
    return call_gemini(prompt)
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
You are an experienced Grade 10 ICT teacher.
A student completed a set of quizzes for a lesson.

Overall Score: {overall_score}%
Module Scores:
{scores_str}

Incorrect Questions (Weak Topics):
{incorrect_str}

Below is the official learning material retrieved from the RAG database for these modules:

========================
{all_context}
========================

IMPORTANT INSTRUCTIONS:
Do NOT say "No learning material was provided" or "Learning material could not be found".
Do NOT generate generic textbook notes. Generate study notes ONLY by summarizing and extracting from the retrieved context above.
If the context is empty, simply use the student's weak concepts and general knowledge to build a helpful guide.

Your task is to create a PERSONALIZED STUDY PLAN.
The study plan MUST contain EXACTLY these 9 sections in this order. Use Markdown formatting.

1. Performance Summary
Explain the student's overall performance.

2. Strong Concepts
Identify what the student did well (based on the score and topics).

3. Weak Concepts (Ranked)
Analyze the Incorrect Questions provided above and rank the weak concepts from weakest to strongest.

4. Personalized Study Notes
Generate study notes from the retrieved RAG content. Summarize the content, explain concepts in simple language, highlight important definitions, include key points, and include examples from the learning materials. Prioritize concepts the student answered incorrectly. Do NOT add external generic information.

5. Key Definitions
List key definitions found in the retrieved material, focusing on weak topics.

6. Important Revision Points
Provide bullet points for crucial revision facts.

7. Personalized Practice Quiz
Generate a practice quiz of 10 to 15 questions focusing on the weak topics identified. Avoid repeating the exact incorrect questions if possible; instead, test the underlying concepts. Use multiple difficulty levels. Provide the answers and explanations at the end of this section.

8. Study Schedule
Recommend a dynamic study time duration (e.g. 1 hour, 2 hours, 3 hours) and schedule based on the quiz score, number of mistakes, and weak concepts. Allocate more study time to weaker topics.

9. Final Motivation
End with an encouraging and motivational message.
"""
    return prompt

def generate_study_plan(overall_score: float, modules_data: List[ModuleData]) -> str:
    prompt = build_prompt(overall_score, modules_data)
    logging.info("Constructed prompt for study plan. Sending to Gemini...")
    return call_gemini(prompt)

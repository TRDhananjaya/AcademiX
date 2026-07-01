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

def build_prompt(module: str, score: float) -> str:
    context = retrieve_module_context(module)

    prompt = f"""
You are an experienced Grade 10 ICT teacher.

A student completed a quiz.

Module : {module}

Quiz Score : {score}%

Below is the official learning material.

========================

{context}

========================

Your task is to create a PERSONALIZED STUDY PLAN.

The study plan MUST contain exactly these sections.

--------------------------------------------------

1. Performance Analysis

Explain the student's performance.

Mention whether this module is

• Strong

• Average

• Weak

--------------------------------------------------

2. Personalized Study Note

Generate a study note ONLY using the retrieved content.

Do NOT add external information.

If score >75%

Generate a concise revision note.

If score between 50 and 75

Generate a medium explanation.

If score below 50

Generate a detailed explanation.

--------------------------------------------------

3. Topics to Focus

List the most important topics.

--------------------------------------------------

4. Study Time Recommendation

Recommend study duration.

Example

30 Minutes

1 Hour

2 Hours

3 Hours

depending on performance.

--------------------------------------------------

5. Practice Questions

Provide 3 practice questions based ONLY on the retrieved content.
"""
    return prompt

def generate_study_plan(module: str, score: float) -> str:
    prompt = build_prompt(module, score)
    return call_gemini(prompt)

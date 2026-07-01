import os
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import logging

logging.basicConfig(level=logging.INFO)

def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def build_db():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_dir = os.path.join(base_dir, "ICT_RAG_DB")
    lesson1_dir = os.path.join(db_dir, "Lesson_1")
    
    if not os.path.exists(lesson1_dir):
        logging.error(f"Directory not found: {lesson1_dir}")
        return

    pdf_files = [
        {
            "path": os.path.join(lesson1_dir, "Grade 10 ICT - Lesson 01 - Module 1.pdf"),
            "module": "1.1",
            "title": "Introduction to ICT"
        },
        {
            "path": os.path.join(lesson1_dir, "Grade 10 ICT - Lesson 01 - Module 2.pdf"),
            "module": "1.2",
            "title": "Applications of ICT in Daily Life"
        },
        {
            "path": os.path.join(lesson1_dir, "Grade 10 ICT - Lesson 01 - Module 3.pdf"),
            "module": "1.3",
            "title": "Benefits and Challenges of ICT"
        }
    ]

    documents = []
    for pdf in pdf_files:
        if not os.path.exists(pdf["path"]):
            logging.warning(f"File not found, skipping: {pdf['path']}")
            continue
            
        logging.info(f"Extracting {pdf['title']}...")
        text = extract_text(pdf["path"])
        documents.append({
            "text": text,
            "module": pdf["module"],
            "title": pdf["title"],
            "source": pdf["path"]
        })

    if not documents:
        logging.error("No documents to process.")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n","\n",". "," ",""]
    )

    texts = []
    metadatas = []
    for doc in documents:
        chunks = splitter.split_text(doc["text"])
        for chunk in chunks:
            texts.append(chunk)
            metadatas.append({
                "module": doc["module"],
                "title": doc["title"],
                "source": doc["source"]
            })

    logging.info(f"Generated {len(texts)} chunks.")

    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    logging.info(f"Persisting ChromaDB to {db_dir}...")
    vectordb = Chroma.from_texts(
        texts=texts,
        embedding=embedding_model,
        metadatas=metadatas,
        persist_directory=db_dir
    )

    logging.info("ChromaDB created successfully!")

if __name__ == "__main__":
    build_db()

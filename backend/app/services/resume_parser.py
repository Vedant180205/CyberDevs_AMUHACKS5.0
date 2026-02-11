import pymupdf4llm
import os

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF and returns it as Markdown-formatted text.
    """
    try:
        # High-speed markdown conversion (approx 0.14s per document)
        md_text = pymupdf4llm.to_markdown(file_path)
        return md_text
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""
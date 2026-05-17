import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

def create_pdf(content: str, title: str) -> str:
    # Ensure directory exists and use absolute path for consistency
    # Project root is two levels up from this file (backend/app/services)
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../tmp'))
    os.makedirs(base_dir, exist_ok=True)
    sanitized_title = title.replace(' ', '_')
    file_path = os.path.join(base_dir, f"{sanitized_title}.pdf")    
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom style for cover letter
    style = ParagraphStyle(
        name='Normal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        spaceAfter=12
    )
    
    story = []
    
    paragraphs = content.split('\n')
    for p in paragraphs:
        if p.strip():
            story.append(Paragraph(p.strip(), style))
        else:
            story.append(Spacer(1, 12))
            
    doc.build(story)
    return file_path

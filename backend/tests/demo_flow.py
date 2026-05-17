import os
import time
import json
import requests
from urllib.parse import urljoin

BASE_URL = os.getenv('BASE_URL', 'http://127.0.0.1:5000')

TEST_USER = {
    "full_name": "Demo User",
    "email": "demo_user@example.com",
    "password": "DemoPass123!",
    "confirm_password": "DemoPass123!"
}

# Sample cover‑letter generation payload (matches ai_service expectations)
GENERATE_PAYLOAD = {
    "full_name": "Demo User",
    "email": "demo_user@example.com",
    "phone": "123-456-7890",
    "linkedin_url": "https://linkedin.com/in/demo",
    "portfolio_url": "https://github.com/demo",
    "years_experience": 5,
    "current_job_title": "Software Engineer",
    "key_skills": ["Python", "Flask", "React", "SQL"],
    "achievements": "Built a full-stack web app that handled 10k daily users.",
    "education": {"degree": "B.Sc.", "field": "Computer Science", "university": "Tech University", "year": 2020},
    "job_title": "Senior Backend Engineer",
    "company_name": "Acme Corp",
    "job_description": "We need a senior backend engineer with strong Python, Flask, and SQL experience. Responsibilities include designing RESTful APIs, optimizing database queries, and leading a small team.",
    "job_location": "Remote",
    "employment_type": "Full-time",
    "tone": "professional",
    "length": "medium",
    "highlight": "skills_match"
}

def register_user():
    url = urljoin(BASE_URL, '/api/auth/register')
    resp = requests.post(url, json=TEST_USER)
    print('Register response:', resp.status_code, resp.text)
    return resp.ok

def login_user():
    url = urljoin(BASE_URL, '/api/auth/login')
    payload = {"email": TEST_USER['email'], "password": TEST_USER['password']}
    resp = requests.post(url, json=payload)
    print('Login response:', resp.status_code, resp.text)
    if resp.ok:
        data = resp.json()
        return data.get('access_token'), data.get('refresh_token')
    return None, None

def generate_letter(access_token):
    url = urljoin(BASE_URL, '/api/cover-letters/generate')
    headers = {'Authorization': f'Bearer {access_token}'}
    resp = requests.post(url, json=GENERATE_PAYLOAD, headers=headers)
    print('Generate response:', resp.status_code)
    if resp.ok:
        data = resp.json()
        print('\n=== GENERATED LETTER ===\n')
        print(data.get('generated_content'))
        print('\nATS Score:', data.get('ats_score'))
        return data
    else:
        print('Error:', resp.text)
    return None

def save_letter(access_token, gen_data):
    url = urljoin(BASE_URL, '/api/cover-letters')
    headers = {'Authorization': f'Bearer {access_token}'}
    # Build minimal payload for persisting
    payload = {
        "title": f"{GENERATE_PAYLOAD['job_title']} @ {GENERATE_PAYLOAD['company_name']}",
        "job_title": GENERATE_PAYLOAD['job_title'],
        "company_name": GENERATE_PAYLOAD['company_name'],
        "job_description": GENERATE_PAYLOAD['job_description'],
        "job_location": GENERATE_PAYLOAD['job_location'],
        "employment_type": GENERATE_PAYLOAD['employment_type'],
        "full_name": GENERATE_PAYLOAD['full_name'],
        "email": GENERATE_PAYLOAD['email'],
        "phone": GENERATE_PAYLOAD['phone'],
        "linkedin_url": GENERATE_PAYLOAD['linkedin_url'],
        "portfolio_url": GENERATE_PAYLOAD['portfolio_url'],
        "years_experience": GENERATE_PAYLOAD['years_experience'],
        "current_job_title": GENERATE_PAYLOAD['current_job_title'],
        "key_skills": json.dumps(GENERATE_PAYLOAD['key_skills']),
        "achievements": GENERATE_PAYLOAD['achievements'],
        "education": json.dumps(GENERATE_PAYLOAD['education']),
        "tone": GENERATE_PAYLOAD['tone'],
        "length": GENERATE_PAYLOAD['length'],
        "highlight": GENERATE_PAYLOAD['highlight'],
        "generated_content": gen_data.get('generated_content'),
        "ats_score": gen_data.get('ats_score'),
        "word_count": len(gen_data.get('generated_content', '').split()),
        "status": "final"
    }
    resp = requests.post(url, json=payload, headers=headers)
    print('Save letter response:', resp.status_code, resp.text)
    if resp.ok:
        try:
            data = resp.json()
            return data.get('id')
        except Exception:
            return None
    return None

def download_pdf(access_token, letter_id):
    url = urljoin(BASE_URL, f'/api/cover-letters/{letter_id}/pdf')
    headers = {'Authorization': f'Bearer {access_token}'}
    resp = requests.get(url, headers=headers, stream=True)
    if resp.status_code == 200:
        pdf_path = os.path.abspath('demo_letter.pdf')
        with open(pdf_path, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        print('PDF saved to', pdf_path)
    else:
        print('Failed to download PDF:', resp.status_code, resp.text)

if __name__ == '__main__':
    # Give the Flask server a moment to start if needed
    time.sleep(2)
    register_user()
    access, refresh = login_user()
    if not access:
        raise SystemExit('Login failed')
    gen_data = generate_letter(access)
    if not gen_data:
        raise SystemExit('Generation failed')
    letter_id = save_letter(access, gen_data)
    if letter_id:
        download_pdf(access, letter_id)
    else:
        print('Could not save letter, skipping PDF download')

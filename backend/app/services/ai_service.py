import os
import json
import openai

def generate_cover_letter(data: dict) -> dict:
    prompt = f"""
You are an expert career coach and professional resume writer. Your task is to generate a highly personalized, ATS-optimized cover letter using the TealHQ methodology.

APPLICANT INFO:
- Name: {data.get('full_name')}
- Email: {data.get('email')}
- Phone: {data.get('phone')}
- LinkedIn: {data.get('linkedin_url')}
- Current Role: {data.get('current_job_title')}
- Years of Experience: {data.get('years_experience')}
- Key Skills: {', '.join(data.get('key_skills', []))}
- Top Achievements: {data.get('achievements')}
- Education: {data.get('education', {}).get('degree')} in {data.get('education', {}).get('field')} from {data.get('education', {}).get('university')} ({data.get('education', {}).get('year')})

TARGET JOB:
- Job Title: {data.get('job_title')}
- Company: {data.get('company_name')}
- Job Description:
{data.get('job_description')}

STYLE PREFERENCES:
- Tone: {data.get('tone')}
- Length: {data.get('length')}
- Highlight Focus: {data.get('highlight')}

METHODOLOGY TO FOLLOW (TealHQ Style):
1. **Introduction**: Hook the reader. Mention the role and a standout achievement or a specific reason why you admire the company. Avoid generic openings.
2. **Body Paragraph(s)**: Connect past experience to their needs using the STAR method (Situation, Task, Action, Result). Focus on the 'Highlight Focus' requested. Use quantifiable metrics where possible based on the provided achievements.
3. **Why Them**: Briefly explain why this specific company excites the applicant.
4. **Closing**: Reiterate interest, include a clear Call to Action.
5. **ATS Optimization**: Extract and naturally incorporate exact keywords from the Job Description.

YOUR OUTPUT FORMAT:
You MUST return ONLY a valid JSON object with exactly two keys:
1. "cover_letter": The full text of the cover letter (string)
2. "ats_score": An integer from 1 to 100 representing how well the Applicant's skills and experience match the Target Job description based on strict ATS keyword tracking algorithms. Be highly critical and realistic with this score.

Do NOT include markdown formatting like ```json. Just raw JSON.
"""

    api_key = os.environ.get("OPENAI_API_KEY")
    
    # Fallback if no real API key
    if not api_key or api_key == "sk-placeholder" or api_key.startswith("your_"):
        skills_str = ', '.join(data.get('key_skills', []))
        return {
            "cover_letter": f"Dear Hiring Manager at {data.get('company_name')},\n\nI am writing to express my strong interest in the {data.get('job_title')} position. With {data.get('years_experience')} years of experience as a {data.get('current_job_title')}, I am confident in my ability to make an immediate impact on your team.\n\nIn my previous experience, I have demonstrated success in several key areas. Notably, {data.get('achievements')}. I believe these skills align perfectly with the requirements for the {data.get('job_title')} role.\n\nMy core competencies include: {skills_str}.\n\nThank you for your time and consideration.\n\nSincerely,\n{data.get('full_name')}",
            "ats_score": 75
        }

    try:
        openai.api_key = api_key
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional resume writer. You output strict JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        content = response.choices[0].message.content.strip()
        # Clean up potential markdown from response
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
            
        result = json.loads(content)
        return {
            "cover_letter": result.get("cover_letter", "Error extracting letter"),
            "ats_score": int(result.get("ats_score", 70))
        }
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return {
            "cover_letter": f"[Fallback Cover Letter]\n\nError generating letter via API: {e}\n\nDear Hiring Manager...",
            "ats_score": 50
        }

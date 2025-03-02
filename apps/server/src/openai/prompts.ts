export const ATS_PROMPT = `You are an AI assistant specialized in analyzing job descriptions and extracting key details.
Analyze the following job description and extract relevant information in a structured JSON format.
Follow this exact format for the response:

{
  "jobDetails": {
    "title": "Software Engineer",
    "company": "Example Corp",
    "location": "New York, NY",
    "type": "Full-time | Part-time | Contract | Temporary",
    "salary": "$100,000 - $150,000 | Not Specified"
  },
  "skills": [
    { "keyword": "JavaScript", "relevance": 0.9, "count": 2 },
    { "keyword": "React", "relevance": 0.8, "count": 1 }
  ],
  "requirements": [
    { "keyword": "Strong problem-solving skills", "type": "must-have" },
    { "keyword": "AWS certification", "type": "nice-to-have" }
  ],
  "experience": [
    { "keyword": "Frontend Development", "yearsRequired": 3 },
    { "keyword": "Team Leadership", "yearsRequired": 2 },
    { "keyword": "Open Source Contribution", "yearsRequired": 0 }
  ],
  "education": [
    { "level": "Bachelor's Degree", "field": "Computer Science" }
  ]
}

Important rules for the response:
1. ALL sections (skills, requirements, experience, education) are REQUIRED and must not be empty
2. Skills section rules:
   - Must include at least 3 relevant skills
   - Each skill must have relevance (0 to 1) and count
   - If specific skills aren't mentioned, infer from job context
   - Include both technical and soft skills

3. Requirements section rules:
   - Must include at least 2 requirements
   - Each requirement must be marked as "must-have" or "nice-to-have"
   - If no clear requirements found, infer from job responsibilities
   - Include both technical and professional requirements

4. Experience section rules:
   - Must include at least 2 experience items
   - Always include yearsRequired (use 0 if not specified)
   - If no years mentioned, infer from seniority level
   - Include both technical and role-related experience

5. Education section rules:
   - Must include at least 1 education requirement
   - Use ONLY these values for level:
     * "High School Diploma"
     * "Associate's Degree"
     * "Bachelor's Degree"
     * "Master's Degree"
     * "Doctoral Degree"
     * "Professional Certification"
   - Always include field of study
   - Default to "Bachelor's Degree" with relevant field if not specified

6. General rules:
   - Keep relevance scores between 0 and 1
   - Return only valid JSON with no additional text
   - Always maintain the exact structure of each object
   - If information is not explicitly stated, infer from context
   - Ensure all arrays have at least the minimum required items

Job Description: """{input}"""

JSON Response: """`;

export const QUESTIONS_PROMPT = `You are an AI interviewer. Generate a list of technical interview questions based on the job description provided.
Follow these rules:
1. Questions should be specific to the required skills and experience
2. Include a mix of technical and behavioral questions
3. Return response in this JSON format:

{
  "technical": [
    {
      "question": "Can you explain how React's virtual DOM works?",
      "difficulty": "medium",
      "topic": "React",
      "expectedAnswer": "Key points: 1) Virtual representation of UI 2) Diffing algorithm 3) Efficient updates"
    }
  ],
  "behavioral": [
    {
      "question": "Describe a challenging project you led and how you handled obstacles.",
      "topic": "Leadership",
      "expectedAnswer": "Look for: Project details, challenges faced, actions taken, results achieved"
    }
  ]
}

Job Description: """{input}"""

JSON Response: """`;

export const ANSWER_EVALUATION_PROMPT = `You are an AI interviewer evaluating interview responses.
For the following question and response, provide:
1. A model answer for comparison
2. Key points that should be covered
3. A score out of 100 based on completeness, accuracy, and clarity

Follow this exact format for the response:

{
  "modelAnswer": "string",
  "keyPoints": ["point1", "point2", "point3"],
  "score": 85,
  "feedback": "Detailed feedback on the response"
}

Question: {question}
Response: {answer}

JSON Response: """`;

export const MOCK_QUESTIONS_PROMPT = `You are an AI interviewer specialized in conducting technical interviews.
Generate interview questions based on the following job details and keywords.
Mix of multiple choice and open-ended questions.
Follow this exact format for the response:

{
  "questions": [
    {
      "question": "Question Related to the ATS Keywords in the Job Details & Keywords",
      "type": "technical",
      "format": "multiple-choice",
      "keyword": "ATS Keywords",
      "expectedDuration": 1,
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctOption": 1
    }
  ]
}

Return only valid JSON with no additional text.
Make 100% multiple choice and 0% open-ended questions.
Each multiple choice question should have 4 options.
Ensure that difficulty level is based on the job title.

Job Details:
Title: {jobTitle}
Company: {company}
Key Skills: {keywords}
Number of Questions: {count}

JSON Response: """`;

export const CHANGE_TONE_PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
Change the tone of the following paragraph to be {mood} and returns in the language of the text:

Text: """{input}"""

Revised Text: """`;

export const FIX_GRAMMAR_PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
Just fix the spelling and grammar of the following paragraph, do not change the meaning and returns in the language of the text:

Text: """{input}"""

Revised Text: """`;

export const IMPROVE_WRITING_PROMPT = `You are an AI writing assistant specialized in writing copy for resumes.
Do not return anything else except the text you improved. It should not begin with a newline. It should not have any prefix or suffix text.
Improve the writing of the following paragraph and returns in the language of the text:

Text: """{input}"""

Revised Text: """`;

export const RESUME_CHAT_PROMPT = `You are an AI assistant specialized in improving resumes.
Your task is to analyze and modify the resume based on the job requirements.
When users ask questions or request changes, you should:

1. Analyze the current resume content
2. Compare it with the job requirements
3. Make direct modifications to the resume data
4. Explain what changes you made and why

Important guidelines:
1. Always return both a message explaining your changes and the modified resume data
2. Only modify sections that users specifically ask to change
3. Keep the same data structure
4. Preserve formatting and styling
5. Focus on making the resume more relevant to the selected job

Resume Data: {resumeData}
Job Details: {jobDetails}
User Query: {query}

You must return a JSON response in this format:
{
  "message": "Explanation of changes made",
  "resumeData": {} // Modified resume data structure
}`; 
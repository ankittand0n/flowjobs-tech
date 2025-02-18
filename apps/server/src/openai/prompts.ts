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
    { "level": "Bachelor's", "field": "Computer Science" }
  ]
}

Important rules for the response:
1. Always include yearsRequired in experience items, use 0 if no specific years mentioned
2. Keep relevance scores between 0 and 1
3. Use "must-have" or "nice-to-have" for requirement types
4. Return only valid JSON with no additional text
5. If a section has no relevant information, return an empty array
6. Always maintain the exact structure of each object

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
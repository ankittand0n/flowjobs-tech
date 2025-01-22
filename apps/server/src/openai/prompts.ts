export const ATS_PROMPT = `You are an AI assistant specialized in analyzing job descriptions and extracting key ATS (Applicant Tracking System) keywords.
Analyze the following job description and extract relevant keywords in a structured JSON format.
Follow this exact format for the response:

{
  "skills": [
    { "keyword": "JavaScript", "relevance": 0.9, "count": 2 },
    { "keyword": "React", "relevance": 0.8, "count": 1 }
  ],
  "requirements": [
    { "keyword": "5+ years experience", "type": "must-have" },
    { "keyword": "AWS certification", "type": "nice-to-have" }
  ],
  "experience": [
    { "keyword": "frontend development", "yearsRequired": 5 },
    { "keyword": "team leadership", "yearsRequired": 2 }
  ],
  "education": [
    { "level": "Bachelor's", "field": "Computer Science" },
    { "level": "Master's", "field": "Software Engineering" }
  ]
}

Return only valid JSON with no additional text. Ensure relevance is between 0 and 1.

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
Make 60% multiple choice and 40% open-ended questions.
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
# InterviewForge

InterviewForge turns a job description and candidate information into a structured interview preparation plan using local AI.

## Features

- Enter a job role
- Paste a job description
- Select experience level
- Add skills to be tested
- Add weak areas
- Generate likely interview questions
- Generate technical topics to revise
- Get answer guidance
- Generate follow-up questions
- Generate questions to ask the interviewer
- Generate a preparation checklist
- Local AI inference with QVAC and Qwen3 0.6B Q4

## Tech Stack

- Node.js
- Express
- HTML
- CSS
- JavaScript
- QVAC SDK 0.19.1
- Qwen3 0.6B Q4

## Requirements

- Node.js
- npm
- Git
- QVAC-compatible system

## Installation

Clone the repository:

git clone https://github.com/Aryavrat28/interviewforge.git

Enter the project:

cd interviewforge

Install dependencies:

npm install

Start the application:

QVAC_CONFIG_PATH=./qvac.config.json npm start

Open the application:

http://localhost:3000

## Usage

Enter the job role and job description.

Optionally enter:

- Experience level
- Skills to test
- Weak areas

Click "Build Interview Plan".

InterviewForge generates:

- Likely Questions
- Technical Topics
- Answer Guidance
- Follow-Up Questions
- Questions for the Interviewer
- Preparation Checklist

## API

POST /api/interview

Generates an interview preparation plan.

GET /health

Returns the application and QVAC status.

## Local AI

InterviewForge uses QVAC to run Qwen3 0.6B Q4 locally.

The application does not require a cloud AI API for interview plan generation.

## Project Structure

interviewforge/
- public/
  - app.js
  - index.html
  - styles.css
- .gitignore
- LICENSE
- package.json
- package-lock.json
- qvac.config.json
- README.md
- server.js

## License

This project is licensed under the MIT License.

EOF

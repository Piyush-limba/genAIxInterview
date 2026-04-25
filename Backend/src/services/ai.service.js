const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
// Initialize the client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    
    // 1. The Strong Template Prompt
    const prompt = `
    Act as an Expert Technical Recruiter and Senior Engineering Interviewer. 
    Perform a deep-dive gap analysis between the candidate's profile and the job description.

    ### INPUT DATA
    RESUME: """${resume}"""
    CANDIDATE BIO: """${selfDescription}"""
    JOB DESCRIPTION: """${jobDescription}"""

    ### CRITICAL OUTPUT INSTRUCTIONS
    You MUST return a valid JSON object.
    You MUST NOT return flat arrays of strings. All arrays must contain nested objects exactly as shown in the template below.
    "severity" in skillGaps MUST be exactly "low", "medium", or "high".
    You MUST include the "title" key representing the job title.

    ### REQUIRED JSON TEMPLATE
    Your response must perfectly match this structure:
    {
      "title": "Extract the precise Job Title from the JD here",
      "matchScore": 85,
      "technicalQuestions": [
        {
          "question": "A highly specific question based on a project in their resume...",
          "intention": "Why this matters for the job description...",
          "answer": "The ideal technical answer expected..."
        }
      ],
      "behavioralQuestions": [
        {
          "question": "A situational question...",
          "intention": "Testing teamwork, conflict resolution, or learning speed...",
          "answer": "What a good STAR-method response looks like..."
        }
      ],
      "skillGaps": [
        {
          "skill": "Name of the missing technology or soft skill",
          "severity": "high" 
        }
      ],
      "preparationPlan": [
        {
          "day": 1,
          "focus": "Core domain knowledge",
          "tasks": ["Read documentation on X", "Build a small script doing Y"]
        }
      ]
    }
    `;

    // 2. The Native Gemini Schema (Bypassing Zod)
    const geminiNativeSchema = {
        type: "OBJECT",
        properties: {
            title: { type: "STRING", description: "Job title" },
            matchScore: { type: "NUMBER" },
            technicalQuestions: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING" },
                        intention: { type: "STRING" },
                        answer: { type: "STRING" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            behavioralQuestions: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        question: { type: "STRING" },
                        intention: { type: "STRING" },
                        answer: { type: "STRING" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            skillGaps: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        skill: { type: "STRING" },
                        severity: { type: "STRING", enum: ["low", "medium", "high"] }
                    },
                    required: ["skill", "severity"]
                }
            },
            preparationPlan: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        day: { type: "NUMBER" },
                        focus: { type: "STRING" },
                        tasks: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["day", "focus", "tasks"]
                }
            }
        },
        required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
    };

    // 3. Make the API Call
    console.log("Generating report with native schema...");
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiNativeSchema,
        }
    });

    // 4. Return the cleanly parsed object to your controller
    return JSON.parse(response.text);
}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}
module.exports = { generateInterviewReport , generateResumePdf};
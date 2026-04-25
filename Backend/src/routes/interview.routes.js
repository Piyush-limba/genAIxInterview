const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware.js');
const {generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportsController,generateResumePdfController}= require('../controllers/interview.controller.js');
const upload = require('../middlewares/file.middleware.js');
const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @desc Generate an interview report based on the candidate's resume, self-description and job description
 * @access Public
 * @body { resume: string, selfDescription: string, jobDescription: string }
 * @returns { matchScore: number, technicalQuestions: array, behavioralQuestions: array, skillGaps: array, preparationPlan: array }
 */

interviewRouter.post('/',authMiddleware, upload.single('resume'), generateInterviewReportController);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware, getInterviewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware, getAllInterviewReportsController)

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware, generateResumePdfController)
module.exports = interviewRouter;
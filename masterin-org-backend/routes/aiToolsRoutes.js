const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware'); // Assuming users need to be logged in to use AI tools

// POST /api/ai/generate-lesson-plan
router.post(
  '/generate-lesson-plan',
  verifyToken, // Protect the endpoint
  [
    body('topic').notEmpty().trim().escape().withMessage('Topic is required.'),
    body('gradeLevel').notEmpty().trim().escape().withMessage('Grade level is required.'),
    // Objectives can be a string (e.g., comma-separated) or an array.
    // If string, we can split it. If array, we join it for the prompt.
    body('objectives')
      .notEmpty().withMessage('Learning objectives are required.')
      .customSanitizer((value) => { // Sanitize each objective if it's an array
        if (Array.isArray(value)) {
          return value.map(obj => String(obj).trim().replace(/[<>&"']/g, '')); // Basic escape
        }
        return String(value).trim().replace(/[<>&"']/g, ''); // Basic escape if string
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, gradeLevel, objectives } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not set.');
      return res.status(500).json({ success: false, message: 'AI service configuration error. API key missing.' });
    }

    let objectivesString = '';
    if (Array.isArray(objectives)) {
      objectivesString = objectives.map(obj => `- ${obj}`).join('\n');
    } else {
      // Assuming objectives might be a single string with newlines or comma/semicolon separated
      objectivesString = objectives.split(/[\n,;]+/).map(obj => `- ${obj.trim()}`).join('\n');
    }

    const prompt = `
You are an expert instructional designer. Generate a comprehensive lesson plan for the following:

Topic: ${topic}
Grade Level: ${gradeLevel}
Learning Objectives:
${objectivesString}

The lesson plan should include the following sections if applicable:
1. Lesson Title
2. Learning Objectives (re-stated or expanded)
3. Materials Needed
4. Lesson Activities (step-by-step, including estimated time for each activity if appropriate)
5. Assessment / Check for Understanding
6. Differentiation / Extension Activities (optional)
7. Conclusion / Wrap-up

Please provide the output in a clear, well-structured format. Markdown format is preferred.
    `.trim();

    try {
      const deepSeekResponse = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat', // Or 'deepseek-coder' if it yields better structured results
          messages: [
            { role: 'system', content: 'You are an expert instructional designer specializing in creating educational content.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000, // Increased for potentially long lesson plans
          temperature: 0.6, // Slightly lower for more predictable structure
          // stream: false, // Explicitly not streaming for this use case
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (deepSeekResponse.data && deepSeekResponse.data.choices && deepSeekResponse.data.choices.length > 0) {
        const lessonPlanText = deepSeekResponse.data.choices[0].message.content;
        res.json({ success: true, lessonPlanText });
      } else {
        console.error('Unexpected response structure from DeepSeek API:', deepSeekResponse.data);
        res.status(500).json({ success: false, message: 'Failed to generate lesson plan due to unexpected API response.' });
      }
    } catch (error: any) {
      console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
      let errorMessage = 'Failed to generate lesson plan.';
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        errorMessage = `DeepSeek API Error: ${error.response.data.error.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
);

// POST /api/ai/generate-math-problems
router.post(
  '/generate-math-problems',
  verifyToken,
  [
    body('topic').notEmpty().trim().escape().withMessage('Topic is required.'),
    body('numProblems').isInt({ min: 1, max: 10 }).withMessage('Number of problems must be between 1 and 10.'),
    body('difficultyLevel').notEmpty().trim().escape().withMessage('Difficulty level is required (e.g., Easy, Grade 5, College Prep).'),
    body('problemType').optional().trim().escape().withMessage('Problem type is optional (e.g., word problem, equation).')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { topic, numProblems, difficultyLevel, problemType } = req.body;
    const apiKey = process.env.QWEN_API_KEY;

    if (!apiKey) {
      console.error('QWEN_API_KEY is not set.');
      return res.status(500).json({ success: false, message: 'AI service (Qwen) configuration error. API key missing.' });
    }

    const problemTypeInstruction = problemType ? `Each problem should be a "${problemType}".` : "Vary the problem types if appropriate, or stick to standard question formats.";

    const prompt = `
You are an AI assistant specialized in generating math problems. Your task is to create ${numProblems} math problems on the topic of "${topic}" suitable for a "${difficultyLevel}" difficulty level.
${problemTypeInstruction}

For each problem, provide the following in a valid JSON format:
1.  "problem_text": The full text of the math problem.
2.  "problem_type": (e.g., "algebra", "geometry", "word problem", "calculus", "statistics", "arithmetic"). Infer this based on the topic and problem.
3.  "difficulty_level_generated": Re-state the target difficulty, or a more granular assessment if possible (e.g., "Medium", "Grade 8 - Advanced").
4.  "solution_steps": A detailed, step-by-step explanation of how to solve the problem. This should be an array of strings.
5.  "final_answer": The final answer to the problem, clearly stated.
6.  (Optional) "hints": An array of strings containing hints that could guide a student towards the solution.
7.  (Optional) "visual_elements_description": If the problem implies or would benefit from a visual (e.g., a diagram for a geometry problem, a number line), describe what that visual should depict. Do not generate the visual itself. Example: "A right-angled triangle ABC, with angle B = 90 degrees, AB = 3 units, BC = 4 units."

The entire output MUST be a single, valid JSON array, where each element is an object representing one math problem with the fields described above.
Do not include any introductory text, explanations, or markdown formatting outside of the JSON array itself. Ensure all strings within the JSON are properly escaped.

Example of a single problem object structure:
{
  "problem_text": "If a train travels at 60 km/h for 3 hours, how far does it travel?",
  "problem_type": "word problem",
  "difficulty_level_generated": "Easy / Grade 5",
  "solution_steps": [
    "Identify the given speed: 60 km/h.",
    "Identify the given time: 3 hours.",
    "Use the formula: distance = speed × time.",
    "Calculate: distance = 60 km/h × 3 h = 180 km."
  ],
  "final_answer": "The train travels 180 km.",
  "hints": ["Remember the relationship between speed, distance, and time."],
  "visual_elements_description": null
}
    `.trim();

    try {
      const qwenResponse = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          model: 'qwen1.5-72b-chat', // Or your preferred Qwen model
          input: {
            messages: [
              { role: 'system', content: 'You are an AI assistant that generates math problems with solutions in JSON format.' },
              { role: 'user', content: prompt },
            ],
          },
          parameters: {
            result_format: 'message',
            max_tokens: numProblems * 400, // Estimate tokens needed
            temperature: 0.4,
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let rawContent;
      if (qwenResponse.data && qwenResponse.data.output && qwenResponse.data.output.choices && qwenResponse.data.output.choices[0].message) {
        rawContent = qwenResponse.data.output.choices[0].message.content;
      } else if (qwenResponse.data && qwenResponse.data.output && qwenResponse.data.output.text) {
        rawContent = qwenResponse.data.output.text;
      } else {
        console.error('Unexpected response structure from Qwen API (Math Problems):', qwenResponse.data);
        return res.status(500).json({ success: false, message: 'Failed to generate math problems due to unexpected API response structure.' });
      }

      // Clean potential markdown wrappers
      if (rawContent.startsWith("```json")) {
        rawContent = rawContent.substring(7, rawContent.length - 3).trim();
      } else if (rawContent.startsWith("```")) {
         rawContent = rawContent.substring(3, rawContent.length - 3).trim();
      }

      try {
        const problems = JSON.parse(rawContent);
        if (!Array.isArray(problems)) {
            throw new Error("AI output was valid JSON but not an array of problems as expected.");
        }
        // TODO: Add more validation here if needed, e.g., check if each problem object has the required fields.
        res.json({ success: true, problems });
      } catch (parseError) {
        console.error('Failed to parse Qwen API response for math problems as JSON:', parseError.message);
        console.error('Raw AI output (Math Problems) that failed parsing:', rawContent);
        res.status(500).json({ success: false, message: 'AI returned data in an unexpected format. Raw output logged.', rawOutput: rawContent });
      }

    } catch (error) {
      console.error('Error calling Qwen API for math problems:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      let errorMessage = 'Failed to generate math problems.';
       if (error.response && error.response.data && (error.response.data.message || error.response.data.code) ) { // Dashscope specific error
        errorMessage = `Qwen API Error: ${error.response.data.code} - ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
);

// POST /api/ai/generate-lab-design
router.post(
  '/generate-lab-design',
  verifyToken,
  [
    body('topic').notEmpty().trim().escape().withMessage('Topic is required.'),
    body('gradeLevel').notEmpty().trim().escape().withMessage('Grade level is required.'),
    body('learningObjectives').notEmpty().trim().escape().withMessage('Learning objectives are required (newline-separated).'),
    body('durationMinutes').optional().isInt({ min: 10, max: 300 }).withMessage('Duration must be a positive integer (10-300 minutes).'),
    body('availableMaterials').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { topic, gradeLevel, learningObjectives, durationMinutes, availableMaterials } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not set.');
      return res.status(500).json({ success: false, message: 'AI service configuration error. API key missing.' });
    }

    let objectivesString = learningObjectives.split('\n').map(obj => `- ${obj.trim()}`).join('\n');

    let prompt = `
You are an expert science educator and lab designer with experience in creating engaging and safe laboratory experiments for various K-12 and undergraduate levels.

Design a detailed lab experiment based on the following specifications:

Topic: ${topic}
Grade Level: ${gradeLevel}
Learning Objectives:
${objectivesString}
`;

    if (durationMinutes) {
      prompt += `\nEstimated Duration: Approximately ${durationMinutes} minutes. The lab steps should be feasible within this timeframe.`;
    } else {
      prompt += `\nEstimated Duration: Suggest a typical duration for a lab of this nature and scope.`;
    }

    if (availableMaterials) {
      prompt += `\nAvailable Materials: Consider these materials primarily: ${availableMaterials}. If essential materials are missing from this list, please note them as "Additionally Required".`;
    } else {
      prompt += `\nAvailable Materials: List all commonly available school laboratory materials required for this experiment.`;
    }

    prompt += `

The lab design should include the following sections, clearly marked using Markdown:

1.  **Lab Title:** A concise and descriptive title.
2.  **Grade Level & Subject:** (e.g., Grade 9-10 Chemistry, AP Physics C). Re-state or refine based on topic.
3.  **Learning Objectives:** (Re-state or expand upon the provided objectives).
4.  **Background Information:** A brief overview of the scientific concepts relevant to the lab.
5.  **Safety Precautions:** List all necessary safety measures, including personal protective equipment (PPE) and specific hazard warnings.
6.  **Materials and Equipment:** A comprehensive list of all materials, chemicals (with concentrations if applicable), and equipment needed.
7.  **Procedure:** A step-by-step guide for conducting the experiment. Each step should be clear, actionable, and numbered. Include details about measurements, observations to be made, and data to be collected.
8.  **Data Collection and Analysis:** Instructions on what data to record (e.g., create a table format if appropriate) and how to analyze it (e.g., calculations, graph plotting).
9.  **Expected Results:** A brief description of what students should typically observe or conclude.
10. **Discussion Questions:** Thought-provoking questions to help students reflect on the lab, connect concepts, and consider sources of error.
11. **Clean-up and Disposal:** Proper instructions for cleaning equipment and disposing of waste materials.
12. **(Optional) Teacher Notes / Preparation:** Any specific notes for the teacher, including setup instructions or tips for success.

Ensure the language is appropriate for the specified grade level. The procedure should be detailed enough for students to follow with minimal ambiguity. Emphasize safety throughout.
Provide the entire output in Markdown format.
    `.trim();

    try {
      const deepSeekResponse = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are an expert science educator and lab designer.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 3000,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (deepSeekResponse.data && deepSeekResponse.data.choices && deepSeekResponse.data.choices.length > 0) {
        const labDesignText = deepSeekResponse.data.choices[0].message.content;
        res.json({ success: true, labDesignText });
      } else {
        console.error('Unexpected response structure from DeepSeek API:', deepSeekResponse.data);
        res.status(500).json({ success: false, message: 'Failed to generate lab design due to unexpected API response.' });
      }
    } catch (error) {
      console.error('Error calling DeepSeek API for lab design:', error.response ? error.response.data : error.message);
      let errorMessage = 'Failed to generate lab design.';
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        errorMessage = `DeepSeek API Error: ${error.response.data.error.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
);

// POST /api/ai/generate-lesson-text-block
router.post(
  '/generate-lesson-text-block',
  verifyToken,
  [
    body('prompt').notEmpty().trim().escape().withMessage('A prompt is required to generate text.').isLength({ min: 10, max: 2000 }).withMessage('Prompt must be between 10 and 2000 characters.'),
    // Optional: Add context parameters like 'tone', 'style', 'targetAudienceGradeLevel' if needed
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prompt: userPrompt } = req.body;
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      console.error('GROK_API_KEY is not set.');
      return res.status(500).json({ success: false, message: 'AI service (Grok) configuration error. API key missing.' });
    }

    try {
      // Using a hypothetical Grok API structure similar to OpenAI's chat completions
      // Replace with actual Grok API endpoint and request structure
      const grokResponse = await axios.post(
        process.env.GROK_API_URL || 'https://api.xai.com/v1/chat/completions', // Use env var for URL or default
        {
          model: process.env.GROK_MODEL || 'grok-1', // Use env var for model or default
          messages: [
            { role: 'system', content: 'You are an AI assistant that generates educational text content for lesson blocks. Be concise and clear.' },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: parseInt(process.env.GROK_MAX_TOKENS || "1000"), // Allow configuration
          temperature: parseFloat(process.env.GROK_TEMPERATURE || "0.7"),
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (grokResponse.data && grokResponse.data.choices && grokResponse.data.choices.length > 0 && grokResponse.data.choices[0].message) {
        const generatedText = grokResponse.data.choices[0].message.content;
        res.json({ success: true, generatedText });
      } else {
        console.error('Unexpected response structure from Grok API:', grokResponse.data);
        res.status(500).json({ success: false, message: 'Failed to generate text block due to unexpected API response from Grok.' });
      }
    } catch (error: any) {
      console.error('Error calling Grok API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      let errorMessage = 'Failed to generate text block from AI.';
      if (error.response && error.response.data && (error.response.data.error?.message || error.response.data.message) ) {
        errorMessage = `Grok API Error: ${error.response.data.error?.message || error.response.data.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
);

// POST /api/ai/generate-quiz
router.post(
  '/generate-quiz',
  verifyToken,
  [
    body('topic').notEmpty().trim().escape().withMessage('Topic is required.'),
    body('numQuestions').isInt({ min: 1, max: 20 }).withMessage('Number of questions must be between 1 and 20.'),
    body('questionType').isIn(['multiple-choice']).withMessage("Only 'multiple-choice' question type is currently supported."),
    // Add other potential parameters like difficulty, specific subtopics, etc. later
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { topic, numQuestions, questionType } = req.body;
    const apiKey = process.env.QWEN_API_KEY;

    if (!apiKey) {
      console.error('QWEN_API_KEY is not set.');
      return res.status(500).json({ success: false, message: 'AI service (Qwen) configuration error. API key missing.' });
    }

    // Construct the prompt for Qwen, emphasizing JSON output
    const prompt = `
Generate a quiz with ${numQuestions} ${questionType} questions on the topic of "${topic}".
For each question, provide:
1. The question text.
2. A list of 4 answer options, each labeled A, B, C, D.
3. The label of the correct answer option (e.g., "C").

Please format the entire output as a single, valid JSON array. Each element in the array should be an object representing a question, structured as follows:
{
  "question_text": "Your question here",
  "options": [
    {"label": "A", "text": "Option A text"},
    {"label": "B", "text": "Option B text"},
    {"label": "C", "text": "Option C text"},
    {"label": "D", "text": "Option D text"}
  ],
  "correct_answer_label": "C"
}

Ensure the JSON is valid and complete. Do not include any introductory text or explanations outside of the JSON array itself.
    `.trim();

    try {
      // Qwen API details might vary based on specific model and access method (DashScope vs other)
      // This example uses a common structure for chat models via DashScope.
      const qwenResponse = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', // Common endpoint, model specified in body
        {
          model: 'qwen1.5-72b-chat', // Example model - use the specific one you have access to
          input: {
            messages: [
              { role: 'system', content: 'You are an AI assistant that generates quizzes in strict JSON format.' },
              { role: 'user', content: prompt },
            ],
          },
          parameters: {
            result_format: 'message', // To get the content from message.content
            // max_tokens might be implicitly handled or you can set it.
            // temperature: 0.3, // Lower for more deterministic JSON output
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            // 'X-DashScope-SSE': 'disable', // If you don't want streaming for this call
          },
        }
      );

      let rawContent;
      // Check response structure - this can vary slightly with Qwen models/endpoints
      if (qwenResponse.data && qwenResponse.data.output && qwenResponse.data.output.choices && qwenResponse.data.output.choices[0].message) {
        rawContent = qwenResponse.data.output.choices[0].message.content;
      } else if (qwenResponse.data && qwenResponse.data.output && qwenResponse.data.output.text) { // Alternative structure
        rawContent = qwenResponse.data.output.text;
      } else {
        console.error('Unexpected response structure from Qwen API:', qwenResponse.data);
        return res.status(500).json({ success: false, message: 'Failed to generate quiz due to unexpected API response structure.' });
      }

      // Attempt to parse the JSON content
      // The AI might sometimes include markdown backticks around the JSON, try to remove them.
      if (rawContent.startsWith("```json")) {
        rawContent = rawContent.substring(7, rawContent.length - 3).trim();
      } else if (rawContent.startsWith("```")) {
         rawContent = rawContent.substring(3, rawContent.length - 3).trim();
      }


      try {
        const quizQuestions = JSON.parse(rawContent);
        if (!Array.isArray(quizQuestions)) {
            throw new Error("AI output was valid JSON but not an array as expected.");
        }
        // Further validation of the structure of quizQuestions can be added here.
        res.json({
            success: true,
            quiz: {
                title: `Quiz on ${topic}`, // Auto-generated title
                questions: quizQuestions
            }
        });
      } catch (parseError: any) {
        console.error('Failed to parse Qwen API response as JSON:', parseError.message);
        console.error('Raw AI output that failed parsing:', rawContent); // Log the raw output for debugging
        res.status(500).json({ success: false, message: 'Failed to parse AI output. Raw output logged.', rawOutput: rawContent });
      }

    } catch (error: any) {
      console.error('Error calling Qwen API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      let errorMessage = 'Failed to generate quiz.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Qwen API Error: ${error.response.data.message}`;
      } else if (error.response && error.response.data && error.response.data.code) { // Dashscope specific error structure
        errorMessage = `Qwen API Error: ${error.response.data.code} - ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      res.status(500).json({ success: false, message: errorMessage });
    }
  }
);

module.exports = router;

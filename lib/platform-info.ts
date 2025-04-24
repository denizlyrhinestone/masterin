// This file contains information about the platform for use in AI responses

const platformInfo = {
  name: "Masterin",
  tagline: "AI-Powered Education",
  description: "Advanced AI solutions for modern education",
  version: "2.0",
  lastUpdated: "2023-11-15",

  features: [
    {
      id: "ai-tutor",
      name: "AI Tutor",
      description: "Get personalized explanations and answers to any academic question",
      icon: "Brain",
      capabilities: [
        "Instant answers to academic questions",
        "Step-by-step explanations of complex concepts",
        "Subject-specific knowledge across disciplines",
        "Interactive practice problems and quizzes",
        "Personalized learning paths based on your progress",
      ],
      benefits: [
        "Learn at your own pace",
        "Get help whenever you need it",
        "Understand difficult concepts more easily",
        "Build confidence in your academic abilities",
      ],
      examples: [
        {
          question: "Can you explain the concept of photosynthesis?",
          response:
            "Photosynthesis is the process by which plants convert light energy into chemical energy. The basic equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This happens in the chloroplasts, specifically in structures called thylakoids which contain chlorophyll.",
        },
        {
          question: "How do I solve quadratic equations?",
          response:
            "Quadratic equations (ax² + bx + c = 0) can be solved using the quadratic formula: x = (-b ± √(b² - 4ac))/2a. You can also try factoring or completing the square depending on the specific equation.",
        },
      ],
    },
    {
      id: "essay-assistant",
      name: "Essay Assistant",
      description: "Get help with writing, editing, and improving your essays",
      icon: "FileText",
      capabilities: [
        "Structure suggestions for different essay types",
        "Grammar and style improvements",
        "Citation and reference formatting",
        "Thesis statement development",
        "Argument strengthening and evidence analysis",
      ],
      benefits: [
        "Improve your writing skills",
        "Save time on editing and proofreading",
        "Learn proper academic writing techniques",
        "Get better grades on written assignments",
      ],
      examples: [
        {
          question: "How do I write a strong thesis statement?",
          response:
            "A strong thesis statement should be specific, arguable, and concise. For example, instead of 'Climate change is bad,' try 'Implementing carbon taxes at the corporate level would significantly reduce greenhouse gas emissions while promoting innovation in sustainable technologies.'",
        },
      ],
    },
    {
      id: "math-solver",
      name: "Math Problem Solver",
      description: "Step-by-step solutions for algebra, calculus, and more",
      icon: "Calculator",
      capabilities: [
        "Solve equations and systems of equations",
        "Calculate derivatives and integrals",
        "Graph functions and analyze their properties",
        "Solve word problems with detailed explanations",
        "Provide step-by-step solutions with explanations",
      ],
      benefits: [
        "Understand the solution process, not just the answer",
        "Learn mathematical concepts through practice",
        "Check your work and identify mistakes",
        "Build confidence in your math abilities",
      ],
      examples: [
        {
          question: "Solve the equation 2x² + 5x - 3 = 0",
          response:
            "To solve 2x² + 5x - 3 = 0, we can use the quadratic formula: x = (-b ± √(b² - 4ac))/2a where a=2, b=5, c=-3. Substituting these values: x = (-5 ± √(25 + 24))/4 = (-5 ± √49)/4 = (-5 ± 7)/4. This gives us x = 1/2 or x = -3.",
        },
      ],
    },
  ],

  subjects: [
    {
      name: "Mathematics",
      topics: ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry", "Number Theory"],
      description: "From basic arithmetic to advanced calculus, our AI tutor can help with all areas of mathematics.",
      commonQuestions: [
        "How do I solve quadratic equations?",
        "Can you explain integration by parts?",
        "What's the difference between permutations and combinations?",
        "How do I find the area under a curve?",
      ],
    },
    {
      name: "Science",
      topics: ["Physics", "Chemistry", "Biology", "Astronomy", "Earth Science", "Environmental Science"],
      description: "Explore scientific concepts with detailed explanations and visual aids to enhance understanding.",
      commonQuestions: [
        "How does DNA replication work?",
        "Can you explain Newton's laws of motion?",
        "What is the periodic table organized by?",
        "How do stars form and evolve?",
      ],
    },
    {
      name: "Computer Science",
      topics: ["Programming", "Data Structures", "Algorithms", "Web Development", "Databases", "Machine Learning"],
      description: "Learn programming languages, algorithms, and computer science concepts with our AI tutor.",
      commonQuestions: [
        "How do I write a recursive function?",
        "What's the difference between arrays and linked lists?",
        "How does the HTTP protocol work?",
        "Can you explain Big O notation?",
      ],
    },
    {
      name: "Humanities",
      topics: ["History", "Literature", "Philosophy", "Art History", "Religious Studies", "Cultural Studies"],
      description: "Explore the human experience through history, literature, philosophy, and cultural studies.",
      commonQuestions: [
        "What were the main causes of World War II?",
        "Can you analyze the themes in Shakespeare's Hamlet?",
        "What are the main philosophical arguments for free will?",
        "How did the Renaissance influence modern art?",
      ],
    },
  ],

  pricing: {
    free: {
      name: "Free Trial",
      price: "$0/month",
      features: [
        "5 AI tutor questions per day",
        "Basic concept explanations",
        "Limited subject coverage",
        "24-hour chat history",
      ],
      bestFor: "Students who want to try out the platform before committing",
      limitations: [
        "Limited daily questions",
        "No file uploads",
        "Basic explanations only",
        "No personalized study plans",
      ],
    },
    premium: {
      name: "Premium",
      price: "$9.99/month",
      features: [
        "Unlimited AI tutor questions",
        "Detailed explanations with examples",
        "All subjects covered",
        "File upload for problem solving",
        "Personalized study plans",
        "Unlimited chat history",
      ],
      bestFor: "Individual students serious about improving their academic performance",
      savings: "Save 20% with annual billing ($95.88/year)",
    },
    team: {
      name: "Team",
      price: "$29.99/month",
      features: [
        "Everything in Premium",
        "Up to 10 user accounts",
        "Team analytics dashboard",
        "Custom curriculum integration",
        "Priority support",
        "Admin controls",
      ],
      bestFor: "Study groups, tutoring centers, and small classrooms",
      savings: "Save 25% with annual billing ($269.88/year)",
    },
  },

  faq: [
    {
      question: "How does Masterin's AI tutor work?",
      answer:
        "Our AI tutor uses advanced natural language processing to understand your questions and provide personalized explanations. It's trained on high-quality educational content across various subjects and can adapt to your learning style and pace. The AI analyzes your questions, identifies the concepts you're asking about, and generates detailed explanations with examples and visual aids when appropriate.",
    },
    {
      question: "Is Masterin suitable for all learning levels?",
      answer:
        "Yes! Masterin is designed to help learners at all levels, from elementary school to university and professional development. The AI adapts its explanations based on your current understanding and gradually increases complexity as you progress. We support students from grade school through graduate-level studies, with content tailored to different educational standards and curricula.",
    },
    {
      question: "Can I upload my homework problems?",
      answer:
        "Yes, with our Premium and Team plans, you can upload images of homework problems, worksheets, or textbook pages. Our AI will analyze the content and provide step-by-step solutions and explanations. This feature is particularly helpful for math, science, and other technical subjects where visual problem representation is important.",
    },
    {
      question: "How accurate is the AI tutor?",
      answer:
        "Our AI tutor is trained on high-quality educational content and is regularly updated with the latest information. While it strives for accuracy, we recommend verifying critical information with official textbooks or instructors, especially for specialized or advanced topics. If you ever notice an inaccuracy, please report it so we can improve our system.",
    },
    {
      question: "Can I use Masterin for test preparation?",
      answer:
        "Masterin is an excellent tool for test preparation. You can practice with sample problems, get explanations for concepts you're struggling with, and create personalized study plans. Our AI can help you prepare for standardized tests, school exams, and college entrance exams by focusing on the areas where you need the most improvement.",
    },
  ],

  resources: {
    articles: [
      {
        title: "Effective Study Techniques Based on Cognitive Science",
        url: "/resources/articles/effective-study-techniques",
        topics: ["study skills", "learning", "memory", "productivity"],
      },
      {
        title: "How to Prepare for Standardized Tests",
        url: "/resources/articles/standardized-test-prep",
        topics: ["test preparation", "SAT", "ACT", "GRE", "GMAT"],
      },
      {
        title: "The Science of Learning: How to Retain Information Better",
        url: "/resources/articles/science-of-learning",
        topics: ["memory", "learning", "neuroscience", "study techniques"],
      },
      {
        title: "Writing Effective Essays: A Step-by-Step Guide",
        url: "/resources/articles/essay-writing-guide",
        topics: ["writing", "essays", "academic writing", "english"],
      },
    ],
    videos: [
      {
        title: "Introduction to Calculus",
        url: "/resources/videos/intro-to-calculus",
        duration: "45 minutes",
        topics: ["mathematics", "calculus", "derivatives", "integrals"],
      },
      {
        title: "Python Programming for Beginners",
        url: "/resources/videos/python-beginners",
        duration: "60 minutes",
        topics: ["programming", "python", "computer science"],
      },
      {
        title: "Understanding Chemical Reactions",
        url: "/resources/videos/chemical-reactions",
        duration: "30 minutes",
        topics: ["chemistry", "science", "reactions", "molecules"],
      },
      {
        title: "Literary Analysis Techniques",
        url: "/resources/videos/literary-analysis",
        duration: "40 minutes",
        topics: ["literature", "english", "analysis", "writing"],
      },
    ],
    tools: [
      {
        title: "Interactive Periodic Table",
        url: "/tools/periodic-table",
        description: "Explore elements and their properties with this interactive tool",
        subjects: ["Chemistry"],
      },
      {
        title: "Graphing Calculator",
        url: "/tools/graphing-calculator",
        description: "Plot functions and visualize mathematical concepts",
        subjects: ["Mathematics"],
      },
      {
        title: "Code Playground",
        url: "/tools/code-playground",
        description: "Practice programming with an interactive code editor",
        subjects: ["Computer Science", "Programming"],
      },
      {
        title: "Historical Timeline Creator",
        url: "/tools/timeline-creator",
        description: "Create interactive timelines for historical events",
        subjects: ["History"],
      },
    ],
  },

  responseTemplates: {
    greeting: "Hi there! I'm your AI assistant from Masterin. How can I help with your learning journey today?",

    subjectInquiry:
      "I'd be happy to help with {subject}! Our AI tutor has extensive knowledge in this area. What specific topic or question do you have about {subject}?",

    featureExplanation:
      "Our {feature} is designed to {description}. It can help you with {capabilities}. Would you like to see an example of how it works?",

    pricingInformation:
      "Masterin offers several pricing plans to fit different needs:\n\n• {freePlan}: {freePrice} - {freeFeatures}\n• {premiumPlan}: {premiumPrice} - {premiumFeatures}\n• {teamPlan}: {teamPrice} - {teamFeatures}\n\nWhich plan are you most interested in learning more about?",

    conceptExplanation:
      "Let me explain {concept}:\n\n{explanation}\n\nWould you like me to go into more detail or provide an example?",

    problemSolving:
      "Let's solve this {subject} problem step by step:\n\n{steps}\n\nDoes this approach make sense to you?",

    resourceRecommendation:
      "Based on your interest in {topic}, you might find these resources helpful:\n\n{resources}\n\nWould you like more specific recommendations?",

    clarificationRequest:
      "I want to make sure I understand your question correctly. Are you asking about {interpretation} or something else?",

    followUp: "Is there anything specific about {topic} that you'd like me to explain further?",

    errorResponse:
      "I apologize, but I'm not able to provide information about {topic} at this time. Would you like to explore a related topic that I can help with?",

    thankYou:
      "You're welcome! I'm glad I could help. If you have any more questions about {topic} or anything else, feel free to ask.",
  },
}

export default platformInfo

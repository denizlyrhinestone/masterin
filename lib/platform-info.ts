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

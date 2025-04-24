// This is a simplified version of the platform-info.ts file
// In a real implementation, this would contain more detailed information

const platformInfo = {
  name: "Masterin",
  description: "AI-powered education platform",

  features: [
    {
      id: "ai-tutor",
      name: "AI Tutor",
      description: "Get personalized explanations and answers to any academic question",
      capabilities: [
        "Answer questions in natural language",
        "Provide step-by-step explanations",
        "Adapt to your learning style",
        "Cover a wide range of subjects",
      ],
      benefits: [
        "Learn at your own pace",
        "Get help anytime, anywhere",
        "Understand complex concepts easily",
        "Improve your grades",
      ],
      examples: [
        {
          question: "Can you explain how photosynthesis works?",
          response:
            "Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in the chloroplasts of plant cells and involves several steps...",
        },
      ],
    },
    {
      id: "essay-assistant",
      name: "Essay Assistant",
      description: "Get help with writing, editing, and improving your essays",
      capabilities: [
        "Provide writing suggestions",
        "Help with structure and organization",
        "Improve grammar and style",
        "Generate ideas and outlines",
      ],
      benefits: [
        "Write better essays",
        "Save time on editing",
        "Learn writing techniques",
        "Get feedback on your work",
      ],
      examples: [],
    },
  ],

  subjects: [
    {
      name: "Mathematics",
      topics: ["Algebra", "Calculus", "Geometry", "Statistics"],
      description: "Learn mathematics with personalized explanations and practice problems",
      commonQuestions: [
        "How do I solve quadratic equations?",
        "Can you explain derivatives?",
        "What is the Pythagorean theorem?",
      ],
    },
    {
      name: "Science",
      topics: ["Physics", "Chemistry", "Biology", "Astronomy"],
      description: "Explore scientific concepts with detailed explanations and visual aids",
      commonQuestions: ["How does gravity work?", "Can you explain the periodic table?", "What is photosynthesis?"],
    },
  ],

  pricing: {
    free: {
      name: "Free Trial",
      price: "$0/month",
      features: ["5 AI tutor questions per day", "Basic concept explanations", "Limited subject coverage"],
      bestFor: "Students who want to try out the platform",
      limitations: ["Limited daily questions", "No file uploads", "Basic explanations only"],
    },
    premium: {
      name: "Premium",
      price: "$9.99/month",
      features: [
        "Unlimited AI tutor questions",
        "Detailed explanations with examples",
        "All subjects covered",
        "File upload for problem solving",
      ],
      bestFor: "Individual students serious about improving",
      savings: "Save 20% with annual billing",
    },
    team: {
      name: "Team",
      price: "$29.99/month",
      features: [
        "Everything in Premium",
        "Up to 10 user accounts",
        "Team analytics dashboard",
        "Custom curriculum integration",
      ],
      bestFor: "Study groups and small classrooms",
      savings: "Save 25% with annual billing",
    },
  },

  faq: [
    {
      question: "How does the AI tutor work?",
      answer:
        "Our AI tutor uses advanced natural language processing to understand your questions and provide personalized explanations.",
    },
    {
      question: "What subjects are covered?",
      answer: "We cover a wide range of subjects including mathematics, science, humanities, languages, and more.",
    },
  ],

  resources: {
    articles: [
      {
        title: "Effective Study Techniques",
        url: "/resources/articles/effective-study-techniques",
        topics: ["study skills", "learning", "memory"],
      },
    ],
    videos: [
      {
        title: "Introduction to Calculus",
        url: "/resources/videos/intro-to-calculus",
        duration: "45 minutes",
        topics: ["mathematics", "calculus"],
      },
    ],
    tools: [
      {
        title: "Interactive Periodic Table",
        url: "/tools/periodic-table",
        description: "Explore elements and their properties",
        subjects: ["Chemistry"],
      },
    ],
  },

  responseTemplates: {
    greeting: "Hi there! I'm your AI assistant from Masterin. How can I help with your learning today?",

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

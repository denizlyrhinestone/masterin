/**
 * Platform information for use across components
 * This centralizes information about Masterin's features, capabilities, and offerings
 */

export const platformInfo = {
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
        {
          question: "Can you help me structure a compare and contrast essay?",
          response:
            "For a compare and contrast essay, you can use either the block method (discuss all aspects of item A, then all aspects of item B) or the point-by-point method (compare/contrast each aspect for both items before moving to the next aspect). Include an introduction with your thesis, body paragraphs with clear topic sentences, and a conclusion that synthesizes your findings.",
        },
      ],
    },
    {
      id: "math-solver",
      name: "Math Problem Solver",
      description: "Step-by-step solutions for algebra, calculus, and more",
      icon: "Calculator",
      capabilities: [
        "Equation solving with detailed steps",
        "Graph plotting and visualization",
        "Multiple solution approaches",
        "Formula explanations",
        "Word problem interpretation",
      ],
      benefits: [
        "Understand mathematical concepts deeply",
        "Learn different problem-solving strategies",
        "Visualize abstract mathematical ideas",
        "Build confidence in tackling difficult problems",
      ],
      examples: [
        {
          question: "How do I find the derivative of x²sin(x)?",
          response:
            "To find the derivative of x²sin(x), use the product rule: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x). Here, f(x) = x² and g(x) = sin(x). So, d/dx[x²sin(x)] = 2x·sin(x) + x²·cos(x) = 2x·sin(x) + x²·cos(x).",
        },
        {
          question: "How do I solve the system of equations: 2x + y = 5 and 3x - 2y = 4?",
          response:
            "To solve this system, you can use substitution or elimination. Using substitution: From the first equation, y = 5 - 2x. Substitute this into the second equation: 3x - 2(5 - 2x) = 4. Simplify: 3x - 10 + 4x = 4. So 7x - 10 = 4, thus 7x = 14, and x = 2. Then y = 5 - 2(2) = 5 - 4 = 1. The solution is (2, 1).",
        },
      ],
    },
    {
      id: "code-mentor",
      name: "Code Mentor",
      description: "Learn programming with AI-guided coding exercises and explanations",
      icon: "Code",
      capabilities: [
        "Code explanations in multiple languages",
        "Debugging assistance",
        "Best practices and optimization tips",
        "Project structure guidance",
        "Algorithm explanations",
      ],
      benefits: [
        "Learn programming concepts at your own pace",
        "Get unstuck when facing coding challenges",
        "Develop good coding habits from the start",
        "Prepare for technical interviews",
      ],
      examples: [
        {
          question: "How do I implement a binary search in Python?",
          response:
            "Here's a binary search implementation in Python:\n\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return -1  # Target not found\n```\n\nThis algorithm has O(log n) time complexity, making it efficient for large sorted arrays.",
        },
        {
          question: "What's the difference between let, const, and var in JavaScript?",
          response:
            "In JavaScript:\n\n- `var`: Function-scoped or globally-scoped, can be redeclared and updated, hoisted to the top of its scope\n- `let`: Block-scoped, can be updated but not redeclared within its scope, not hoisted\n- `const`: Block-scoped, cannot be updated or redeclared, not hoisted, must be initialized during declaration\n\nBest practice is to use `const` by default, and `let` when you need to reassign values. Avoid `var` in modern JavaScript.",
        },
      ],
    },
    {
      id: "study-notes",
      name: "Study Notes Generator",
      description: "Create concise study notes from textbooks or lecture materials",
      icon: "BookOpen",
      capabilities: [
        "Key concept extraction from uploaded materials",
        "Summarization of lengthy content",
        "Flashcard creation for effective review",
        "Visual organization of related concepts",
        "Custom note formatting options",
      ],
      benefits: [
        "Save time on note-taking",
        "Focus on understanding rather than transcribing",
        "Organize information more effectively",
        "Prepare for exams more efficiently",
      ],
      examples: [
        {
          question: "Can you summarize the key points about mitosis?",
          response:
            "Key points about mitosis:\n\n1. Mitosis is cell division resulting in two identical daughter cells\n2. Phases: Prophase, Metaphase, Anaphase, Telophase, and Cytokinesis\n3. Purpose: Growth, repair, and asexual reproduction\n4. Maintains the same chromosome number (diploid to diploid)\n5. Occurs in somatic cells throughout the body\n6. DNA replicates during interphase before mitosis begins\n7. Sister chromatids separate during anaphase\n8. Results in genetically identical cells",
        },
        {
          question: "How should I organize my notes for effective studying?",
          response:
            "Effective note organization strategies:\n\n1. Use hierarchical structure with main topics, subtopics, and details\n2. Implement color-coding for different types of information\n3. Create concept maps to show relationships between ideas\n4. Use the Cornell method (questions in left margin, notes on right, summary at bottom)\n5. Include visual elements like diagrams and charts\n6. Add your own examples to reinforce understanding\n7. Review and revise notes regularly\n8. Create summary sheets for quick review before exams",
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
      description: "Learn programming languages, algorithms, and computer science concepts with interactive examples.",
      commonQuestions: [
        "What's the difference between arrays and linked lists?",
        "How does the quicksort algorithm work?",
        "Can you explain object-oriented programming principles?",
        "What is Big O notation and why is it important?",
      ],
    },
    {
      name: "Humanities",
      topics: ["History", "Literature", "Philosophy", "Art History", "Religious Studies", "Cultural Studies"],
      description:
        "Explore human culture, history, and creative expression with our comprehensive humanities coverage.",
      commonQuestions: [
        "What were the main causes of World War II?",
        "Can you analyze the themes in Shakespeare's Hamlet?",
        "How did the Renaissance influence modern thinking?",
        "What are the main philosophical arguments for free will?",
      ],
    },
    {
      name: "Social Sciences",
      topics: ["Psychology", "Sociology", "Economics", "Political Science", "Anthropology", "Geography"],
      description: "Understand human behavior, societies, and systems through our social sciences resources.",
      commonQuestions: [
        "What's the difference between classical and operant conditioning?",
        "How do supply and demand affect market prices?",
        "What are the main theories of international relations?",
        "How do cultural norms influence individual behavior?",
      ],
    },
    {
      name: "Languages",
      topics: ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Russian", "Arabic"],
      description: "Master new languages with grammar explanations, vocabulary building, and conversation practice.",
      commonQuestions: [
        "What's the difference between the preterite and imperfect tenses in Spanish?",
        "How do I use articles in German?",
        "Can you explain the passive voice in English?",
        "What are the four tones in Mandarin Chinese?",
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
      question: "Can I use Masterin for homework help?",
      answer:
        "Absolutely. Masterin can help you understand concepts, solve problems, and check your work. Our AI tutor provides step-by-step explanations rather than just answers, helping you learn the material thoroughly. This approach ensures you understand the underlying concepts and can apply them to similar problems in the future. We encourage learning the process, not just getting the right answer.",
    },
    {
      question: "How accurate is the information provided?",
      answer:
        "Masterin's AI is trained on high-quality educational resources and regularly updated with the latest information. While we strive for accuracy, we recommend verifying critical information with official textbooks or instructors, especially for specialized topics. Our content team regularly reviews and updates the knowledge base to ensure accuracy and alignment with current educational standards.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. There are no cancellation fees or hidden charges. You can manage your subscription from your account settings page.",
    },
    {
      question: "How is Masterin different from other tutoring services?",
      answer:
        "Unlike traditional tutoring services that require scheduling and high hourly rates, Masterin provides instant, 24/7 access to AI tutoring at a fraction of the cost. Unlike other AI educational tools, our platform offers deep subject expertise across multiple disciplines, personalized learning paths, and a focus on building understanding rather than just providing answers. We combine the best of AI technology with sound educational principles.",
    },
    {
      question: "Does Masterin work on mobile devices?",
      answer:
        "Yes, Masterin is fully responsive and works on smartphones, tablets, laptops, and desktop computers. We have native apps for iOS and Android devices, as well as a web application that works in any modern browser. Your learning progress and chat history sync across all your devices.",
    },
    {
      question: "How do I get started with Masterin?",
      answer:
        "Getting started is easy! Simply create an account using your email or Google account, select the subjects you're interested in, and start asking questions. New users automatically get a 7-day free trial of our Premium features. You can explore the platform, try out different features, and see how Masterin can help with your specific learning needs before deciding on a subscription plan.",
    },
  ],

  // New section for user personas to help with contextual responses
  userPersonas: [
    {
      type: "high_school_student",
      needs: ["Homework help", "Test preparation", "Understanding basic concepts", "Project assistance"],
      recommendedFeatures: ["AI Tutor", "Study Notes Generator"],
      recommendedPlan: "Premium (Individual)",
    },
    {
      type: "college_student",
      needs: [
        "Deep conceptual understanding",
        "Research paper assistance",
        "Exam preparation",
        "Advanced problem solving",
      ],
      recommendedFeatures: ["AI Tutor", "Essay Assistant", "Math Problem Solver"],
      recommendedPlan: "Premium (Individual)",
    },
    {
      type: "teacher",
      needs: [
        "Lesson planning",
        "Creating educational materials",
        "Differentiating instruction",
        "Assessment creation",
      ],
      recommendedFeatures: ["Study Notes Generator", "AI Tutor", "Math Problem Solver"],
      recommendedPlan: "Team",
    },
    {
      type: "parent",
      needs: [
        "Supporting child's homework",
        "Explaining difficult concepts",
        "Monitoring learning progress",
        "Finding additional practice",
      ],
      recommendedFeatures: ["AI Tutor", "Math Problem Solver"],
      recommendedPlan: "Premium (Family)",
    },
    {
      type: "professional",
      needs: ["Skill development", "Certification preparation", "Refreshing knowledge", "Learning new technologies"],
      recommendedFeatures: ["Code Mentor", "AI Tutor", "Study Notes Generator"],
      recommendedPlan: "Premium (Individual)",
    },
  ],

  // New section for integration with learning resources
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
        title: "Understanding Learning Styles and How to Leverage Them",
        url: "/resources/articles/learning-styles",
        topics: ["learning styles", "education", "personalization"],
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
        title: "Understanding the Scientific Method",
        url: "/resources/videos/scientific-method",
        duration: "30 minutes",
        topics: ["science", "research", "methodology"],
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
        title: "Citation Generator",
        url: "/tools/citation-generator",
        description: "Create properly formatted citations for research papers",
        subjects: ["Writing", "Research"],
      },
    ],
  },

  // New section for contextual response templates
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

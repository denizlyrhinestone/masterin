// Course types and interfaces
export interface Instructor {
  id: string
  name: string
  title: string
  bio: string
  avatar: string
}

export interface LearningObjective {
  id: string
  description: string
}

export interface Resource {
  id: string
  title: string
  description: string
  type: "pdf" | "video" | "link" | "audio" | "image"
  url: string
  size?: string
  duration?: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  timeLimit: number // in minutes
  questions: number
  points: number
}

export interface Assignment {
  id: string
  title: string
  description: string
  dueDate?: string
  points: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  type: "video" | "reading" | "quiz" | "assignment"
  videoUrl?: string
  content?: string
  completed?: boolean
  quiz?: Quiz
  assignment?: Assignment
  resources?: Resource[]
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  longDescription: string
  category: string
  subcategory?: string
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  thumbnail: string
  duration: string
  modules: Module[]
  instructor: Instructor
  learningObjectives: LearningObjective[]
  resources: Resource[]
  enrollmentCount: number
  rating: number
  reviewCount: number
  featured?: boolean
  popular?: boolean
  new?: boolean
  price?: number
  enrollmentStatus?: "Open" | "Closed" | "Coming Soon"
}

// Sample instructors data
export const instructors: Record<string, Instructor> = {
  "jane-smith": {
    id: "jane-smith",
    name: "Dr. Jane Smith",
    title: "Professor of Biology",
    bio: "Dr. Jane Smith has over 15 years of experience teaching biology at both high school and university levels. She specializes in cellular biology and genetics, and has published numerous research papers in leading scientific journals.",
    avatar: "/thoughtful-professor.png",
  },
  "michael-johnson": {
    id: "michael-johnson",
    name: "Prof. Michael Johnson",
    title: "Chemistry Educator",
    bio: "Professor Johnson is a passionate chemistry educator with a background in organic chemistry research. He has developed innovative teaching methods that make complex chemistry concepts accessible to students of all levels.",
    avatar: "/thoughtful-professor.png",
  },
  "sarah-williams": {
    id: "sarah-williams",
    name: "Dr. Sarah Williams",
    title: "Environmental Scientist",
    bio: "Dr. Williams combines her research in environmental science with a dedication to education. She has led field studies across the globe and brings real-world environmental challenges into her teaching.",
    avatar: "/focused-researcher.png",
  },
  "robert-chen": {
    id: "robert-chen",
    name: "Prof. Robert Chen",
    title: "Mathematics Specialist",
    bio: "Professor Chen has a gift for making mathematics engaging and understandable. With a background in applied mathematics, he connects abstract concepts to real-world applications that resonate with students.",
    avatar: "/chalkboard-equations.png",
  },
  "emily-parker": {
    id: "emily-parker",
    name: "Dr. Emily Parker",
    title: "Physics Educator",
    bio: "Dr. Parker specializes in making physics accessible and exciting for students. Her hands-on approach to teaching and clear explanations help students build strong foundations in physical sciences.",
    avatar: "/thoughtful-physics-professor.png",
  },
}

// Sample courses data
export const courses: Course[] = [
  {
    id: "biology-101",
    slug: "biology-101",
    title: "Biology 101",
    subtitle: "Introduction to Biological Concepts",
    description: "A comprehensive introduction to the fundamental concepts of biology for middle school students.",
    longDescription:
      "This course provides a solid foundation in biological sciences, covering cell structure, genetics, evolution, and ecosystems. Through engaging lessons, interactive activities, and hands-on experiments, students will develop a deep understanding of how living organisms function and interact with their environment. The course is designed to foster scientific curiosity and critical thinking skills essential for future science education.",
    category: "Biology",
    level: "Beginner",
    thumbnail: "/microscopic-life.png",
    duration: "8 weeks",
    instructor: instructors["jane-smith"],
    enrollmentCount: 1245,
    rating: 4.8,
    reviewCount: 256,
    featured: true,
    popular: true,
    enrollmentStatus: "Open",
    learningObjectives: [
      {
        id: "obj1",
        description: "Understand the basic structure and function of cells",
      },
      {
        id: "obj2",
        description: "Explain the principles of genetics and inheritance",
      },
      {
        id: "obj3",
        description: "Describe the process of evolution and natural selection",
      },
      {
        id: "obj4",
        description: "Identify the components of ecosystems and their interactions",
      },
      {
        id: "obj5",
        description: "Develop skills in scientific observation and experimentation",
      },
    ],
    modules: [
      {
        id: "module1",
        title: "Introduction to Biology",
        description: "An overview of biological sciences and the scientific method",
        lessons: [
          {
            id: "lesson1-1",
            title: "What is Biology?",
            description: "An introduction to the study of life and living organisms",
            duration: "15 min",
            type: "video",
            videoUrl: "https://example.com/videos/intro-to-biology",
            completed: false,
            resources: [
              {
                id: "resource1-1",
                title: "Introduction to Biology Slides",
                description: "Slide deck from the video lecture",
                type: "pdf",
                url: "/resources/intro-biology-slides.pdf",
                size: "2.4 MB",
              },
            ],
          },
          {
            id: "lesson1-2",
            title: "The Scientific Method",
            description: "Understanding how scientists investigate the natural world",
            duration: "20 min",
            type: "video",
            videoUrl: "https://example.com/videos/scientific-method",
            completed: false,
          },
          {
            id: "lesson1-3",
            title: "Scientific Method Quiz",
            description: "Test your understanding of the scientific method",
            duration: "15 min",
            type: "quiz",
            completed: false,
            quiz: {
              id: "quiz1",
              title: "Scientific Method Quiz",
              description: "Test your understanding of the scientific method",
              timeLimit: 15,
              questions: 10,
              points: 20,
            },
          },
        ],
      },
      {
        id: "module2",
        title: "Cell Biology",
        description: "Exploring the structure and function of cells",
        lessons: [
          {
            id: "lesson2-1",
            title: "Cell Structure",
            description: "Understanding the components of plant and animal cells",
            duration: "25 min",
            type: "video",
            videoUrl: "https://example.com/videos/cell-structure",
            completed: false,
          },
          {
            id: "lesson2-2",
            title: "Cell Function",
            description: "How cells carry out life processes",
            duration: "20 min",
            type: "video",
            videoUrl: "https://example.com/videos/cell-function",
            completed: false,
          },
          {
            id: "lesson2-3",
            title: "Cell Observation Lab",
            description: "Virtual lab for observing cells under a microscope",
            duration: "30 min",
            type: "assignment",
            completed: false,
            assignment: {
              id: "assignment1",
              title: "Cell Observation Lab Report",
              description: "Complete a lab report based on your virtual microscope observations",
              dueDate: "2023-10-15",
              points: 50,
            },
          },
        ],
      },
      {
        id: "module3",
        title: "Genetics",
        description: "Understanding DNA, genes, and inheritance",
        lessons: [
          {
            id: "lesson3-1",
            title: "DNA Structure",
            description: "The molecular structure of DNA and its function",
            duration: "22 min",
            type: "video",
            videoUrl: "https://example.com/videos/dna-structure",
            completed: false,
          },
          {
            id: "lesson3-2",
            title: "Inheritance Patterns",
            description: "How traits are passed from parents to offspring",
            duration: "18 min",
            type: "video",
            videoUrl: "https://example.com/videos/inheritance",
            completed: false,
          },
        ],
      },
    ],
    resources: [
      {
        id: "course-resource1",
        title: "Biology Textbook",
        description: "Comprehensive textbook covering all course topics",
        type: "pdf",
        url: "/resources/biology-textbook.pdf",
        size: "15.2 MB",
      },
      {
        id: "course-resource2",
        title: "Biology Glossary",
        description: "Glossary of important biological terms",
        type: "pdf",
        url: "/resources/biology-glossary.pdf",
        size: "3.5 MB",
      },
      {
        id: "course-resource3",
        title: "Virtual Microscope Tool",
        description: "Interactive tool for virtual microscope observations",
        type: "link",
        url: "https://example.com/virtual-microscope",
      },
    ],
  },
  {
    id: "chemistry-fundamentals",
    slug: "chemistry-fundamentals",
    title: "Chemistry Fundamentals",
    subtitle: "Exploring the Building Blocks of Matter",
    description: "An engaging introduction to chemistry concepts for middle and high school students.",
    longDescription:
      "This course introduces students to the fascinating world of chemistry. Students will explore atomic structure, chemical bonding, reactions, and the periodic table. Through interactive simulations, virtual labs, and guided experiments, students will develop a strong foundation in chemical principles and laboratory skills. The course emphasizes real-world applications of chemistry in everyday life, technology, and environmental science.",
    category: "Chemistry",
    level: "Beginner",
    thumbnail: "/colorful-chemistry-lab.png",
    duration: "10 weeks",
    instructor: instructors["michael-johnson"],
    enrollmentCount: 982,
    rating: 4.7,
    reviewCount: 187,
    popular: true,
    enrollmentStatus: "Open",
    learningObjectives: [
      {
        id: "chem-obj1",
        description: "Understand atomic structure and the periodic table",
      },
      {
        id: "chem-obj2",
        description: "Explain chemical bonding and molecular formation",
      },
      {
        id: "chem-obj3",
        description: "Balance chemical equations and predict reaction outcomes",
      },
      {
        id: "chem-obj4",
        description: "Perform basic laboratory procedures safely",
      },
      {
        id: "chem-obj5",
        description: "Apply chemistry concepts to real-world situations",
      },
    ],
    modules: [
      {
        id: "chem-module1",
        title: "Introduction to Chemistry",
        description: "The basics of chemistry and its importance",
        lessons: [
          {
            id: "chem-lesson1-1",
            title: "What is Chemistry?",
            description: "An overview of chemistry and its branches",
            duration: "18 min",
            type: "video",
            videoUrl: "https://example.com/videos/intro-to-chemistry",
            completed: false,
          },
          {
            id: "chem-lesson1-2",
            title: "Laboratory Safety",
            description: "Essential safety procedures for chemistry experiments",
            duration: "15 min",
            type: "video",
            videoUrl: "https://example.com/videos/lab-safety",
            completed: false,
          },
        ],
      },
      {
        id: "chem-module2",
        title: "Atomic Structure",
        description: "Understanding the atom and its components",
        lessons: [
          {
            id: "chem-lesson2-1",
            title: "The Atom",
            description: "Structure and components of atoms",
            duration: "22 min",
            type: "video",
            videoUrl: "https://example.com/videos/atomic-structure",
            completed: false,
          },
          {
            id: "chem-lesson2-2",
            title: "Electron Configuration",
            description: "How electrons are arranged in atoms",
            duration: "20 min",
            type: "video",
            videoUrl: "https://example.com/videos/electron-configuration",
            completed: false,
          },
        ],
      },
    ],
    resources: [
      {
        id: "chem-resource1",
        title: "Chemistry Textbook",
        description: "Comprehensive textbook covering all course topics",
        type: "pdf",
        url: "/resources/chemistry-textbook.pdf",
        size: "18.7 MB",
      },
      {
        id: "chem-resource2",
        title: "Periodic Table Reference",
        description: "Interactive periodic table with element information",
        type: "link",
        url: "https://example.com/interactive-periodic-table",
      },
    ],
  },
  {
    id: "environmental-science",
    slug: "environmental-science",
    title: "Environmental Science",
    subtitle: "Understanding Our Planet and Its Systems",
    description: "Explore the relationships between ecosystems, human activities, and environmental challenges.",
    longDescription:
      "This course examines the complex interactions between Earth's natural systems and human activities. Students will investigate ecosystems, biodiversity, climate science, and sustainability practices. Through case studies, data analysis, and field study techniques, students will develop an understanding of current environmental challenges and potential solutions. The course emphasizes critical thinking about environmental issues and empowers students to make informed decisions about sustainability.",
    category: "Environmental Science",
    level: "Intermediate",
    thumbnail: "/interconnected-ecosystems.png",
    duration: "12 weeks",
    instructor: instructors["sarah-williams"],
    enrollmentCount: 756,
    rating: 4.9,
    reviewCount: 132,
    featured: true,
    enrollmentStatus: "Open",
    learningObjectives: [
      {
        id: "env-obj1",
        description: "Understand the structure and function of ecosystems",
      },
      {
        id: "env-obj2",
        description: "Analyze the impact of human activities on the environment",
      },
      {
        id: "env-obj3",
        description: "Evaluate solutions to environmental challenges",
      },
      {
        id: "env-obj4",
        description: "Apply principles of sustainability to real-world scenarios",
      },
    ],
    modules: [
      {
        id: "env-module1",
        title: "Introduction to Environmental Science",
        description: "The foundations of environmental science and key concepts",
        lessons: [
          {
            id: "env-lesson1-1",
            title: "What is Environmental Science?",
            description: "An overview of the field and its importance",
            duration: "20 min",
            type: "video",
            videoUrl: "https://example.com/videos/intro-to-environmental-science",
            completed: false,
          },
          {
            id: "env-lesson1-2",
            title: "Earth's Systems",
            description: "Understanding the interconnected systems of our planet",
            duration: "25 min",
            type: "video",
            videoUrl: "https://example.com/videos/earth-systems",
            completed: false,
          },
        ],
      },
      {
        id: "env-module2",
        title: "Ecosystems",
        description: "Exploring ecosystem structure, function, and biodiversity",
        lessons: [
          {
            id: "env-lesson2-1",
            title: "Ecosystem Components",
            description: "The living and non-living components of ecosystems",
            duration: "22 min",
            type: "video",
            videoUrl: "https://example.com/videos/ecosystem-components",
            completed: false,
          },
          {
            id: "env-lesson2-2",
            title: "Biodiversity",
            description: "The importance of species diversity for ecosystem health",
            duration: "24 min",
            type: "video",
            videoUrl: "https://example.com/videos/biodiversity",
            completed: false,
          },
        ],
      },
    ],
    resources: [
      {
        id: "env-resource1",
        title: "Environmental Science Textbook",
        description: "Comprehensive textbook covering all course topics",
        type: "pdf",
        url: "/resources/environmental-science-textbook.pdf",
        size: "20.3 MB",
      },
      {
        id: "env-resource2",
        title: "Ecosystem Case Studies",
        description: "Collection of case studies on various ecosystems",
        type: "pdf",
        url: "/resources/ecosystem-case-studies.pdf",
        size: "8.5 MB",
      },
    ],
  },
  {
    id: "ap-biology",
    slug: "ap-biology",
    title: "AP Biology",
    subtitle: "College-Level Biology for High School Students",
    description: "Comprehensive preparation for the AP Biology exam with in-depth coverage of all required topics.",
    longDescription:
      "This Advanced Placement course provides rigorous, college-level instruction in biology. Students will explore topics including cellular processes, genetics, evolution, and biological systems in depth. The course includes extensive laboratory work, data analysis, and scientific writing to develop the skills needed for success on the AP exam and in college science courses. Students will engage with complex biological concepts through inquiry-based learning and collaborative problem-solving.",
    category: "Biology",
    subcategory: "AP Courses",
    level: "Advanced",
    thumbnail: "/placeholder.svg?height=400&width=600&query=advanced+biology+lab",
    duration: "32 weeks",
    instructor: instructors["jane-smith"],
    enrollmentCount: 542,
    rating: 4.9,
    reviewCount: 98,
    featured: true,
    enrollmentStatus: "Open",
    learningObjectives: [
      {
        id: "ap-bio-obj1",
        description: "Master college-level biology concepts and principles",
      },
      {
        id: "ap-bio-obj2",
        description: "Develop advanced laboratory and data analysis skills",
      },
      {
        id: "ap-bio-obj3",
        description: "Apply biological knowledge to analyze complex problems",
      },
      {
        id: "ap-bio-obj4",
        description: "Prepare thoroughly for the AP Biology examination",
      },
    ],
    modules: [
      {
        id: "ap-bio-module1",
        title: "Chemistry of Life",
        description: "The chemical foundations of biological systems",
        lessons: [
          {
            id: "ap-bio-lesson1-1",
            title: "Biological Macromolecules",
            description: "Structure and function of carbohydrates, lipids, proteins, and nucleic acids",
            duration: "35 min",
            type: "video",
            videoUrl: "https://example.com/videos/biological-macromolecules",
            completed: false,
          },
          {
            id: "ap-bio-lesson1-2",
            title: "Enzymes and Metabolism",
            description: "How enzymes facilitate biochemical reactions",
            duration: "40 min",
            type: "video",
            videoUrl: "https://example.com/videos/enzymes-metabolism",
            completed: false,
          },
        ],
      },
      {
        id: "ap-bio-module2",
        title: "Cell Structure and Function",
        description: "Advanced study of cellular components and processes",
        lessons: [
          {
            id: "ap-bio-lesson2-1",
            title: "Cell Membrane Structure",
            description: "Detailed examination of membrane structure and function",
            duration: "30 min",
            type: "video",
            videoUrl: "https://example.com/videos/cell-membrane",
            completed: false,
          },
          {
            id: "ap-bio-lesson2-2",
            title: "Cellular Respiration",
            description: "The processes of glycolysis, Krebs cycle, and electron transport chain",
            duration: "45 min",
            type: "video",
            videoUrl: "https://example.com/videos/cellular-respiration",
            completed: false,
          },
        ],
      },
    ],
    resources: [
      {
        id: "ap-bio-resource1",
        title: "AP Biology Textbook",
        description: "College-level biology textbook aligned with AP curriculum",
        type: "pdf",
        url: "/resources/ap-biology-textbook.pdf",
        size: "25.8 MB",
      },
      {
        id: "ap-bio-resource2",
        title: "AP Biology Lab Manual",
        description: "Comprehensive guide to all required AP Biology labs",
        type: "pdf",
        url: "/resources/ap-biology-lab-manual.pdf",
        size: "18.2 MB",
      },
      {
        id: "ap-bio-resource3",
        title: "AP Exam Prep Materials",
        description: "Practice questions and exam strategies",
        type: "pdf",
        url: "/resources/ap-biology-exam-prep.pdf",
        size: "10.5 MB",
      },
    ],
  },
  {
    id: "algebra-101",
    slug: "algebra-101",
    title: "Algebra 101",
    subtitle: "Building a Strong Foundation in Algebraic Concepts",
    description: "A comprehensive introduction to algebraic concepts and problem-solving techniques.",
    longDescription:
      "This course provides a solid foundation in algebraic concepts and problem-solving techniques. Students will explore fundamental algebraic operations, equations, inequalities, functions, and their applications. Through guided practice, interactive examples, and real-world applications, students will develop the mathematical reasoning skills essential for success in higher-level math courses. The course emphasizes both conceptual understanding and procedural fluency.",
    category: "Mathematics",
    level: "Beginner",
    thumbnail: "/abstract-mathematics.png",
    duration: "16 weeks",
    instructor: instructors["robert-chen"],
    enrollmentCount: 1245,
    rating: 4.8,
    reviewCount: 256,
    popular: true,
    enrollmentStatus: "Open",
    learningObjectives: [
      {
        id: "alg-obj1",
        description: "Solve linear equations and inequalities",
      },
      {
        id: "alg-obj2",
        description: "Graph and interpret linear and quadratic functions",
      },
      {
        id: "alg-obj3",
        description: "Apply algebraic techniques to solve word problems",
      },
      {
        id: "alg-obj4",
        description: "Understand polynomial expressions and operations",
      },
    ],
    modules: [
      {
        id: "alg-module1",
        title: "Introduction to Algebra",
        description: "The language and basic concepts of algebra",
        lessons: [
          {
            id: "alg-lesson1-1",
            title: "What is Algebra?",
            description: "An introduction to algebraic thinking and notation",
            duration: "20 min",
            type: "video",
            videoUrl: "https://example.com/videos/intro-to-algebra",
            completed: false,
          },
          {
            id: "alg-lesson1-2",
            title: "Variables and Expressions",
            description: "Working with variables and algebraic expressions",
            duration: "25 min",
            type: "video",
            videoUrl: "https://example.com/videos/variables-expressions",
            completed: false,
          },
        ],
      },
      {
        id: "alg-module2",
        title: "Linear Equations",
        description: "Solving and applying linear equations",
        lessons: [
          {
            id: "alg-lesson2-1",
            title: "Solving Linear Equations",
            description: "Techniques for solving one-variable linear equations",
            duration: "30 min",
            type: "video",
            videoUrl: "https://example.com/videos/linear-equations",
            completed: false,
          },
          {
            id: "alg-lesson2-2",
            title: "Word Problems with Linear Equations",
            description: "Applying linear equations to real-world scenarios",
            duration: "35 min",
            type: "video",
            videoUrl: "https://example.com/videos/linear-word-problems",
            completed: false,
          },
        ],
      },
    ],
    resources: [
      {
        id: "alg-resource1",
        title: "Algebra Textbook",
        description: "Comprehensive textbook covering all course topics",
        type: "pdf",
        url: "/resources/algebra-textbook.pdf",
        size: "16.4 MB",
      },
      {
        id: "alg-resource2",
        title: "Algebra Formula Sheet",
        description: "Quick reference guide to important formulas",
        type: "pdf",
        url: "/resources/algebra-formulas.pdf",
        size: "2.1 MB",
      },
      {
        id: "alg-resource3",
        title: "Interactive Graphing Tool",
        description: "Online tool for exploring algebraic functions",
        type: "link",
        url: "https://example.com/interactive-graphing",
      },
    ],
  },
  {
    id: "world-history",
    slug: "world-history",
    title: "World History",
    subtitle: "Exploring Civilizations and Global Development",
    description: "A journey through major civilizations, events, and cultural developments throughout human history.",
    longDescription:
      "This course takes students on a journey through the development of human civilizations from ancient times to the modern era. Students will explore major historical periods, significant events, cultural achievements, and the interconnections between different societies across the globe. Through primary source analysis, historical inquiry, and engaging multimedia content, students will develop a deeper understanding of how past events have shaped our world today.",
    category: "History",
    level: "Intermediate",
    thumbnail: "/ancient-civilizations-timeline.png",
    duration: "16 weeks",
    instructor: {
      id: "david-miller",
      name: "Prof. David Miller",
      title: "History Educator",
      bio: "Professor Miller has taught history for over 20 years and specializes in making historical events relevant and engaging for students. His storytelling approach brings the past to life in the classroom.",
      avatar: "/placeholder.svg?height=200&width=200&query=history+professor",
    },
    enrollmentCount: 876,
    rating: 4.7,
    reviewCount: 165,
    popular: true,
    enrollmentStatus: "Open",
    learningObjectives: [
      {
        id: "hist-obj1",
        description: "Identify major civilizations and their contributions to human development",
      },
      {
        id: "hist-obj2",
        description: "Analyze the causes and effects of significant historical events",
      },
      {
        id: "hist-obj3",
        description: "Evaluate primary and secondary historical sources",
      },
      {
        id: "hist-obj4",
        description: "Understand the interconnections between different societies throughout history",
      },
    ],
    modules: [
      {
        id: "hist-module1",
        title: "Ancient Civilizations",
        description: "The rise of early human civilizations",
        lessons: [
          {
            id: "hist-lesson1-1",
            title: "Mesopotamia and Egypt",
            description: "The first urban civilizations and their achievements",
            duration: "30 min",
            type: "video",
            videoUrl: "https://example.com/videos/mesopotamia-egypt",
            completed: false,
          },
          {
            id: "hist-lesson1-2",
            title: "Ancient Greece",
            description: "Greek civilization and its influence on the Western world",
            duration: "35 min",
            type: "video",
            videoUrl: "https://example.com/videos/ancient-greece",
            completed: false,
          },
        ],
      },
      {
        id: "hist-module2",
        title: "Medieval World",
        description: "Global developments during the Middle Ages",
        lessons: [
          {
            id: "hist-lesson2-1",
            title: "European Feudalism",
            description: "The political and social structure of medieval Europe",
            duration: "25 min",
            type: "video",
            videoUrl: "https://example.com/videos/european-feudalism",
            completed: false,
          },
          {
            id: "hist-lesson2-2",
            title: "Islamic Golden Age",
            description: "Scientific and cultural achievements in the Islamic world",
            duration: "28 min",
            type: "video",
            videoUrl: "https://example.com/videos/islamic-golden-age",
            completed: false,
          },
        ],
      },
    ],
    resources: [
      {
        id: "hist-resource1",
        title: "World History Textbook",
        description: "Comprehensive textbook covering all course topics",
        type: "pdf",
        url: "/resources/world-history-textbook.pdf",
        size: "22.7 MB",
      },
      {
        id: "hist-resource2",
        title: "Historical Atlas",
        description: "Collection of historical maps and timelines",
        type: "pdf",
        url: "/resources/historical-atlas.pdf",
        size: "15.3 MB",
      },
      {
        id: "hist-resource3",
        title: "Primary Source Collection",
        description: "Anthology of important historical documents",
        type: "pdf",
        url: "/resources/primary-sources.pdf",
        size: "10.8 MB",
      },
    ],
  },
]

// Helper function to get course by slug
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug)
}

// Helper function to get courses by category
export function getCoursesByCategory(category: string): Course[] {
  return courses.filter((course) => course.category === category)
}

// Helper function to get featured courses
export function getFeaturedCourses(): Course[] {
  return courses.filter((course) => course.featured)
}

// Helper function to get popular courses
export function getPopularCourses(): Course[] {
  return courses.filter((course) => course.popular)
}

// Helper function to get new courses
export function getNewCourses(): Course[] {
  return courses.filter((course) => course.new)
}

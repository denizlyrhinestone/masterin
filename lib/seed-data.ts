import { executeQuery } from "@/lib/db"

export async function seedDatabase() {
  try {
    // Check if we already have data
    const usersCount = await executeQuery<{ count: string }>("SELECT COUNT(*) as count FROM users")

    if (Number.parseInt(usersCount[0].count, 10) > 0) {
      console.log("Database already has data, skipping seed")
      return
    }

    // Seed categories
    const categories = [
      {
        name: "Programming",
        description: "Learn coding, web development, and software engineering",
        image_url: "/images/categories/programming.jpg",
        color: "bg-blue-500",
      },
      {
        name: "Data Science",
        description: "Master data analysis, machine learning, and AI concepts",
        image_url: "/images/categories/data-science.jpg",
        color: "bg-purple-500",
      },
      {
        name: "Design",
        description: "Explore UI/UX, graphic design, and creative tools",
        image_url: "/images/categories/design.jpg",
        color: "bg-pink-500",
      },
      {
        name: "Business",
        description: "Develop entrepreneurship and management skills",
        image_url: "/images/categories/business.jpg",
        color: "bg-green-500",
      },
      {
        name: "Languages",
        description: "Learn new languages with interactive lessons",
        image_url: "/images/categories/languages.jpg",
        color: "bg-yellow-500",
      },
      {
        name: "Mathematics",
        description: "Master mathematical concepts from basic to advanced",
        image_url: "/images/categories/mathematics.jpg",
        color: "bg-red-500",
      },
    ]

    for (const category of categories) {
      await executeQuery(
        `INSERT INTO categories (name, description, image_url, color)
         VALUES ($1, $2, $3, $4)`,
        [category.name, category.description, category.image_url, category.color],
      )
    }

    // Seed demo user
    const demoUser = await executeQuery(
      `INSERT INTO users (id, name, email, role, bio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        "00000000-0000-0000-0000-000000000001", // Fixed ID for demo user
        "Demo User",
        "demo@example.com",
        "student",
        "I am a student interested in learning new skills.",
      ],
    )

    // Seed instructors
    const instructors = [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        bio: "Full-stack developer with 10 years of experience",
      },
      {
        name: "Dr. Michael Chen",
        email: "michael.chen@example.com",
        bio: "PhD in Computer Science, specializing in machine learning",
      },
      {
        name: "Emma Rodriguez",
        email: "emma.rodriguez@example.com",
        bio: "UI/UX designer with experience at top tech companies",
      },
      {
        name: "James Wilson",
        email: "james.wilson@example.com",
        bio: "Data scientist and Python expert",
      },
    ]

    const instructorIds = []

    for (const instructor of instructors) {
      const result = await executeQuery(
        `INSERT INTO users (name, email, role, bio)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [instructor.name, instructor.email, "instructor", instructor.bio],
      )

      instructorIds.push(result[0].id)
    }

    // Get category IDs
    const categoryResults = await executeQuery("SELECT id, name FROM categories")
    const categoryMap = categoryResults.reduce(
      (map, category) => {
        map[category.name.toLowerCase().replace(/\s+/g, "-")] = category.id
        return map
      },
      {} as Record<string, string>,
    )

    // Seed courses
    const courses = [
      {
        title: "Full-Stack Web Development",
        slug: "web-development",
        description: `This comprehensive course covers everything you need to know to become a full-stack web developer. 
        You'll learn front-end technologies like HTML, CSS, JavaScript, and React, as well as back-end 
        technologies like Node.js, Express, and MongoDB. By the end of this course, you'll be able to 
        build complete web applications from scratch.`,
        instructor_id: instructorIds[0], // Sarah Johnson
        category_id: categoryMap["programming"],
        level: "intermediate",
        price: 299,
        duration: "12 weeks",
        image_url: "/images/classes/web-development.jpg",
        is_published: true,
      },
      {
        title: "Machine Learning Fundamentals",
        slug: "machine-learning",
        description: `Dive into the world of machine learning with this advanced course. You'll learn the mathematical 
        foundations of machine learning algorithms, how to implement them from scratch, and how to use 
        popular libraries like scikit-learn and TensorFlow. This course includes hands-on projects to 
        apply your knowledge to real-world problems.`,
        instructor_id: instructorIds[1], // Dr. Michael Chen
        category_id: categoryMap["data-science"],
        level: "advanced",
        price: 399,
        duration: "10 weeks",
        image_url: "/images/classes/machine-learning.jpg",
        is_published: true,
      },
      {
        title: "UI/UX Design Principles",
        slug: "ui-design",
        description: `Learn the principles of effective UI/UX design in this beginner-friendly course. You'll discover 
        how to create intuitive, accessible, and visually appealing interfaces that users love. The course 
        covers design theory, user research, wireframing, prototyping, and usability testing.`,
        instructor_id: instructorIds[2], // Emma Rodriguez
        category_id: categoryMap["design"],
        level: "beginner",
        price: 249,
        duration: "8 weeks",
        image_url: "/images/classes/ui-design.jpg",
        is_published: true,
      },
      {
        title: "Python for Data Analysis",
        slug: "python-programming",
        description: `Master Python for data analysis in this intermediate course. You'll learn how to use libraries like 
        NumPy, Pandas, and Matplotlib to analyze and visualize data. The course includes real-world projects 
        to help you build a portfolio of data analysis work.`,
        instructor_id: instructorIds[3], // James Wilson
        category_id: categoryMap["programming"],
        level: "intermediate",
        price: 199,
        duration: "6 weeks",
        image_url: "/images/classes/python-programming.jpg",
        is_published: true,
      },
    ]

    for (const course of courses) {
      await executeQuery(
        `INSERT INTO courses (title, slug, description, instructor_id, category_id, level, price, duration, image_url, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          course.title,
          course.slug,
          course.description,
          course.instructor_id,
          course.category_id,
          course.level,
          course.price,
          course.duration,
          course.image_url,
          course.is_published,
        ],
      )
    }

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}

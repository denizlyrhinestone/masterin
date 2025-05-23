-- Insert subjects
INSERT INTO subjects (name, slug, description, icon, color)
VALUES
  ('Mathematics', 'mathematics', 'Explore numbers, operations, geometry, and more', 'Calculator', '#4F46E5'),
  ('Science', 'science', 'Discover the natural world through observation and experimentation', 'Flask', '#10B981'),
  ('Language Arts', 'language-arts', 'Develop reading, writing, speaking, and listening skills', 'BookOpen', '#F59E0B'),
  ('Social Studies', 'social-studies', 'Learn about history, geography, economics, and civics', 'Globe', '#EC4899'),
  ('Art', 'art', 'Express creativity through various mediums and techniques', 'Palette', '#8B5CF6'),
  ('Technology', 'technology', 'Develop digital literacy and computational thinking', 'Laptop', '#3B82F6');

-- Insert grade levels
INSERT INTO grade_levels (name, slug, description, level_order)
VALUES
  ('Kindergarten', 'kindergarten', 'Foundation for early learning', 1),
  ('1st Grade', '1st-grade', 'Building basic skills', 2),
  ('2nd Grade', '2nd-grade', 'Expanding knowledge', 3),
  ('3rd Grade', '3rd-grade', 'Developing independence', 4),
  ('4th Grade', '4th-grade', 'Strengthening fundamentals', 5),
  ('5th Grade', '5th-grade', 'Preparing for middle school', 6),
  ('6th Grade', '6th-grade', 'Transition to middle school', 7),
  ('7th Grade', '7th-grade', 'Exploring diverse subjects', 8),
  ('8th Grade', '8th-grade', 'Preparing for high school', 9),
  ('9th Grade', '9th-grade', 'High school foundations', 10),
  ('10th Grade', '10th-grade', 'Building on high school concepts', 11),
  ('11th Grade', '11th-grade', 'Advanced academic preparation', 12),
  ('12th Grade', '12th-grade', 'College and career readiness', 13);

-- Insert sample courses
INSERT INTO courses (title, slug, description, subject_id, grade_level_id, thumbnail_url, duration_minutes, is_featured, is_published, common_core_alignment, prerequisites, learning_objectives, materials_needed)
VALUES
  ('Elementary Algebra Fundamentals', 'elementary-algebra-fundamentals', 'A comprehensive introduction to algebraic concepts for elementary students', 1, 6, '/images/courses/algebra-fundamentals.jpg', 1200, true, true, 'CCSS.Math.Content.5.OA.A.1, CCSS.Math.Content.5.OA.A.2', 'Basic arithmetic skills', 'Understand variables, solve simple equations, interpret algebraic expressions', 'Notebook, pencil, ruler'),
  
  ('Introduction to Scientific Method', 'introduction-to-scientific-method', 'Learn the process of scientific inquiry and experimentation', 2, 5, '/images/courses/scientific-method.jpg', 900, true, true, 'NGSS.5-PS1-3, NGSS.5-PS1-4', 'None', 'Understand scientific method steps, design experiments, analyze results', 'Science notebook, basic household materials for experiments'),
  
  ('Reading Comprehension Strategies', 'reading-comprehension-strategies', 'Develop effective strategies for understanding and analyzing texts', 3, 4, '/images/courses/reading-comprehension.jpg', 1080, true, true, 'CCSS.ELA-LITERACY.RL.4.1, CCSS.ELA-LITERACY.RL.4.2', 'Basic reading skills', 'Identify main ideas, make inferences, summarize texts', 'Grade-appropriate books, reading journal'),
  
  ('U.S. History: Colonial America', 'us-history-colonial-america', 'Explore the founding and development of the American colonies', 4, 8, '/images/courses/colonial-america.jpg', 1350, false, true, 'CCSS.ELA-LITERACY.RH.6-8.1, CCSS.ELA-LITERACY.RH.6-8.2', 'None', 'Understand colonial settlement, analyze primary sources, explain colonial governance', 'Textbook, notebook, access to online resources'),
  
  ('Digital Art Fundamentals', 'digital-art-fundamentals', 'Introduction to creating art using digital tools and techniques', 5, 9, '/images/courses/digital-art.jpg', 1080, true, true, 'National Core Arts Standards VA:Cr1.1.HSI, VA:Cr2.1.HSI', 'Basic computer skills', 'Use digital art tools, apply design principles, create original artwork', 'Computer with graphics software'),
  
  ('Coding for Beginners', 'coding-for-beginners', 'Introduction to programming concepts and basic coding skills', 6, 7, '/images/courses/coding-beginners.jpg', 1200, true, true, 'CSTA 2-AP-10, CSTA 2-AP-11', 'Basic computer skills', 'Understand programming concepts, write simple programs, debug code', 'Computer with internet access'),
  
  ('Middle School Pre-Algebra', 'middle-school-pre-algebra', 'Preparation for algebra with focus on equations and variables', 1, 7, '/images/courses/pre-algebra.jpg', 1350, false, true, 'CCSS.Math.Content.7.EE.B.3, CCSS.Math.Content.7.EE.B.4', 'Elementary math proficiency', 'Solve multi-step problems, work with variables, understand negative numbers', 'Notebook, pencil, calculator'),
  
  ('Earth Science Exploration', 'earth-science-exploration', 'Discover the dynamic systems of Earth, from geology to meteorology', 2, 6, '/images/courses/earth-science.jpg', 1080, false, true, 'NGSS.MS-ESS1-1, NGSS.MS-ESS2-1', 'None', 'Explain Earth\'s systems, analyze geological processes, understand weather patterns', 'Science notebook, colored pencils'),
  
  ('Creative Writing Workshop', 'creative-writing-workshop', 'Develop storytelling skills and creative expression through writing', 3, 8, '/images/courses/creative-writing.jpg', 900, false, true, 'CCSS.ELA-LITERACY.W.8.3, CCSS.ELA-LITERACY.W.8.5', 'Basic writing skills', 'Create original stories, develop characters, revise and edit work', 'Writing journal, access to word processor'),
  
  ('World Geography', 'world-geography', 'Explore the physical and cultural geography of our global community', 4, 6, '/images/courses/world-geography.jpg', 1200, false, true, 'CCSS.ELA-LITERACY.RH.6-8.7, NCSS.D2.Geo.2.6-8', 'None', 'Interpret maps, understand cultural regions, analyze geographic influences', 'Atlas or access to online maps, notebook'),
  
  ('Introduction to Watercolor Painting', 'introduction-to-watercolor-painting', 'Learn the fundamentals of watercolor techniques and color theory', 5, 5, '/images/courses/watercolor-painting.jpg', 900, false, true, 'National Core Arts Standards VA:Cr1.1.5, VA:Cr2.1.5', 'None', 'Apply watercolor techniques, understand color mixing, create original paintings', 'Watercolor paints, paper, brushes'),
  
  ('Digital Citizenship', 'digital-citizenship', 'Learn responsible and ethical behavior in our digital world', 6, 5, '/images/courses/digital-citizenship.jpg', 720, false, true, 'ISTE Standards for Students 2a, 2b, 2c', 'Basic computer skills', 'Practice online safety, understand digital footprint, evaluate online information', 'Computer with internet access'),
  
  ('High School Geometry', 'high-school-geometry', 'Comprehensive study of geometric concepts, proofs, and applications', 1, 10, '/images/courses/geometry.jpg', 1500, true, true, 'CCSS.Math.Content.HSG.CO.A.1, CCSS.Math.Content.HSG.CO.B.8', 'Algebra I', 'Construct geometric proofs, analyze geometric relationships, solve geometric problems', 'Compass, ruler, protractor, notebook'),
  
  ('Biology: Cells and Genetics', 'biology-cells-and-genetics', 'Explore cellular structures, functions, and genetic principles', 2, 10, '/images/courses/biology-cells.jpg', 1350, true, true, 'NGSS.HS-LS1-1, NGSS.HS-LS3-1', 'Middle school science', 'Explain cell structures, analyze genetic inheritance, understand DNA replication', 'Science notebook, access to microscope images'),
  
  ('American Literature Survey', 'american-literature-survey', 'Explore major works and movements in American literary history', 3, 11, '/images/courses/american-literature.jpg', 1500, false, true, 'CCSS.ELA-LITERACY.RL.11-12.1, CCSS.ELA-LITERACY.RL.11-12.2', 'High school reading level', 'Analyze literary works, understand historical context, write critical essays', 'Literature anthology, notebook'),
  
  ('Economics Fundamentals', 'economics-fundamentals', 'Introduction to basic economic principles and financial literacy', 4, 12, '/images/courses/economics.jpg', 1200, false, true, 'CCSS.ELA-LITERACY.RH.11-12.7, C3.D2.Eco.1.9-12', 'None', 'Understand economic systems, analyze market forces, apply economic reasoning', 'Notebook, calculator, access to news sources');

-- Insert sample lessons for Elementary Algebra Fundamentals
INSERT INTO lessons (course_id, title, slug, description, content, duration_minutes, order_index, is_published)
VALUES
  (1, 'Introduction to Variables', 'introduction-to-variables', 'Understanding what variables are and how they are used in algebra', '<h1>Introduction to Variables</h1><p>Variables are symbols that represent values that may change. In algebra, we often use letters like x, y, and z to represent variables.</p><h2>Learning Objectives</h2><ul><li>Understand what variables are</li><li>Recognize how variables are used in expressions</li><li>Translate word problems into algebraic expressions</li></ul><h2>Key Concepts</h2><p>A variable is a symbol, usually a letter, that represents a number we don\'t know yet or a number that can change.</p><p>For example, in the expression 3x + 5, the variable x can take different values, and the result of the expression will change accordingly.</p><h2>Examples</h2><p>If x = 2, then 3x + 5 = 3(2) + 5 = 6 + 5 = 11</p><p>If x = 5, then 3x + 5 = 3(5) + 5 = 15 + 5 = 20</p><h2>Practice Problems</h2><ol><li>If y = 3, what is the value of 2y + 4?</li><li>If a = 7, what is the value of 10 - a?</li><li>Write an expression for "5 more than twice a number n"</li></ol>', 45, 1, true),
  
  (1, 'Simple Equations', 'simple-equations', 'Learning to solve basic one-step equations', '<h1>Simple Equations</h1><p>An equation is a mathematical statement that shows two expressions are equal. Solving an equation means finding the value of the variable that makes the equation true.</p><h2>Learning Objectives</h2><ul><li>Understand what an equation is</li><li>Solve one-step addition and subtraction equations</li><li>Solve one-step multiplication and division equations</li></ul><h2>Key Concepts</h2><p>To solve an equation, we need to isolate the variable (get it by itself on one side of the equation).</p><p>We can perform the same operation on both sides of an equation without changing its solution.</p><h2>Examples</h2><p>Solving x + 5 = 12:</p><p>x + 5 = 12</p><p>x + 5 - 5 = 12 - 5 (subtract 5 from both sides)</p><p>x = 7</p><p>Solving 3y = 15:</p><p>3y = 15</p><p>3y ÷ 3 = 15 ÷ 3 (divide both sides by 3)</p><p>y = 5</p><h2>Practice Problems</h2><ol><li>Solve: x - 8 = 20</li><li>Solve: 6z = 42</li><li>Solve: m/4 = 9</li></ol>', 45, 2, true),
  
  (1, 'Working with Expressions', 'working-with-expressions', 'Simplifying and evaluating algebraic expressions', '<h1>Working with Expressions</h1><p>An algebraic expression is a combination of variables, numbers, and operations. Simplifying expressions helps us work with them more easily.</p><h2>Learning Objectives</h2><ul><li>Combine like terms in expressions</li><li>Evaluate expressions for given values</li><li>Apply the distributive property</li></ul><h2>Key Concepts</h2><p>Like terms are terms that have the same variable(s) raised to the same power(s).</p><p>The distributive property: a(b + c) = ab + ac</p><h2>Examples</h2><p>Simplifying 3x + 5x - 2:</p><p>3x + 5x - 2 = (3 + 5)x - 2 = 8x - 2</p><p>Using the distributive property:</p><p>2(x + 3) = 2x + 2(3) = 2x + 6</p><h2>Practice Problems</h2><ol><li>Simplify: 7y + 2 - 3y + 5</li><li>Simplify: 4(x + 2) - 3x</li><li>Evaluate 2a + b when a = 3 and b = 4</li></ol>', 45, 3, true),
  
  (1, 'Word Problems', 'word-problems', 'Translating real-world situations into algebraic equations', '<h1>Word Problems</h1><p>Algebra helps us solve real-world problems by translating situations into equations that we can solve.</p><h2>Learning Objectives</h2><ul><li>Identify key information in word problems</li><li>Translate word problems into algebraic equations</li><li>Solve and interpret the solutions</li></ul><h2>Key Concepts</h2><p>Steps for solving word problems:</p><ol><li>Read the problem carefully</li><li>Identify what you\'re looking for</li><li>Assign a variable to the unknown quantity</li><li>Write an equation based on the information given</li><li>Solve the equation</li><li>Check your answer in the context of the original problem</li></ol><h2>Examples</h2><p>Problem: Sarah has 24 stickers. She has 8 more stickers than Tom. How many stickers does Tom have?</p><p>Let t = the number of stickers Tom has</p><p>Sarah has 8 more stickers than Tom, so: Sarah\'s stickers = t + 8</p><p>We know Sarah has 24 stickers, so: t + 8 = 24</p><p>Solving for t: t = 16</p><p>Therefore, Tom has 16 stickers.</p><h2>Practice Problems</h2><ol><li>John is 5 years older than his sister. If John is 12 years old, how old is his sister?</li><li>A rectangle has a perimeter of 30 cm. If the width is 5 cm, what is the length?</li><li>Maria has $15 more than twice what David has. If Maria has $45, how much does David have?</li></ol>', 45, 4, true),
  
  (1, 'Graphing on the Coordinate Plane', 'graphing-coordinate-plane', 'Understanding the coordinate system and plotting points', '<h1>Graphing on the Coordinate Plane</h1><p>The coordinate plane is a two-dimensional surface with an x-axis (horizontal) and y-axis (vertical) that allows us to locate points precisely.</p><h2>Learning Objectives</h2><ul><li>Understand the coordinate plane system</li><li>Plot points on the coordinate plane</li><li>Identify coordinates of given points</li></ul><h2>Key Concepts</h2><p>A point on the coordinate plane is represented by an ordered pair (x, y).</p><p>The x-coordinate tells us how far to move horizontally from the origin (0, 0).</p><p>The y-coordinate tells us how far to move vertically from the origin.</p><p>The coordinate plane is divided into four quadrants.</p><h2>Examples</h2><p>To plot the point (3, 4):</p><ol><li>Start at the origin (0, 0)</li><li>Move 3 units to the right (positive x-direction)</li><li>From there, move 4 units up (positive y-direction)</li></ol><h2>Practice Problems</h2><ol><li>Plot the following points on a coordinate plane: A(2, 5), B(-3, 4), C(0, -2), D(-1, -3)</li><li>Identify the quadrant in which each point is located</li><li>What are the coordinates of a point that is 3 units left and 2 units down from the origin?</li></ol>', 45, 5, true);

-- Insert sample lessons for Introduction to Scientific Method
INSERT INTO lessons (course_id, title, slug, description, content, duration_minutes, order_index, is_published)
VALUES
  (2, 'What is Science?', 'what-is-science', 'Understanding the nature and importance of scientific inquiry', '<h1>What is Science?</h1><p>Science is a systematic way of understanding the natural world through observation, experimentation, and analysis.</p><h2>Learning Objectives</h2><ul><li>Define science and its purpose</li><li>Distinguish between science and non-science</li><li>Recognize the importance of evidence in scientific thinking</li></ul><h2>Key Concepts</h2><p>Science is based on:</p><ul><li>Observable evidence</li><li>Testable ideas</li><li>Logical reasoning</li><li>Peer review and verification</li></ul><p>Science helps us understand how things work, make predictions, and solve problems.</p><h2>Discussion Questions</h2><ol><li>How do we use science in our everyday lives?</li><li>What makes something "scientific" versus "non-scientific"?</li><li>Why is it important to base conclusions on evidence?</li></ol><h2>Activity</h2><p>In small groups, identify three questions that could be answered through scientific investigation and three questions that science cannot answer. Explain your reasoning for each.</p>', 30, 1, true),
  
  (2, 'Steps of the Scientific Method', 'steps-scientific-method', 'Learning the systematic approach scientists use to investigate questions', '<h1>Steps of the Scientific Method</h1><p>The scientific method is a process that scientists use to investigate questions and solve problems in a systematic way.</p><h2>Learning Objectives</h2><ul><li>Identify and explain the steps of the scientific method</li><li>Understand how the steps work together in an investigation</li><li>Apply the scientific method to a simple question</li></ul><h2>Key Concepts</h2><p>The basic steps of the scientific method include:</p><ol><li>Ask a question</li><li>Research the topic</li><li>Form a hypothesis (a testable prediction)</li><li>Design and conduct an experiment</li><li>Collect and analyze data</li><li>Draw conclusions</li><li>Communicate results</li></ol><p>The scientific method is not always linear—scientists often revisit earlier steps based on what they learn.</p><h2>Examples</h2><p>Question: Does the amount of light affect how fast a plant grows?</p><p>Hypothesis: Plants that receive more light will grow taller than plants that receive less light.</p><p>Experiment: Place identical plants in different lighting conditions and measure their growth over two weeks.</p><h2>Activity</h2><p>Choose one of the following questions and outline how you would investigate it using the scientific method:</p><ul><li>Does the temperature of water affect how fast sugar dissolves?</li><li>Do different brands of paper towels absorb different amounts of water?</li><li>Does listening to music affect how quickly you can solve math problems?</li></ul>', 45, 2, true),
  
  (2, 'Forming a Hypothesis', 'forming-hypothesis', 'Learning to create testable predictions based on observations', '<h1>Forming a Hypothesis</h1><p>A hypothesis is a testable explanation or prediction about how something works in the natural world.</p><h2>Learning Objectives</h2><ul><li>Understand what makes a good hypothesis</li><li>Distinguish between testable and non-testable statements</li><li>Write hypotheses in "If...then..." format</li></ul><h2>Key Concepts</h2><p>A good hypothesis:</p><ul><li>Is based on observations or existing knowledge</li><li>Makes a specific prediction</li><li>Can be tested through experimentation</li><li>Can be proven false (falsifiable)</li></ul><p>The "If...then..." format helps create clear hypotheses: "If [I do this], then [this will happen]."</p><h2>Examples</h2><p>Good hypothesis: "If plants are given fertilizer, then they will grow taller than plants without fertilizer."</p><p>Poor hypothesis: "Plants need sunlight to grow." (This is a fact, not a testable prediction)</p><p>Non-testable statement: "Plants grow better when they\'re happy." (How do you measure plant happiness?)</p><h2>Practice</h2><p>For each question, write a testable hypothesis in the "If...then..." format:</p><ol><li>Does the type of liquid affect how quickly an ice cube melts?</li><li>Does the shape of a paper airplane affect how far it flies?</li><li>Does the time of day affect how alert students feel?</li></ol>', 30, 3, true),
  
  (2, 'Designing Experiments', 'designing-experiments', 'Creating fair tests to investigate hypotheses', '<h1>Designing Experiments</h1><p>A well-designed experiment allows scientists to test their hypothesis in a fair and controlled way.</p><h2>Learning Objectives</h2><ul><li>Identify variables in an experiment</li><li>Design a controlled experiment</li><li>Understand the importance of fair testing</li></ul><h2>Key Concepts</h2><p>Types of variables:</p><ul><li>Independent variable: what you change on purpose</li><li>Dependent variable: what you measure to see the effect</li><li>Control variables: what you keep the same</li></ul><p>A control group provides a baseline for comparison.</p><p>Fair testing means changing only one variable at a time.</p><h2>Example</h2><p>Experiment: Testing if fertilizer affects plant growth</p><ul><li>Independent variable: amount of fertilizer</li><li>Dependent variable: plant height</li><li>Control variables: type of plant, amount of water, amount of sunlight, type of soil, pot size</li><li>Control group: plants with no fertilizer</li></ul><h2>Activity</h2><p>Design an experiment to test the hypothesis: "If a ball is dropped from a greater height, then it will bounce higher."</p><ol><li>Identify the independent and dependent variables</li><li>List at least three control variables</li><li>Describe how you would set up a fair test</li><li>Explain how you would measure and record your results</li></ol>', 45, 4, true),
  
  (2, 'Collecting and Analyzing Data', 'collecting-analyzing-data', 'Learning to gather, organize, and interpret experimental results', '<h1>Collecting and Analyzing Data</h1><p>Careful data collection and analysis help scientists determine if their results support their hypothesis.</p><h2>Learning Objectives</h2><ul><li>Collect accurate and reliable data</li><li>Organize data in tables and graphs</li><li>Interpret patterns and trends in data</li></ul><h2>Key Concepts</h2><p>Data collection methods:</p><ul><li>Observations: what you see, hear, or otherwise detect</li><li>Measurements: numerical data collected with tools</li><li>Surveys: information gathered by asking questions</li></ul><p>Data should be recorded clearly and precisely.</p><p>Multiple trials increase reliability.</p><p>Tables and graphs help organize and visualize data.</p><h2>Example</h2><p>Data table for plant growth experiment:</p><table><tr><th>Plant Group</th><th>Day 7 Height (cm)</th><th>Day 14 Height (cm)</th><th>Day 21 Height (cm)</th></tr><tr><td>No Fertilizer</td><td>5.2</td><td>8.7</td><td>12.3</td></tr><tr><td>Standard Fertilizer</td><td>6.8</td><td>11.5</td><td>17.2</td></tr><tr><td>Double Fertilizer</td><td>7.1</td><td>12.2</td><td>16.8</td></tr></table><h2>Activity</h2><p>Using the data in the example table:</p><ol><li>Create a line graph showing plant height over time for each group</li><li>Identify any patterns or trends in the data</li><li>Write a brief analysis of what the data shows about the effect of fertilizer on plant growth</li></ol>', 45, 5, true);

-- Insert sample exercises for Elementary Algebra Fundamentals
INSERT INTO exercises (lesson_id, title, description, content, type, difficulty, order_index)
VALUES
  (1, 'Variable Substitution', 'Practice substituting values for variables', '{
    "instructions": "Substitute the given value for the variable and evaluate the expression.",
    "problems": [
      {
        "question": "If x = 4, find the value of 3x + 2",
        "answer": "14",
        "solution": "3x + 2 = 3(4) + 2 = 12 + 2 = 14"
      },
      {
        "question": "If y = 5, find the value of 10 - y",
        "answer": "5",
        "solution": "10 - y = 10 - 5 = 5"
      },
      {
        "question": "If z = 3, find the value of 2z² - z",
        "answer": "15",
        "solution": "2z² - z = 2(3)² - 3 = 2(9) - 3 = 18 - 3 = 15"
      }
    ]
  }', 'multiple_choice', 'easy', 1),
  
  (1, 'Translating Words to Expressions', 'Practice writing algebraic expressions from word phrases', '{
    "instructions": "Write an algebraic expression for each word phrase. Use the variable x to represent the unknown number.",
    "problems": [
      {
        "question": "Seven more than a number",
        "answer": "x + 7",
        "solution": "\"Seven more than a number\" means to add 7 to the number, so the expression is x + 7."
      },
      {
        "question": "Three times a number, decreased by 5",
        "answer": "3x - 5",
        "solution": "\"Three times a number\" means 3x. \"Decreased by 5\" means to subtract 5. So the expression is 3x - 5."
      },
      {
        "question": "The product of 4 and a number, added to the number",
        "answer": "4x + x or 5x",
        "solution": "\"The product of 4 and a number\" means 4x. \"Added to the number\" means to add x. So the expression is 4x + x, which simplifies to 5x."
      }
    ]
  }', 'short_answer', 'medium', 2),
  
  (2, 'Solving One-Step Equations', 'Practice solving basic equations with one operation', '{
    "instructions": "Solve each equation for the variable.",
    "problems": [
      {
        "question": "x + 12 = 20",
        "answer": "x = 8",
        "solution": "x + 12 = 20\nx + 12 - 12 = 20 - 12\nx = 8"
      },
      {
        "question": "y - 5 = 10",
        "answer": "y = 15",
        "solution": "y - 5 = 10\ny - 5 + 5 = 10 + 5\ny = 15"
      },
      {
        "question": "3z = 21",
        "answer": "z = 7",
        "solution": "3z = 21\n3z ÷ 3 = 21 ÷ 3\nz = 7"
      },
      {
        "question": "m/4 = 6",
        "answer": "m = 24",
        "solution": "m/4 = 6\nm/4 × 4 = 6 × 4\nm = 24"
      }
    ]
  }', 'fill_blank', 'medium', 1),
  
  (3, 'Combining Like Terms', 'Practice simplifying expressions by combining like terms', '{
    "instructions": "Simplify each expression by combining like terms.",
    "problems": [
      {
        "question": "5x + 3x",
        "answer": "8x",
        "solution": "5x + 3x = (5 + 3)x = 8x"
      },
      {
        "question": "7y - 2y + 4",
        "answer": "5y + 4",
        "solution": "7y - 2y + 4 = (7 - 2)y + 4 = 5y + 4"
      },
      {
        "question": "3a + 5b - 2a + b",
        "answer": "a + 6b",
        "solution": "3a + 5b - 2a + b = (3 - 2)a + (5 + 1)b = a + 6b"
      },
      {
        "question": "4x + 3 - x - 5",
        "answer": "3x - 2",
        "solution": "4x + 3 - x - 5 = (4 - 1)x + (3 - 5) = 3x - 2"
      }
    ]
  }', 'short_answer', 'medium', 1),
  
  (4, 'Word Problem Practice', 'Apply algebraic concepts to solve real-world problems', '{
    "instructions": "Solve each word problem by writing and solving an equation.",
    "problems": [
      {
        "question": "A book costs $5 more than a magazine. If the book costs $12, how much does the magazine cost?",
        "answer": "$7",
        "solution": "Let m = cost of magazine\nBook costs $5 more than magazine, so: 12 = m + 5\n12 - 5 = m\nm = 7\nThe magazine costs $7."
      },
      {
        "question": "Sam has 24 marbles. He has 4 times as many marbles as Tina. How many marbles does Tina have?",
        "answer": "6 marbles",
        "solution": "Let t = number of Tina\'s marbles\nSam has 4 times as many marbles as Tina, so: 24 = 4t\n24 ÷ 4 = t\nt = 6\nTina has 6 marbles."
      },
      {
        "question": "The perimeter of a rectangle is 36 cm. If the width is 6 cm, what is the length?",
        "answer": "12 cm",
        "solution": "Let l = length of rectangle\nPerimeter formula: P = 2l + 2w\n36 = 2l + 2(6)\n36 = 2l + 12\n36 - 12 = 2l\n24 = 2l\n24 ÷ 2 = l\nl = 12\nThe length is 12 cm."
      }
    ]
  }', 'essay', 'hard', 1),
  
  (5, 'Plotting Points', 'Practice plotting and identifying points on the coordinate plane', '{
    "instructions": "For each point, identify the quadrant in which it is located.",
    "problems": [
      {
        "question": "Point A: (3, 5)",
        "answer": "Quadrant I",
        "solution": "Point A has a positive x-coordinate (3) and a positive y-coordinate (5), so it is in Quadrant I."
      },
      {
        "question": "Point B: (-2, 4)",
        "answer": "Quadrant II",
        "solution": "Point B has a negative x-coordinate (-2) and a positive y-coordinate (4), so it is in Quadrant II."
      },
      {
        "question": "Point C: (-5, -3)",
        "answer": "Quadrant III",
        "solution": "Point C has a negative x-coordinate (-5) and a negative y-coordinate (-3), so it is in Quadrant III."
      },
      {
        "question": "Point D: (4, -1)",
        "answer": "Quadrant IV",
        "solution": "Point D has a positive x-coordinate (4) and a negative y-coordinate (-1), so it is in Quadrant IV."
      },
      {
        "question": "Point E: (0, 7)",
        "answer": "On the y-axis",
        "solution": "Point E has an x-coordinate of 0 and a positive y-coordinate (7), so it is on the y-axis, not in any quadrant."
      }
    ]
  }', 'matching', 'medium', 1);

-- Insert sample exercises for Introduction to Scientific Method
INSERT INTO exercises (lesson_id, title, description, content, type, difficulty, order_index)
VALUES
  (6, 'Science vs. Non-Science', 'Distinguish between scientific and non-scientific statements', '{
    "instructions": "Identify whether each statement is scientific (testable) or non-scientific (not testable).",
    "problems": [
      {
        "question": "Plants grow better when classical music is played near them.",
        "answer": "Scientific",
        "solution": "This is scientific because it can be tested by growing plants with and without classical music and measuring their growth."
      },
      {
        "question": "Chocolate ice cream tastes better than vanilla ice cream.",
        "answer": "Non-scientific",
        "solution": "This is non-scientific because taste preferences are subjective and vary from person to person."
      },
      {
        "question": "Water boils at a lower temperature at higher elevations.",
        "answer": "Scientific",
        "solution": "This is scientific because it can be tested by measuring the boiling point of water at different elevations."
      },
      {
        "question": "Ghosts exist in old houses.",
        "answer": "Non-scientific",
        "solution": "This is non-scientific because the existence of ghosts cannot be reliably tested or measured using scientific methods."
      },
      {
        "question": "Exercise increases heart rate.",
        "answer": "Scientific",
        "solution": "This is scientific because it can be tested by measuring heart rate before and after exercise."
      }
    ]
  }', 'multiple_choice', 'easy', 1),
  
  (7, 'Identifying Steps of the Scientific Method', 'Practice recognizing the different steps in scientific investigations', '{
    "instructions": "Identify which step of the scientific method is being described in each scenario.",
    "problems": [
      {
        "question": "Maria wonders if plants grow better with tap water or filtered water.",
        "answer": "Ask a question",
        "solution": "Maria is formulating a question about plant growth that can be investigated scientifically."
      },
      {
        "question": "Carlos predicts that a toy car will roll farther on a smooth surface than on a rough surface.",
        "answer": "Form a hypothesis",
        "solution": "Carlos is making a testable prediction about how surface texture affects the distance a toy car will roll."
      },
      {
        "question": "Sophia measures and records the height of her plants every three days for two weeks.",
        "answer": "Collect data",
        "solution": "Sophia is gathering measurements (data) about plant growth over time."
      },
      {
        "question": "Marcus creates a bar graph showing the average test scores for students who studied for different amounts of time.",
        "answer": "Analyze data",
        "solution": "Marcus is organizing and visualizing data to look for patterns or trends."
      },
      {
        "question": "After her experiment, Leila determines that seeds germinate faster in warm soil than in cool soil.",
        "answer": "Draw conclusions",
        "solution": "Leila is interpreting her results to answer her original question about seed germination."
      }
    ]
  }', 'matching', 'medium', 1),
  
  (8, 'Writing Hypotheses', 'Practice creating testable predictions', '{
    "instructions": "For each research question, write a testable hypothesis using the \"If...then...\" format.",
    "problems": [
      {
        "question": "Does the amount of sleep affect test performance?",
        "answer": "If students get more hours of sleep, then they will perform better on tests.",
        "solution": "This hypothesis makes a clear, testable prediction about the relationship between sleep (independent variable) and test performance (dependent variable)."
      },
      {
        "question": "Does the type of soil affect how fast a seed germinates?",
        "answer": "If seeds are planted in potting soil, then they will germinate faster than seeds planted in garden soil.",
        "solution": "This hypothesis makes a specific prediction about how soil type (independent variable) affects germination rate (dependent variable)."
      },
      {
        "question": "Does the color of light affect plant growth?",
        "answer": "If plants are grown under blue light, then they will grow taller than plants grown under red light.",
        "solution": "This hypothesis makes a testable prediction about how light color (independent variable) affects plant height (dependent variable)."
      }
    ]
  }', 'short_answer', 'medium', 1),
  
  (9, 'Identifying Variables', 'Practice recognizing different types of variables in experiments', '{
    "instructions": "For each experiment description, identify the independent variable, dependent variable, and one control variable.",
    "problems": [
      {
        "question": "A scientist tests how the amount of fertilizer affects tomato plant growth by adding different amounts of fertilizer to different plants and measuring their height after two weeks.",
        "answer": "Independent variable: amount of fertilizer; Dependent variable: plant height; Control variables could include: type of plant, amount of water, amount of sunlight, temperature, soil type",
        "solution": "The independent variable is what the scientist changes on purpose (amount of fertilizer). The dependent variable is what is measured to see the effect (plant height). Control variables are factors kept the same across all groups."
      },
      {
        "question": "A student investigates whether the temperature of water affects how quickly sugar dissolves by placing equal amounts of sugar in water at different temperatures and timing how long it takes to dissolve completely.",
        "answer": "Independent variable: water temperature; Dependent variable: time to dissolve; Control variables could include: amount of sugar, amount of water, type of sugar, stirring method",
        "solution": "The independent variable is what the student changes on purpose (water temperature). The dependent variable is what is measured to see the effect (time to dissolve). Control variables are factors kept the same across all groups."
      },
      {
        "question": "A researcher tests whether listening to music affects memory by having some participants memorize a list of words while listening to music and others memorize the same list in silence, then counting how many words each group remembers.",
        "answer": "Independent variable: presence of music; Dependent variable: number of words remembered; Control variables could include: list of words, memorization time, testing environment, age of participants",
        "solution": "The independent variable is what the researcher changes on purpose (presence of music). The dependent variable is what is measured to see the effect (number of words remembered). Control variables are factors kept the same across all groups."
      }
    ]
  }', 'short_answer', 'hard', 1),
  
  (10, 'Interpreting Data', 'Practice analyzing and drawing conclusions from experimental data', '{
    "instructions": "Analyze the data provided and answer the questions.",
    "problems": [
      {
        "question": "A student tested how the temperature of water affects the amount of sugar that can dissolve in 100 mL of water. Here are the results:\\n\\nWater Temperature (°C) | Sugar Dissolved (g)\\n10 | 180\\n20 | 200\\n30 | 220\\n40 | 240\\n50 | 260\\n\\nBased on this data, what can you conclude about the relationship between water temperature and sugar solubility?",
        "answer": "As water temperature increases, the amount of sugar that can dissolve also increases. For every 10°C increase in temperature, about 20g more sugar can dissolve.",
        "solution": "Looking at the data, we can see a clear pattern: as the temperature increases by 10°C each time, the amount of sugar that dissolves increases by 20g each time. This shows a positive correlation between temperature and sugar solubility."
      },
      {
        "question": "A scientist tested four different brands of paper towels to see how much water each could absorb. Each paper towel was the same size. Here are the results:\\n\\nBrand | Water Absorbed (mL)\\nBrand A | 15\\nBrand B | 22\\nBrand C | 18\\nBrand D | 12\\n\\nWhich brand absorbed the most water? How much more water did it absorb compared to the least absorbent brand?",
        "answer": "Brand B absorbed the most water (22 mL). It absorbed 10 mL more than Brand D, which was the least absorbent (12 mL).",
        "solution": "Looking at the data, Brand B absorbed 22 mL, which is the highest value. Brand D absorbed 12 mL, which is the lowest value. The difference between these values is 22 - 12 = 10 mL."
      },
      {
        "question": "A student investigated whether the bounce height of a ball depends on the height from which it is dropped. Here are the results:\\n\\nDrop Height (cm) | Bounce Height (cm)\\n50 | 30\\n100 | 62\\n150 | 93\\n200 | 124\\n\\nBased on this data, if the ball were dropped from 250 cm, approximately how high would you expect it to bounce?",
        "answer": "Approximately 155 cm",
        "solution": "Looking at the pattern in the data, we can see that for every 50 cm increase in drop height, the bounce height increases by about 31 cm. If we extend this pattern, a drop from 250 cm would result in a bounce of about 124 + 31 = 155 cm."
      }
    ]
  }', 'essay', 'hard', 1);

-- Insert sample assessments for Elementary Algebra Fundamentals
INSERT INTO assessments (course_id, title, description, passing_score, time_limit_minutes, is_published)
VALUES
  (1, 'Variables and Expressions Quiz', 'Test your understanding of variables and algebraic expressions', 70, 20, true),
  (1, 'Equations and Problem Solving Test', 'Comprehensive assessment of equation solving and word problems', 75, 45, true);

-- Insert sample assessment questions
INSERT INTO assessment_questions (assessment_id, question, question_type, options, correct_answer, points, order_index)
VALUES
  (1, 'If x = 3, what is the value of 2x + 5?', 'multiple_choice', '["8", "11", "16", "None of the above"]', '11', 1, 1),
  (1, 'Which expression represents "6 less than twice a number n"?', 'multiple_choice', '["2n - 6", "6 - 2n", "2(n - 6)", "2n + 6"]', '2n - 6', 1, 2),
  (1, 'Simplify the expression: 3x + 2y - x + 5y', 'multiple_choice', '["2x + 7y", "4x + 7y", "2x + 3y", "3x + 7y"]', '2x + 7y', 1, 3),
  (1, 'If a = 4 and b = 2, what is the value of 3a - 2b?', 'multiple_choice', '["8", "10", "12", "16"]', '8', 1, 4),
  (1, 'Which of the following is a variable?', 'multiple_choice', '["3", "+", "y", "="]', 'y', 1, 5),
  
  (2, 'Solve for x: 3x - 7 = 14', 'multiple_choice', '["x = 7", "x = 3", "x = 21", "x = -7"]', 'x = 7', 1, 1),
  (2, 'Solve for y: y/5 = 4', 'multiple_choice', '["y = 20", "y = 9", "y = 1", "y = 0.8"]', 'y = 20', 1, 2),
  (2, 'A rectangle has a perimeter of 26 cm. If the width is 4 cm, what is the length?', 'multiple_choice', '["9 cm", "13 cm", "18 cm", "22 cm"]', '9 cm', 1, 3),
  (2, 'Maria has $5 more than twice what Juan has. If Maria has $35, how much does Juan have?', 'multiple_choice', '["$15", "$20", "$30", "$40"]', '$15', 1, 4),
  (2, 'Solve for z: 2(z + 3) = 16', 'multiple_choice', '["z = 5", "z = 6.5", "z = 8", "z = 10"]', 'z = 5', 1, 5);

-- Insert sample enrollments
INSERT INTO enrollments (user_id, course_id, enrolled_at, last_accessed_at, completion_percentage, is_completed)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, '2023-01-15 10:30:00', '2023-01-20 14:45:00', 60, false),
  ('00000000-0000-0000-0000-000000000001', 2, '2023-01-16 09:15:00', '2023-01-21 11:20:00', 40, false),
  ('00000000-0000-0000-0000-000000000002', 1, '2023-01-10 13:45:00', '2023-01-22 16:30:00', 80, false),
  ('00000000-0000-0000-0000-000000000002', 3, '2023-01-12 15:20:00', '2023-01-19 10:10:00', 30, false),
  ('00000000-0000-0000-0000-000000000003', 2, '2023-01-18 11:00:00', '2023-01-23 09:45:00', 20, false),
  ('00000000-0000-0000-0000-000000000003', 4, '2023-01-14 14:30:00', '2023-01-20 13:15:00', 50, false);

-- Insert sample lesson progress
INSERT INTO lesson_progress (user_id, lesson_id, is_completed, last_accessed_at, completed_at, time_spent_seconds)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, true, '2023-01-17 10:30:00', '2023-01-17 11:15:00', 2700),
  ('00000000-0000-0000-0000-000000000001', 2, true, '2023-01-18 09:45:00', '2023-01-18 10:30:00', 2700),
  ('00000000-0000-0000-0000-000000000001', 3, true, '2023-01-19 14:20:00', '2023-01-19 15:05:00', 2700),
  ('00000000-0000-0000-0000-000000000001', 6, true, '2023-01-17 13:10:00', '2023-01-17 13:55:00', 2700),
  ('00000000-0000-0000-0000-000000000001', 7, false, '2023-01-20 14:45:00', null, 1800),
  ('00000000-0000-0000-0000-000000000002', 1, true, '2023-01-15 11:30:00', '2023-01-15 12:15:00', 2700),
  ('00000000-0000-0000-0000-000000000002', 2, true, '2023-01-16 10:45:00', '2023-01-16 11:30:00', 2700),
  ('00000000-0000-0000-0000-000000000002', 3, true, '2023-01-17 09:15:00', '2023-01-17 10:00:00', 2700),
  ('00000000-0000-0000-0000-000000000002', 4, true, '2023-01-18 14:30:00', '2023-01-18 15:15:00', 2700),
  ('00000000-0000-0000-0000-000000000002', 5, false, '2023-01-22 16:30:00', null, 1500),
  ('00000000-0000-0000-0000-000000000003', 6, true, '2023-01-19 11:00:00', '2023-01-19 11:45:00', 2700),
  ('00000000-0000-0000-0000-000000000003', 7, false, '2023-01-23 09:45:00', null, 1200);

-- Insert sample course reviews
INSERT INTO course_reviews (user_id, course_id, rating, review_text)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 5, 'Excellent course! The explanations were clear and the exercises really helped me understand algebra.'),
  ('00000000-0000-0000-0000-000000000002', 1, 4, 'Very good course. I would have liked more practice problems, but overall it was very helpful.'),
  ('00000000-0000-0000-0000-000000000003', 2, 5, 'I loved learning about the scientific method. The experiments were fun and educational.'),
  ('00000000-0000-0000-0000-000000000001', 2, 4, 'Good introduction to science concepts. The interactive elements kept me engaged.');

-- Insert sample course materials
INSERT INTO course_materials (course_id, title, description, file_url, file_type, is_downloadable, order_index)
VALUES
  (1, 'Algebra Cheat Sheet', 'Quick reference guide for algebraic concepts', '/materials/algebra-cheat-sheet.pdf', 'pdf', true, 1),
  (1, 'Practice Problem Set', 'Additional practice problems with solutions', '/materials/algebra-practice-problems.pdf', 'pdf', true, 2),
  (1, 'Interactive Equation Solver', 'Tool for practicing equation solving', '/materials/equation-solver.html', 'html', false, 3),
  (2, 'Scientific Method Diagram', 'Visual representation of the scientific method steps', '/materials/scientific-method-diagram.pdf', 'pdf', true, 1),
  (2, 'Experiment Design Worksheet', 'Template for planning scientific experiments', '/materials/experiment-design-worksheet.pdf', 'pdf', true, 2),
  (2, 'Virtual Lab Simulation', 'Interactive simulation of a science experiment', '/materials/virtual-lab.html', 'html', false, 3);

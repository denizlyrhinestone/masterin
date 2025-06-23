export interface MathProblem {
  problem_text: string;
  problem_type?: string; // e.g., "algebra", "geometry", "word problem"
  difficulty_level_generated?: string;
  solution_steps: string[] | string; // AI might return array or single multi-line string
  final_answer: string;
  hints?: string[];
  visual_elements_description?: string | null; // Updated from string[] to string | null based on example in backend
}

export interface GeneratedMathProblems {
  problems?: MathProblem[]; // Optional because it might not be present if parsing failed
  rawOutput?: string;     // In case of parsing failure on backend, this might be sent
  // success: boolean; // Backend sends this, but we might not store it directly if we just use problems/rawOutput
  // message?: string; // For error messages from backend if success is false
}

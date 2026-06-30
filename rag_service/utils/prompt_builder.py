def build_study_plan_prompt(module: str, score: float, context: str = None) -> str:
    difficulty = ""
    if score < 50:
        difficulty = "basic revision plan focusing on core concepts and foundational understanding."
    elif score < 75:
        difficulty = "balanced learning plan covering intermediate topics and practical application."
    else:
        difficulty = "advanced and practice-focused plan challenging the student with complex problem-solving."
        
    prompt = f"""
Generate a multi-day structured study plan for a student studying the module '{module}'.
The student's current score is {score}/100.
Based on this score, the study plan should be a {difficulty}

Requirements:
- Include a structured daily breakdown (e.g., Day 1, Day 2, etc.)
- Include learning goals and practice tasks for each day
- Be clear, concise, meaningful, and student-friendly
- Avoid generic AI text, focus specifically on actionable tasks for '{module}'
"""
    
    if context:
        prompt += f"\nAdditional Context to consider:\n{context}\n"
        
    return prompt

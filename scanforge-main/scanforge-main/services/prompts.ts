export const PROMPTS = {
  REFINE_INTENT: (analysis: string | null, prompt: string, sourceText?: string) => 
    `Analyze request. CONTEXT: ${analysis || "None"}. REQUEST: ${prompt}. ${sourceText ? `TARGET TEXT TO REPLACE: "${sourceText}". Ensure the refined prompt focuses on replacing this exact text.` : ''}`,
  
  EDIT_LOCATION_INSTRUCTION: (y1: number, x1: number, y2: number, x2: number) => 
    `EDIT REGION: Strictly limit changes to the area defined by bounding box [${y1}, ${x1}, ${y2}, ${x2}] (ymin, xmin, ymax, xmax). Do not modify any text or pixels outside this box. In this region, your instruction overrides visual preservation rules (you may erase or change text freely).`,
  
  EDIT_SYSTEM_INSTRUCTION: (isInpaint: boolean, prompt: string, sourceText?: string, locationInstruction?: string) => `ACT: Expert Document Restorer & Editor.
TASK: ${isInpaint ? 'Inpaint / Regional Edit' : 'Global Edit'}.
INSTRUCTION: "${prompt}"
${sourceText ? `TARGET TEXT TO MODIFY: "${sourceText}"` : ''}
${locationInstruction}

STRICT EXECUTION RULES:
1. PRESERVE PAPER TEXTURE: Maintain grain, noise, creases, and aging artifacts exactly.
2. PRESERVE TYPOGRAPHY: Do not change fonts, alignment, or surrounding text unless explicitly asked.
3. NO HALLUCINATIONS: Do not generate new text fields or graphical elements outside the instruction.
4. BLENDING: Ensure edits match the surrounding lighting and ink density perfectly.
5. Output ONLY the processed image.`,

  ANALYZE_IMAGE: "Analyze this document's structure, condition, and content to assist with restoration/editing.",
  
  CRITIQUE_HEADER: (prompt: string, count: number) => 
    `USER INTENT: "${prompt}"\n\nI have generated ${count} candidate(s) for this edit.`,
  
  CRITIQUE_SYSTEM: `Analyze these candidates against the original and the user intent. 
      Identify common failures (blurriness, hallucinations, texture mismatch) and successes.
      If multiple candidates are provided, compare them.
      Provide a combined critique and 3 extremely precise, improved prompts that would yield a better result than any of these attempts.`,
      
  OPTIMIZE_PROMPT: (input: string) => 
    `Rewrite this image editing prompt to be extremely precise, descriptive, and technical for an AI inpainting model. Focus on texture, lighting, and exact actions. Prompt: "${input}"`
};

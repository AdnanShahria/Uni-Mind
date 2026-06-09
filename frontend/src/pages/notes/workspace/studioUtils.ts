import { callAI, AGENT_ROUTER_API_KEY, GROQ_API_KEY } from '../../../utils/aiClient';

const callGroq = async (prompt: string, model: string = 'llama-3.1-8b-instant', responseFormat?: any) => {
  if (!AGENT_ROUTER_API_KEY && !GROQ_API_KEY) {
    // Return mock responses to allow users to see the Studio features without an API key.
    console.warn("API Keys are missing. Returning a mock response for demonstration.");
    return generateMockResponse(prompt);
  }

  try {
    return await callAI(
      [{ role: 'user', content: prompt }],
      {
        groqModel: model,
        responseFormat
      }
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Helper to generate mock responses
const generateMockResponse = (prompt: string) => {
  if (prompt.includes('Study Guide')) {
    return `# Study Guide (Mock)\n\n## Executive Summary\nThis is a mock study guide because the Groq API key is missing. Add \`VITE_GROQ_API_KEY\` to your \`.env\` file for real AI generation.\n\n## Core Concepts\n- **Mock Concept 1:** Definition of mock concept 1.\n- **Mock Concept 2:** Definition of mock concept 2.\n\n## Concept Mindmap\n\`\`\`mermaid\nmindmap\n  root((Topic))\n    Subtopic A\n    Subtopic B\n\`\`\`\n\n## Critical Questions\n1. What is the meaning of life? (42)\n2. How does this mock data look?`;
  } else if (prompt.includes('mindmap diagram')) {
    return `mindmap\n  root((Topic))\n    Subtopic A\n      Detail 1\n      Detail 2\n    Subtopic B\n      Detail 3`;
  } else if (prompt.includes('Slide Deck')) {
    return `## Slide 1: Introduction\n- Welcome to the mock presentation.\n- No API key was provided.\n\n---\n\n## Slide 2: Data Distribution\n- Here is a mock pie chart.\n\n\`\`\`mermaid\npie title Mock Data Distribution\n  "Category A" : 40\n  "Category B" : 60\n\`\`\`\n\n---\n\n## Slide 3: Conclusion\n- Thanks for viewing the mock slides!`;
  } else if (prompt.includes('formal, analytical report')) {
    return `# Analytical Report (Mock)\n\n## Introduction\nThis report was generated as a placeholder because the Groq API key is missing.\n\n## Project Timeline\n\`\`\`mermaid\ngantt\n  title Mock Project Timeline\n  dateFormat  YYYY-MM-DD\n  section Phase 1\n  Task 1           :a1, 2023-01-01, 30d\n\`\`\`\n\n## Methodology\nWe used hardcoded strings to generate this text.\n\n## Conclusion\nPlease add your API key for a real report.`;
  } else if (prompt.includes('dialogue script')) {
    return `Alex: Hey Sam, this is a mock audio because the API key is missing!\nSam: That's right Alex. We still want to show the interface working so you can hear the TTS play this text.`;
  }
  return "This is a mock response because the Groq API key is missing.";
};

export const generateStudyGuide = async (title: string, content: string): Promise<string> => {
  const prompt = `You are an expert academic tutor. Create a comprehensive Study Guide based on the following notes.
The Study Guide must be formatted in beautiful Markdown and include:
1. Executive Summary
2. Core Concepts & Definitions
3. A Mermaid.js mindmap summarizing the structure (use \`\`\`mermaid ... \`\`\`)
4. Key Processes/Theories/Formulas
5. Critical Questions for Self-Testing

Title: ${title}
Content: ${content || 'No content provided — base it on the title.'}`;
  
  return callGroq(prompt, 'llama-3.3-70b-versatile');
};

export const generateMindMap = async (title: string, content: string): Promise<string> => {
  const prompt = `You are an expert data visualizer. Create a Mermaid.js mindmap diagram representing the following notes.
Respond ONLY with the raw valid mermaid code. Do NOT wrap it in markdown \`\`\`mermaid or any other formatting. 
Keep the mindmap CONCISE. Limit it to a maximum of 15-20 total nodes to prevent visual clutter and over-density. Do not go too deep.
Use the 'mindmap' diagram type. Ensure syntax is perfectly valid. Example syntax:
mindmap
  root((Topic))
    Branch1
      Node1
      Node2

Title: ${title}
Content: ${content || 'No content provided — base it on the title.'}`;
  
  const result = await callGroq(prompt, 'llama-3.3-70b-versatile');
  return result.replace(/```mermaid/gi, '').replace(/```/g, '').trim();
};

export const generateSlideDeck = async (title: string, content: string): Promise<string> => {
  const prompt = `You are an expert presenter. Create a Markdown Slide Deck based on the following notes.
Separate each slide with exactly three dashes: "---".
For each slide, include a concise Title (##), Bullet Points, and brief speaker notes if necessary.
You MUST include at least one \`\`\`mermaid diagram in one of the slides to visually represent data or processes. 
IMPORTANT: Use ONLY simple, standard Mermaid diagrams (e.g., simple pie chart, basic flowchart TD/LR). Avoid complex or experimental charts (like xyChart) to prevent syntax rendering errors.
Make it at least 5 slides long.

Title: ${title}
Content: ${content || 'No content provided — base it on the title.'}`;
  
  return callGroq(prompt, 'llama-3.3-70b-versatile');
};

export const generateReport = async (title: string, content: string): Promise<string> => {
  const prompt = `You are a professional analyst. Write a formal, analytical report based on the following notes.
The report should include an Introduction, Methodology/Context, Detailed Analysis, and Conclusion.
Use professional formatting with headings, bullet points, and paragraphs in Markdown.
CRITICAL: You MUST include at least one \`\`\`mermaid diagram (e.g., simple Gantt chart, timeline, or flowchart) to visualize the analysis. Avoid experimental charts like xyChart.

Title: ${title}
Content: ${content || 'No content provided — base it on the title.'}`;
  
  return callGroq(prompt, 'llama-3.3-70b-versatile');
};

export const generateAudioScript = async (title: string, content: string): Promise<string> => {
  const prompt = `You are a scriptwriter for a popular educational podcast. Write an engaging dialogue script between two hosts discussing the following notes.
Host 1 (Alex) is the curious learner asking questions.
Host 2 (Sam) is the enthusiastic expert explaining concepts.
The dialogue should sound natural, conversational, and cover the main points clearly.

Format exactly like this (no other text, just the lines):
Alex: Hey Sam, today we are looking at ${title}. What's the big idea here?
Sam: Well Alex, it's fascinating because...

Title: ${title}
Content: ${content || 'No content provided — base it on the title.'}`;
  
  return callGroq(prompt, 'llama-3.3-70b-versatile');
};

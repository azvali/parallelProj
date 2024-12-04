import { openai } from "@ai-sdk/openai";

import { generateText } from "ai";


export async function POST(req: Request) {
	const { commitSummaries, repoName } = await req.json();
    console.log(commitSummaries, repoName);
	const {text} = await generateText({
		model: openai("gpt-4o-mini"),
        prompt: await createDetailedPrompt(commitSummaries, repoName),
		temperature: 0.7, // Adds some creativity while keeping it professional
		maxTokens: 600, // Ensures we get a concise response
	});
    

	return new Response(JSON.stringify(parseJSON(text)), {
		headers: { 'Content-Type': 'application/json' }
	});
}


async function createDetailedPrompt(commitSummaries: string[], repoName: string) {
    const prompt = `You are a professional technical writer creating detailed changelog entries. Your task is to write a comprehensive changelog for the software project ${repoName.split("/")[1]}.

    Format your response as a JSON object with the following structure and constraints:
    {
        "title": string - Required - Brief, impactful summary of changes (15 words maximum)
        "whatsNew": string - Required - Clear description of new features or changes (100 words maximum)
        "bugFixes": string - Not Required - Clear description of bug fixes (100 words maximum)
        "improvements": string - Not Required - Clear description of improvements (100 words maximum)
        "breakingChanges": string - Not Required - Clear description of breaking changes (100 words maximum)
    }

    Guidelines:
    - Title should be concise and descriptive, focusing on the most significant change
    - Each section should be written in clear, professional language
    - Use bullet points where appropriate
    - Omit sections that aren't relevant by responding with an empty string ("").

    Please analyze and restructure the following changes into this format:
    ${commitSummaries.join("\n\n")}`;
    
    return prompt;
}

function parseJSON(text: string) {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex >= 0 && endIndex >= 0) {
        const jsonContent = text.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonContent);
    }
    return null;
}

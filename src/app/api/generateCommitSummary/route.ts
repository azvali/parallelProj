import { Commit } from "@/types/repo";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Allow streaming responses up to 10 seconds
export const maxDuration = 4;

export async function POST(req: Request) {
	const { repoName, commitId } = await req.json();
	const diffs = await getDiffsFromCommit(repoName, commitId);
	const { text } = await generateText({
		model: openai("gpt-4o-mini"),
		prompt: await createPrompt(diffs.commitMessage, diffs.files),
		temperature: 0.7, // Adds some creativity
		maxTokens: 100, // Ensures we get a concise response
	});
	console.log(text);

	return new Response(text);
}

async function getDiffsFromCommit(repoName: string, commitId: string) {
	const url = `https://api.github.com/repos/${repoName}/commits/${commitId}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
	});

	console.log("Response status:", response.status);
	console.log("Response status text:", response.statusText);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Error response:", errorText);
		throw new Error(`GitHub API error: ${response.statusText}`);
	}

	const commit: Commit = await response.json();

	const files = await Promise.all(
		commit.files.map(async (file: DiffFile) => ({
			filename: file.filename,
			status: file.status,
			additions: file.additions,
			deletions: file.deletions,
			patch: file.patch,
		}))
	);

	return {
		commitMessage: commit.commit.message,
		files,
	};
}

async function createPrompt(commitMessage: string, diffs: DiffFile[]) {
	const diffsSummary = diffs
		.map(
			(diff) => `
File: ${diff.filename}
Status: ${diff.status}
Changes: +${diff.additions}, -${diff.deletions}
Patch:
${diff.patch || "No patch available"}
`
		)
		.join("\n");

	return `Generate a single, concise changelog entry (1-2 sentences) based on the following commit changes.
Focus mainly on the business impact and user-facing changes but touch on technical details if necessary.
Original commit message: "${commitMessage}"


Changes made:
${diffsSummary}

Changelog entry:`;
}

interface DiffFile {
	filename: string;
	status: string;
	additions: number;
	deletions: number;
	patch?: string;
}

import { Commit } from "@/types/repo";
import Viewer from "./viewer";
import { revalidatePath } from "next/cache";

let viewerContent: string

export default async function RepoPage({ params }: { params: { fullName: string[] } }) {
	params = await params;
	const fullName = params.fullName.join("/");
	const commits: Commit[] = await getCommits(fullName);

	async function getCommits(fullName: string) {
		const response = await fetch("http://localhost:3000/api/getCommits", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ fullName }),
		});
		if (!response.ok) throw new Error("Failed to fetch commits");
		return response.json();
	}

	async function generateChangelog(FormData: FormData) {
		const processType = FormData.get("processType") as string;
		const commitCount = Number(FormData.get("commitCount"));
		const commitsToProcess = commits.slice(0, commitCount);

		const summaries = await Promise.all(
			commitsToProcess.map(async (commit: Commit) => {
				const response = await fetch("http://localhost:3000/api/generateCommitSummary", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ repoName: fullName, commitId: commit.sha }),
				});

				if (!response.ok) throw new Error("Failed to fetch commit summary");
				return response.text();
			})
		);

		const response = await fetch("http://localhost:3000/api/generateChangelog", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				commitSummaries: summaries,
				repoName: fullName,
			}),
		});

		if (!response.ok) throw new Error("Failed to fetch changelog");
		const content = await response.text();
    const parsedContent = JSON.parse(content);
    console.log(parsedContent)
    revalidatePath(`/${fullName}`)
		return parsedContent;
	}

	return (
		<div className="min-h-screen p-8">
			<h1 className="text-2xl font-bold">Repository: {params.fullName.join("/")}</h1>
			<form className="my-4 flex gap-4 items-center" action={generateChangelog}>
				<label htmlFor="commitCount" className="flex items-center">
					Number of commits to display
				</label>
				<input type="number" id="commitCount" name="commitCount" min="1" max="20" defaultValue="10" className="p-2 " />
				<div className="flex items-center">
					<label htmlFor="processType" className="p-2">
						Processing Type
					</label>
					<select id="processType" name="processType" className="">
						<option value="series">Series</option>
						<option value="parallel">Parallel</option>
					</select>
				</div>
				<button type="submit">Generate Changelog</button>
			</form>
			<Viewer content={viewerContent} />
		</div>
	);
}

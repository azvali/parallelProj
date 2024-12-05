import { Commit } from "@/types/repo";

export default async function RepoPage({ params }: { params: { fullName: string[] } }) {
	params = await params;
	const fullName = params.fullName.join("/");
	const commits: Commit[] = await getCommits(fullName);

	async function getCommits(fullName: string) {
		const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=20`, {
			headers: {
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
		});
		return res.json();
	}

	async function generateChangelog(FormData: FormData) {
		"use server";
		const processType = FormData.get("processType") as string;
		const commitCount = Number(FormData.get("commitCount"));
		const commitsToProcess = commits.slice(0, commitCount);
		let summaries: string[] = [];

		if (processType === "parallel") {
			// Process all commits simultaneously using Promise.all
			const commitPromises = commitsToProcess.map(async (commit) => {
        console.log(commit.sha)
				try {
					const response = await fetch("http://localhost:3000/api/generateCommitSummary", {
						method: "POST",
						headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
						body: JSON.stringify({ repoName: fullName, commitId: commit.sha }),
					});

					if (!response.ok) throw new Error("Failed to fetch commit summary");
          console.log(response)
					return response.text();
				} catch (error) {
					console.error("Error fetching commit summary:", error);
					return null;
				}
			});

			summaries = (await Promise.all(commitPromises)).filter(Boolean) as string[];
		} else {
			// Process commits one at a time in series
			summaries = await commitsToProcess.reduce(async (promise, commit) => {
				const acc = await promise;
				try {
					const response = await fetch("http://localhost:3000/api/generateCommitSummary", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ repoName: fullName, commitId: commit.sha }),
					});
					if (!response.ok) throw new Error("Failed to fetch commit summary");
					const summary = await response.text();
					return [...acc, summary];
				} catch (error) {
					console.error("Error fetching commit summary:", error);
					return acc;
				}
			}, Promise.resolve([] as string[]));
		}

		// Generate final changelog from summaries
		const response = await fetch("http://localhost:3000/api/generateCommitSummary", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ summaries }),
		});

		const changelog = await response.text();
		console.log(changelog);
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
		</div>
	);
}

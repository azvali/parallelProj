"use client";

import { Commit } from "@/types/repo";
import { useEffect, useState } from "react";
import Viewer from "./viewer";

export interface ChangelogEntries {
	title: string;
	whatsNew: string;
	bugFixes: string;
	improvements: string;
	breakingChanges: string;
}

export default function Creator({ fullName, commits }: { fullName: string; commits: Commit[] }) {
	const [loading, setLoading] = useState<boolean>();
	const [entries, setEntries] = useState<ChangelogEntries>();
	const [summariesResolved, setSummariesResolved] = useState<number>(0);

	async function generateChangelog(FormData: FormData) {
		setLoading(true);
		const processType = FormData.get("processType") as string;
		const commitCount = Number(FormData.get("commitCount"));
		const commitsToProcess = commits.slice(0, commitCount);

		let summaries: string[];
		if (processType === "parallel") {
			summaries = await Promise.all(
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
		} else {
			summaries = [];
			for (const commit of commitsToProcess) {
				const response = await fetch("http://localhost:3000/api/generateCommitSummary", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ repoName: fullName, commitId: commit.sha }),
				});

				if (!response.ok) throw new Error("Failed to fetch commit summary");
				summaries.push(await response.text());
			}
		}

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
		setEntries(parsedContent);
		setLoading(false);
	}

	return (
		<div className="min-h-screen p-8">
			<h1 className="text-2xl font-bold">Repository: {fullName}</h1>
			<form
				className="my-4 flex gap-4 items-center"
				onSubmit={(event) => {
					event.preventDefault(); // Prevent page reload
					const formData = new FormData(event.target as HTMLFormElement);
					generateChangelog(formData); // Call your function with the FormData
				}}
			>
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
			{loading && (
				<div className="flex items-center justify-center gap-2 p-4">
					<div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
					<span>Generating changelog...</span>
				</div>
			)}
			{!loading && entries && <Viewer entries={entries} />}
		</div>
	);
}

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
	const [elapsedTime, setElapsedTime] = useState<number>(0);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (loading) {
			setElapsedTime(0);
			interval = setInterval(() => {
				setElapsedTime((prev) => prev + 1);
			}, 100);
		}
		return () => clearInterval(interval);
	}, [loading]);

	async function generateChangelog(FormData: FormData) {
		setLoading(true);
		setSummariesResolved(0);
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
					const text = await response.text();
					setSummariesResolved((prev) => prev + 1);
					return text;
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
				setSummariesResolved((prev) => prev + 1);
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
		<div className="min-h-screen p-8 mx-auto max-w-2xl">
			<div className="flex gap-2 mb-4">
				<button
					onClick={() => (window.location.href = "/")}
					className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
				<h1 className="text-2xl font-bold opacity-70">Repository: {fullName}</h1>
			</div>
			<form
				className="my-4 flex gap-6 items-center"
				onSubmit={(event) => {
					event.preventDefault();
					const formData = new FormData(event.target as HTMLFormElement);
					generateChangelog(formData);
				}}
			>
				<div className="flex items-center gap-3">
					<label htmlFor="commitCount" className="text-sm text-gray-600 dark:text-gray-300">
						Commits
					</label>
					<input
						type="number"
						id="commitCount"
						name="commitCount"
						min="1"
						max="20"
						defaultValue="10"
						className="w-20 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				<div className="flex items-center gap-3">
					<label htmlFor="processType" className="text-sm text-gray-600 dark:text-gray-300">
						Process
					</label>
					<select
						id="processType"
						name="processType"
						className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						<option value="series">Series</option>
						<option value="parallel">Parallel</option>
					</select>
				</div>

				<button
					type="submit"
					className="px-4 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
				>
					Generate Changelog
				</button>
			</form>
			{loading && (
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<div className="flex gap-2">
						<div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
						<span className="opacity-70">Generating changelog...</span>
					</div>
					<div className="flex gap-2">
						<span className="opacity-70 tabular-nums font-mono">
							{summariesResolved} commits processed -- {(elapsedTime / 10).toFixed(2)}s
						</span>
					</div>
				</div>
			)}
			{!loading && entries && <Viewer entries={entries} timeTaken={elapsedTime} />}
		</div>
	);
}

"use client";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const repoUrl = new FormData(e.currentTarget).get("repo") as string;

		// Extract owner and repo name from GitHub URL
		const urlParts = repoUrl.split("/");
		const repoName = urlParts.pop()?.replace(".git", "") || "";
		const owner = urlParts.pop() || "";
		const fullName = `${owner}/${repoName}`;

		// Redirect to new page with full repo name
		router.push(`/${fullName}`);
	};

	return (
		<main className="min-h-screen p-8 flex items-center justify-center flex-col">
			<h1 className="text-4xl font-bold mb-5 opacity-70">Changelog Generator</h1>
			<form onSubmit={handleSubmit} className="max-w-md w-full">
				<div className="flex w-full">
				<input 
					type="text" 
					name="repo" 
					placeholder="https://github.com/owner/repository"
					className="w-11/12 p-2 border-2 rounded-l border-r-0 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border-indigo-500/60" 
					required 
					/>
				<button 
					type="submit" 
					className="px-4 py-2 rounded-r flex justify-center items-center bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none" 
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</button>
					</div>
			</form>
		</main>
	);
}

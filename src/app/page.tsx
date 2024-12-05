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
			<h1 className="text-3xl font-bold mb-3 opacity-70">Changelog Generator</h1>
			<form onSubmit={handleSubmit} className="max-w-md w-full">
				<input 
					type="text" 
					name="repo" 
					placeholder="Enter GitHub repository URL" 
					className="w-full p-2 border-2 border-b-0 rounded-t text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-neutral-900/30" 
					required 
				/>
				<button 
					type="submit" 
					className="px-4 py-2 bg-indigo-500 text-white rounded-b hover:bg-indigo-600 transition-colors w-full"
				>
					Submit
				</button>
			</form>
		</main>
	);
}

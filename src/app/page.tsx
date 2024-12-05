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
		<main className="min-h-screen p-8">
			<form onSubmit={handleSubmit} className="max-w-md mx-auto">
				<input type="text" name="repo" placeholder="Enter GitHub repository URL" className="w-full p-2 border rounded text-black" required />
				<button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
					Submit
				</button>
			</form>
		</main>
	);
}

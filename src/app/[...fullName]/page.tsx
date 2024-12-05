import { Commit } from "@/types/repo";
import Creator from "./creator";

export default async function RepoPage({ params }: { params: { fullName: string[] } }) {
	params = await params;
	const fullName = params.fullName.join("/");
	const commits: Commit[] = await getCommits(fullName);

	async function getCommits(fullName: string) {
		const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=20`, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
		});
		return res.json();
	}

	return <Creator commits={commits} fullName={fullName} />

}

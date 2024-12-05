export async function POST(req: Request) {
	const { repoName, commitId } = await req.json();
		const res = await fetch(`https://api.github.com/repos/${fullName}/commits?per_page=20`, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
		});
		return res.json();
	}

	return new Response(text);
}

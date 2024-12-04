export interface Repository {
	id: number;
	name: string;
	html_url: string;
	full_name: string;
    updated_at: string;
}

export interface Commit {
    sha: string;           // The commit ID/hash
    commit: {
        author: {
            date: string;  // The commit date
        };
        message: string;   // The commit message
    };
    stats: {
        additions: number;
        deletions: number;
        total: number;
    };
    files: {
        filename: string;
        additions: number;
        deletions: number;
        changes: number;
        patch?: string;    // The diff patch (optional as it's not always included)
        status: string;    // Status of the file (added, modified, removed, etc.)
    }[];
}

export interface File {
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    status: string;
}


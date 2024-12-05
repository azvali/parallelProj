"use client";

import { useState } from "react";

export default function Viewer({ content }: { content: any }) {
	console.log("mounted", content);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("whatsNew");

	if (isLoading) {
		return (
			<div className="w-full h-96 relative">
				<div className="absolute inset-1/2 translate-x-10 translate-y-10 w-24 h-24 bg-emerald-300 rounded-full blur-xl opacity-70"></div>
				<div className="absolute inset-1/2 -translate-x-10 translate-y-10 w-24 h-24 bg-emerald-400 rounded-full blur-xl opacity-70"></div>
				<div className="absolute inset-1/2 -translate-x-10 -translate-y-10 w-24 h-24 bg-emerald-500 rounded-full blur-xl opacity-70 animate-pulse"></div>
				<div className="flex items-center justify-center h-full">
					<p className="text-xl font-bold">Generating changelog...</p>
				</div>
			</div>
		);
	}

	if (!content) return null;

	const tabs = [
		{ id: "whatsNew", label: "What's New", content: content.whatsNew },
		{ id: "bugFixes", label: "Bug Fixes", content: content.bugFixes },
		{ id: "improvements", label: "Improvements", content: content.improvements },
		{ id: "breakingChanges", label: "Breaking Changes", content: content.breakingChanges },
	].filter((tab) => tab.content !== "");

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="w-full max-w-full prose dark:prose-invert">
				{tabs.map((tab) => (
					<div key={tab.id} className="w-full max-w-full">
						<h3 className="w-full flex items-center gap-2">{tab.label}</h3>
						<p className="w-full">{tab.content}</p>
					</div>
				))}
			</div>
		</div>
	);
}

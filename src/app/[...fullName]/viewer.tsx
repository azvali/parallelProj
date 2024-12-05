"use client";

import { Commit } from "@/types/repo";
import { useEffect, useState, useRef } from "react";

const readableTypes = {
	title: "Title",
	feature: "What's New",
	bugfix: "Bug Fixes",
	improvement: "Improvements",
	breakingChange: "Breaking Changes",
	link: "Links",
} as const;

export interface ChangelogEntries {
    title: string;
    whatsNew: string;
    bugFixes: string;
    improvements: string;
    breakingChanges: string;
}

const svgIcons = {
	title: <></>,
	feature: (
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1d1d1d" viewBox="0 0 256 256">
			<path d="M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Zm96-96-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z"></path>
		</svg>
	),
	bugfix: (
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1d1d1d" viewBox="0 0 256 256">
			<path d="M144,92a12,12,0,1,1,12,12A12,12,0,0,1,144,92ZM100,80a12,12,0,1,0,12,12A12,12,0,0,0,100,80Zm116,64A87.76,87.76,0,0,1,213,167l22.24,9.72A8,8,0,0,1,232,192a7.89,7.89,0,0,1-3.2-.67L207.38,182a88,88,0,0,1-158.76,0L27.2,191.33A7.89,7.89,0,0,1,24,192a8,8,0,0,1-3.2-15.33L43,167A87.76,87.76,0,0,1,40,144v-8H16a8,8,0,0,1,0-16H40v-8a87.76,87.76,0,0,1,3-23L20.8,79.33a8,8,0,1,1,6.4-14.66L48.62,74a88,88,0,0,1,158.76,0l21.42-9.36a8,8,0,0,1,6.4,14.66L213,89.05a87.76,87.76,0,0,1,3,23v8h24a8,8,0,0,1,0,16H216ZM56,120H200v-8a72,72,0,0,0-144,0Zm64,95.54V136H56v8A72.08,72.08,0,0,0,120,215.54ZM200,144v-8H136v79.54A72.08,72.08,0,0,0,200,144Z"></path>
		</svg>
	),
	improvement: (
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1d1d1d" viewBox="0 0 256 256">
			<path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"></path>
		</svg>
	),
	breakingChange: (
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1d1d1d" viewBox="0 0 256 256">
			<path d="M198.63,57.37a32,32,0,0,0-45.19-.06L141.79,69.52a8,8,0,0,1-11.58-11l11.72-12.29a1.59,1.59,0,0,1,.13-.13,48,48,0,0,1,67.88,67.88,1.59,1.59,0,0,1-.13.13l-12.29,11.72a8,8,0,0,1-11-11.58l12.21-11.65A32,32,0,0,0,198.63,57.37ZM114.21,186.48l-11.65,12.21a32,32,0,0,1-45.25-45.25l12.21-11.65a8,8,0,0,0-11-11.58L46.19,141.93a1.59,1.59,0,0,0-.13.13,48,48,0,0,0,67.88,67.88,1.59,1.59,0,0,0,.13-.13l11.72-12.29a8,8,0,1,0-11.58-11ZM216,152H192a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16ZM40,104H64a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm120,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V192A8,8,0,0,0,160,184ZM96,72a8,8,0,0,0,8-8V40a8,8,0,0,0-16,0V64A8,8,0,0,0,96,72Z"></path>
		</svg>
	),
	link: (
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1d1d1d" viewBox="0 0 256 256">
			<path d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z"></path>
		</svg>
	),
};

export default function Viewer({ entries, timeTaken }: { entries: ChangelogEntries, timeTaken: number }) {
	const sections = [
		{ key: 'title', value: entries.title },
		{ key: 'feature', value: entries.whatsNew },
		{ key: 'bugfix', value: entries.bugFixes },
		{ key: 'improvement', value: entries.improvements },
		{ key: 'breakingChange', value: entries.breakingChanges }
	];

	return (
		<div className="w-full max-w-full">
			<div className="w-full max-w-full prose dark:prose-invert">
				{sections.map(({ key, value }) =>
					!value ? null : (
						<div key={key} className="w-full max-w-full">
							<h3 className="w-full flex items-center gap-2">
								{svgIcons[key as keyof typeof svgIcons]}
								{readableTypes[key as keyof typeof readableTypes]}
							</h3>
							<p className="w-full">{value}</p>
						</div>
					)
				)}
				<p className="text-sm opacity-70 font-medium text-center">Generated in {(timeTaken / 10).toFixed(2)}s</p>
			</div>
		</div>
	);
}

## How to run

First, run the development server:

```bash
npm run dev
# or
yarn dev

# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Git Commit Summarizer with OpenAI

This project demonstrates how OpenAI's language models can be used to summarize Git commit histories. It compares two different approaches to processing commit data—**serial processing** and **parallel processing**—and highlights the efficiency gains of the latter.

## Project Goals

1.  **Summarize Git Commit History**:

- Generate concise and meaningful summaries of commit logs.
- Provide insights into the project's evolution or specific development periods.

2.  **Compare Processing Approaches**:

- **Serial Approach**: Commits are processed one at a time through multiple sequential API calls.
- **Parallel Approach**: Commits are processed collectively using a single API call, utilizing promises to reduce the number of interactions.

3.  **Demonstrate Efficiency Gains**:

- Show how parallel processing achieves faster execution times and reduced API call costs without significantly compromising the quality of the summaries.

---

## Implementation

### 1. **Serial Approach**

In this method, the program processes each commit individually:

- Iterates through the list of commits.
- Sends each commit as a separate API call to OpenAI.
- Collects and compiles responses into a summary.

Useful for understanding each commit independently.

**Disadvantages**:

- High latency due to multiple sequential API calls.

### 2. **Parallel Approach**

In this method, the program processes all commits in a single API call:

- Collects the entire commit history or a subset.
- Combines the commit data and sends it as a single prompt using a promise-based structure.

**Advantages**:

- Significantly faster as all API calls are made at the same time.
- Efficient for large commit histories or when an overarching summary is sufficient.

## Why the Parallel Approach is Faster

1.  **Fewer API Calls**:

- Reduces the overhead of initializing multiple connections.
- Eliminates the latency of waiting for responses between calls.

2.  **Promise-Based Design**:

- Handles asynchronous tasks more efficiently.
- Aggregates results in a streamlined manner.

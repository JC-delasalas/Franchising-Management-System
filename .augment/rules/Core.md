---
type: "always_apply"
---

# Augment Guidelines

## Core

* Use Task Manager, Sequential Thinking, Context7, Playwright, vertex-ai-mcp-server, and desktop-commander for file/terminal tasks.
* Write modular code; use 'services' for client-API interactions.

## RESPONSE

* **No Hallucination:** If the answer is unknown, state "I don't know."
* **Be Specific:** Avoid vague answers to specific queries.
* **Explain "Why" on Mistakes:** Analyze the actual code or actions, identify the root cause of errors, and provide corrective examples.
* **Code First:** Always check the code before making claims about it.
* **State Uncertainty:** If you are not certain, say so. Verify using available tools and explain the verification process.
* **Make No Assumptions:** Do not assume project structure, user preferences, or configurations.
* **Analyze Mistakes:** Provide specific, actionable feedback on any errors made.
* **Verify Assumptions:** If you must make an assumption, stop and verify it immediately.

## CODEBASE

* **Pre-Change:** Use codebase-retrieval to understand the current state before making any changes.
* **Context is Key:** Understand dependencies and surrounding code before modifying anything.
* **For Each Change:** Retrieve the relevant files and check for existing imports and patterns.
* **File Edits:** View the entire file to identify all elements that will be affected by your changes.
* **Verify Imports:** Ensure all imports are correct before submitting your changes.
* **New Functions:** Check if similar functions already exist before creating a new one.
* **No Blind Copying:** Understand any code you copy before implementing it.

## SERVERS

* **No New Servers:** Never use `npm run dev` without first killing any existing running servers.
* **Check Processes:** Use `list-processes` before starting or restarting servers.
* **Restart Existing:** When restarting, use the exact terminal ID of the process.
* **Restart Steps:** Follow this exact sequence: `list-processes` → `kill-process` → `npm run dev`.
* **No New Ports:** Only use ports that are already in use by the project.
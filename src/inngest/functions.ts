import { inngest } from "./client";
import { openai, createAgent } from "@inngest/agent-kit";

export const firstJob = inngest.createFunction(
  { id: "firstjob" },
  { event: "firstjobEvent" },
  async ({ event }) => {
    // Create a new agent with a system prompt (you can add optional tools, too)
    const summarizer = createAgent({
      name: "summarizer",
      system:
        "You are an expert summarizer.  You provide concise summaries of longer texts.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await summarizer.run(
      `Summarize the following text: ${event.data.text}`
    );

    return { output };
  }
);

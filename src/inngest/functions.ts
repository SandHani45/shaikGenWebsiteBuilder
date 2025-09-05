import { inngest } from "./client";
import {Sandbox} from '@e2b/code-interpreter'
import { openai, createAgent } from "@inngest/agent-kit";
import { getSandboxUrl } from "./utills";

export const firstJob = inngest.createFunction(
  { id: "firstjob" },
  { event: "firstjobEvent" },
  async ({ event, step }) => {
    const sandboxId = await step.run("Create Sandbox", async () => {
      const sandbox = await Sandbox.create("shaik-nextjs-webiste-builder-1");
      return sandbox.sandboxId;
    });
    // Create a new agent with a system prompt (you can add optional tools, too)
    const summarizer = createAgent({
      name: "code-agent",
      system:
        "you are an expert next.js developer. you write reliable code. main responsibilities include building and maintaining web applications using next.js, ensuring code quality and performance, and collaborating with designers and backend developers.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await summarizer.run(
      `Summarize the following text: ${event.data.text}`
    );

    const sandboxUrl = await step.run("Get Sandbox URL", async () => {
      const sandbox = await getSandboxUrl(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });
    return { output, sandboxUrl };
  }
);

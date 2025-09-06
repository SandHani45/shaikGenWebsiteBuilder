import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
} from "@inngest/agent-kit";
import { getSandboxUrl, lastAssistanttextMessageContent } from "./utills";
import { z, ZodType, ZodTypeAny } from "zod";
import { PROMPT } from "@/prompt";

export const firstJob = inngest.createFunction(
  { id: "firstjob" },
  { event: "firstjobEvent" },
  async ({ event, step }) => {
    const sandboxId = await step.run("Create Sandbox", async () => {
      const sandbox = await Sandbox.create("shaik-nextjs-webiste-builder-1");
      return sandbox.sandboxId;
    });
    
    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent({
      name: "code-agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: { temperature: 0.1 },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandboxUrl(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (err) {
                console.error(
                  `Command failed: ${err} \stdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${err} \stdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandboxUrl(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (err) {
                  return "Error: " + err;
                }
              }
            );
            if (newFiles && typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandboxUrl(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({
                    path: file,
                    content,
                  });
                }
                return JSON.stringify(contents);
              } catch (err) {
                return "Error: " + err;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistanttextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              // Handle error case
              network.state.data.task_summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork({
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summery = network.state.data.summery;
        if (summery) {
          return;
        }
        return codeAgent;
      },
    });
    const result = await network.run(event.data.text);

    const sandboxUrl = await step.run("Get Sandbox URL", async () => {
      const sandbox = await getSandboxUrl(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });
    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summery,
    };
  }
);

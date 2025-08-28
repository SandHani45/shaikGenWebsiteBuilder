import { inngest } from "./client";

export const firstJob = inngest.createFunction(
  { id: "firstjob" },
  { event: "firstjob" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "30s");
    return { message: `Hello ${event.data.text}!` };
  },
);
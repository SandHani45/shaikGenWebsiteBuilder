"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


const Page =  () => {
  const trpc = useTRPC();
  const [inputValue, setInputValue] = React.useState("");
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background job invoked successfully!");
    }
  }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    invoke.mutate({ text: inputValue });
  };
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter text"
          className="border px-2 py-1 rounded"
        />
        <Button type="submit" disabled={invoke.isPending}>Submit</Button>
      </form>
      {/* <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ text: "sandhani" })}>Invoke Background Job</Button> */}
    </div>
  );
};

export default Page;

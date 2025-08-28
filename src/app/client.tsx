"use client"

import { useTRPC } from "@/trpc/client";
import {  useSuspenseQuery } from "@tanstack/react-query";

const Client = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "sandhani" }));
    return (
        <div>
            <h1>Client Component</h1>
            {JSON.stringify(data)}
        </div>
    );
}
 
export default Client;
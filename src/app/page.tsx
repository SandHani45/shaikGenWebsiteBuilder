import {  getQueryClient, trpc } from '@/trpc/server';
import Client from './client';
import { Suspense } from 'react';


const Page =  async () => {
const queryClient = getQueryClient();
 void queryClient.prefetchQuery(trpc.createAI.queryOptions({ text: "sandhani" }));
  return (
    <div className="flex items-center justify-center h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </div>
  );
};

export default Page;

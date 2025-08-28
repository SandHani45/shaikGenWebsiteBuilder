import {prisma} from "@/lib/db";
const Page = async () => {
  const users = await prisma.user.findMany();
  return (
    <div className="flex items-center justify-center h-screen">
      {JSON.stringify(users)}
    </div>
  );
};

export default Page;

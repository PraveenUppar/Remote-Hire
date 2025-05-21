import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useUserRole = () => {
  // useUser is a hook from Clerk that provides user information
  const { user } = useUser();

  // useQuery is a hook from Convex database that allows you to fetch data
  // api.users.getUserByClerkId is a function that fetches user data by Clerk ID
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const isLoading = userData === undefined;

  // Check if the user is an interviewer or a candidate
  return {
    isLoading,
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
  };
};

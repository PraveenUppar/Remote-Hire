import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Interviwes model functions performed in the database
// Functions - getAllInterviews and getMyInterviews and getInterviewByStreamCallId and createInterview and updateInterviewStatus

// Function/Query to get all interviews
export const getAllInterviews = query({
  // handler - function to handle the request for getting interviews
  handler: async (ctx) => {
    // Check if the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    // Collect all interviews from the database
    const interviews = await ctx.db.query("interviews").collect();

    return interviews;
  },
});

// Function/Query to get all interviews for a specific user
export const getMyInterviews = query({
  // handler - function to handle the request for getting interviews for specific user
  handler: async (ctx) => {
    // Check if the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    // Collect all interviews for the authenticated user by their ID
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) =>
        q.eq("candidateId", identity.subject)
      )
      .collect();

    return interviews!;
  },
});

// Function/Query to get an interview by its stream call ID
export const getInterviewByStreamCallId = query({
  // args - arguments passed to the function streamCallId
  args: { streamCallId: v.string() },
  // Handler - function to handle the request for getting an interview
  handler: async (ctx, args) => {
    // Check if the user is authenticated
    // Collect the interview by its stream call ID
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) =>
        q.eq("streamCallId", args.streamCallId)
      )
      .first();
  },
});

// Function to create a new interview
export const createInterview = mutation({
  // args - arguments passed to the function
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  // Handler - function to handle the request for creating an interview
  handler: async (ctx, args) => {
    // Check if the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    // Save/Insert the interview to the database
    return await ctx.db.insert("interviews", {
      ...args,
    });
  },
});

// Function to update the status of an interview
export const updateInterviewStatus = mutation({
  // args - arguments passed to the function
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  // Handler - function to handle the request for updating the interview status
  handler: async (ctx, args) => {
    // Return the status of the interview by its ID
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});

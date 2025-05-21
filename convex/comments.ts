import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Comment model functions performed in the database
// Functions - addComment and getComments

// Function to add a comment to an interview only valid for interviewers
export const addComment = mutation({
  // args - arguments passed to the function
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
  },
  // Handler - function to handle the request for adding a comment
  handler: async (ctx, args) => {
    // Check if the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Insert the comment into the database
    return await ctx.db.insert("comments", {
      interviewId: args.interviewId,
      content: args.content,
      rating: args.rating,
      interviewerId: identity.subject,
    });
  },
});

// Function/Query to get all comments for an interview
export const getComments = query({
  // args - arguments passed to the function
  args: { interviewId: v.id("interviews") },
  // Handler - function to handle the request for getting comments
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
      .collect();

    return comments;
  },
});

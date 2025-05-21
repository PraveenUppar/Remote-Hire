import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// User model functions performed in the database
// Functions - Synuser and getUsers and getUserByClerkId

// Function to create a new user and checking if the user already exists in the database
export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },
  // ctx - context
  // args - arguments passed to the function
  handler: async (ctx, args) => {
    // Check if the user is exists in the database
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    // If the user exists, return the existing user
    if (existingUser) return;

    // If the user does not exist, create a new user
    return await ctx.db.insert("users", {
      ...args,
      role: "candidate",
    });
  },
});

// Function/Query to get all users from the database
export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User is not authenticated");

    const users = await ctx.db.query("users").collect();

    return users;
  },
});

//  Function/Query to get a user by their Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

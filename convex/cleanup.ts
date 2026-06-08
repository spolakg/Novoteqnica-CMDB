import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const table of ["users", "assets", "tickets", "backups", "knowledgeArticles", "sharedFolders", "vpnConnections", "troubleshootingGuides"] as const) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    // Also clear audit log
    const logs = await ctx.db.query("auditLog").collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
    return null;
  },
});
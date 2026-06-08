import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── USERS ───────────────────────────────────────────────

export const listUsers = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("engineer"), v.literal("readonly")),
    avatar: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("engineer"), v.literal("readonly")),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

// ─── ASSETS ──────────────────────────────────────────────

export const listAssets = query({
  args: { type: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("assets"),
    _creationTime: v.number(),
    name: v.string(),
    type: v.string(),
    serialNumber: v.optional(v.string()),
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    location: v.optional(v.string()),
    department: v.optional(v.string()),
    status: v.string(),
    purchaseDate: v.optional(v.number()),
    warrantyEnd: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    macAddress: v.optional(v.string()),
    hostname: v.optional(v.string()),
    operatingSystem: v.optional(v.string()),
    firmwareVersion: v.optional(v.string()),
    notes: v.optional(v.string()),
    cpu: v.optional(v.string()),
    ram: v.optional(v.string()),
    storage: v.optional(v.string()),
    batteryDate: v.optional(v.number()),
    capacity: v.optional(v.string()),
    tonerType: v.optional(v.string()),
    raidConfig: v.optional(v.string()),
    storageCapacity: v.optional(v.string()),
    parentAssetId: v.optional(v.id("assets")),
    createdBy: v.optional(v.id("users")),
  })),
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("assets")
        .withIndex("by_type", (q) => q.eq("type", args.type as any))
        .collect();
    }
    return await ctx.db.query("assets").collect();
  },
});

export const getAsset = query({
  args: { id: v.id("assets") },
  returns: v.union(
    v.object({
      _id: v.id("assets"),
      _creationTime: v.number(),
      name: v.string(),
      type: v.string(),
      serialNumber: v.optional(v.string()),
      model: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      location: v.optional(v.string()),
      department: v.optional(v.string()),
      status: v.string(),
      purchaseDate: v.optional(v.number()),
      warrantyEnd: v.optional(v.number()),
      ipAddress: v.optional(v.string()),
      macAddress: v.optional(v.string()),
      hostname: v.optional(v.string()),
      operatingSystem: v.optional(v.string()),
      firmwareVersion: v.optional(v.string()),
      notes: v.optional(v.string()),
      cpu: v.optional(v.string()),
      ram: v.optional(v.string()),
      storage: v.optional(v.string()),
      batteryDate: v.optional(v.number()),
      capacity: v.optional(v.string()),
      tonerType: v.optional(v.string()),
      raidConfig: v.optional(v.string()),
      storageCapacity: v.optional(v.string()),
      parentAssetId: v.optional(v.id("assets")),
      createdBy: v.optional(v.id("users")),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createAsset = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    serialNumber: v.optional(v.string()),
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    location: v.optional(v.string()),
    department: v.optional(v.string()),
    status: v.string(),
    ipAddress: v.optional(v.string()),
    hostname: v.optional(v.string()),
    operatingSystem: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("assets"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("assets", args as any);
  },
});

export const updateAsset = mutation({
  args: {
    id: v.id("assets"),
    name: v.optional(v.string()),
    status: v.optional(v.string()),
    location: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields as any);
    return null;
  },
});

export const deleteAsset = mutation({
  args: { id: v.id("assets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

// ─── DASHBOARD STATS ─────────────────────────────────────

export const getDashboardStats = query({
  args: {},
  returns: v.object({
    totalAssets: v.number(),
    servers: v.number(),
    hyperVHosts: v.number(),
    printers: v.number(),
    ups: v.number(),
    switches: v.number(),
    accessPoints: v.number(),
    nas: v.number(),
    openTickets: v.number(),
    resolvedTickets: v.number(),
    activeBackups: v.number(),
    failedBackups: v.number(),
  }),
  handler: async (ctx) => {
    const allAssets = await ctx.db.query("assets").collect();
    const allTickets = await ctx.db.query("tickets").collect();
    const allBackups = await ctx.db.query("backups").collect();

    return {
      totalAssets: allAssets.length,
      servers: allAssets.filter((a) => a.type === "server").length,
      hyperVHosts: allAssets.filter((a) => a.type === "hyperv_host").length,
      printers: allAssets.filter((a) => a.type === "printer").length,
      ups: allAssets.filter((a) => a.type === "ups").length,
      switches: allAssets.filter((a) => a.type === "switch").length,
      accessPoints: allAssets.filter((a) => a.type === "access_point").length,
      nas: allAssets.filter((a) => a.type === "nas").length,
      openTickets: allTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length,
      resolvedTickets: allTickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
      activeBackups: allBackups.filter((b) => b.status === "success").length,
      failedBackups: allBackups.filter((b) => b.status === "failed").length,
    };
  },
});

// ─── KNOWLEDGE ARTICLES ─────────────────────────────────

export const listKnowledgeArticles = query({
  args: { category: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("knowledgeArticles"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    authorId: v.optional(v.id("users")),
    published: v.boolean(),
    viewCount: v.number(),
  })),
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("knowledgeArticles")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    }
    return await ctx.db.query("knowledgeArticles").collect();
  },
});

export const createKnowledgeArticle = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
  },
  returns: v.id("knowledgeArticles"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeArticles", { ...args, viewCount: 0 } as any);
  },
});

export const searchKnowledge = query({
  args: { query: v.string() },
  returns: v.array(v.object({
    _id: v.id("knowledgeArticles"),
    _creationTime: v.number(),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
    viewCount: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeArticles")
      .withSearchIndex("search_title_body", (q) => q.search("title", args.query))
      .take(20);
  },
});

// ─── TICKETS ─────────────────────────────────────────────

export const listTickets = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("tickets"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    status: v.string(),
    category: v.string(),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
    relatedAssetId: v.optional(v.id("assets")),
  })),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tickets")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }
    return await ctx.db.query("tickets").collect();
  },
});

export const createTicket = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    category: v.string(),
    createdBy: v.optional(v.id("users")),
  },
  returns: v.id("tickets"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("tickets", { ...args, status: "open" } as any);
  },
});

export const updateTicketStatus = mutation({
  args: {
    id: v.id("tickets"),
    status: v.string(),
    resolution: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status, resolution: args.resolution } as any);
    return null;
  },
});

export const deleteTicket = mutation({
  args: { id: v.id("tickets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const getRecentTickets = query({
  args: { limit: v.number() },
  returns: v.array(v.object({
    _id: v.id("tickets"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    status: v.string(),
    category: v.string(),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
    relatedAssetId: v.optional(v.id("assets")),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .order("desc")
      .take(args.limit);
  },
});

// ─── COMMENTS ────────────────────────────────────────────

export const listComments = query({
  args: { ticketId: v.optional(v.id("tickets")), assetId: v.optional(v.id("assets")) },
  returns: v.array(v.object({
    _id: v.id("comments"),
    _creationTime: v.number(),
    ticketId: v.optional(v.id("tickets")),
    assetId: v.optional(v.id("assets")),
    userId: v.optional(v.id("users")),
    userName: v.string(),
    body: v.string(),
  })),
  handler: async (ctx, args) => {
    if (args.ticketId) {
      return await ctx.db
        .query("comments")
        .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId!))
        .order("desc")
        .collect();
    }
    if (args.assetId) {
      return await ctx.db
        .query("comments")
        .withIndex("by_asset", (q) => q.eq("assetId", args.assetId!))
        .order("desc")
        .collect();
    }
    return [];
  },
});

export const createComment = mutation({
  args: {
    ticketId: v.optional(v.id("tickets")),
    assetId: v.optional(v.id("assets")),
    userName: v.string(),
    body: v.string(),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", args);
  },
});

// ─── BACKUPS ─────────────────────────────────────────────

export const listBackups = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("backups"),
    _creationTime: v.number(),
    assetId: v.id("assets"),
    backupType: v.string(),
    frequency: v.string(),
    lastBackup: v.optional(v.number()),
    nextBackup: v.optional(v.number()),
    status: v.string(),
    notes: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("backups").collect();
  },
});

// ─── TROUBLESHOOTING GUIDES ─────────────────────────────

export const listTroubleshootingGuides = query({
  args: { category: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("troubleshootingGuides"),
    _creationTime: v.number(),
    title: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    problem: v.string(),
    symptoms: v.array(v.string()),
    causes: v.array(v.string()),
    solutions: v.array(v.object({ step: v.number(), description: v.string() })),
    relatedAssetType: v.optional(v.string()),
    tags: v.array(v.string()),
    authorId: v.optional(v.id("users")),
  })),
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("troubleshootingGuides")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    }
    return await ctx.db.query("troubleshootingGuides").collect();
  },
});

// ─── SHARED FOLDERS ──────────────────────────────────────

export const listSharedFolders = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("sharedFolders"),
    _creationTime: v.number(),
    name: v.string(),
    path: v.string(),
    serverId: v.optional(v.id("assets")),
    owner: v.optional(v.id("users")),
    description: v.optional(v.string()),
    permissions: v.array(v.object({
      userOrGroup: v.string(),
      accessLevel: v.string(),
    })),
    ntfsPermissions: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("sharedFolders").collect();
  },
});

// ─── VPN CONNECTIONS ─────────────────────────────────────

export const listVpnConnections = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("vpnConnections"),
    _creationTime: v.number(),
    name: v.string(),
    type: v.string(),
    gatewayId: v.optional(v.id("assets")),
    serverAddress: v.optional(v.string()),
    configuration: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("vpnConnections").collect();
  },
});

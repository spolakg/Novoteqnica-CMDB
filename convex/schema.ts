import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("engineer"), v.literal("readonly")),
    avatar: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // Assets (generic CMDB items)
  assets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("server"),
      v.literal("hyperv_host"),
      v.literal("virtual_machine"),
      v.literal("printer"),
      v.literal("ups"),
      v.literal("nas"),
      v.literal("switch"),
      v.literal("access_point"),
      v.literal("gateway"),
      v.literal("firewall"),
      v.literal("workstation"),
      v.literal("other")
    ),
    serialNumber: v.optional(v.string()),
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    location: v.optional(v.string()),
    department: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("maintenance"),
      v.literal("retired")
    ),
    purchaseDate: v.optional(v.number()),
    warrantyEnd: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    macAddress: v.optional(v.string()),
    hostname: v.optional(v.string()),
    operatingSystem: v.optional(v.string()),
    firmwareVersion: v.optional(v.string()),
    notes: v.optional(v.string()),
    // For servers
    cpu: v.optional(v.string()),
    ram: v.optional(v.string()),
    storage: v.optional(v.string()),
    // For UPS
    batteryDate: v.optional(v.number()),
    capacity: v.optional(v.string()),
    // For printers
    tonerType: v.optional(v.string()),
    // For NAS
    raidConfig: v.optional(v.string()),
    storageCapacity: v.optional(v.string()),
    // Relation to parent asset
    parentAssetId: v.optional(v.id("assets")),
    createdBy: v.optional(v.id("users")),
  }).index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_location", ["location"])
    .index("by_parent", ["parentAssetId"]),

  // Knowledge Base Articles
  knowledgeArticles: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.union(
      v.literal("a_plus"),
      v.literal("network_plus"),
      v.literal("hyper_v"),
      v.literal("backup"),
      v.literal("unifi"),
      v.literal("vpn"),
      v.literal("printers"),
      v.literal("ups"),
      v.literal("shared_folders"),
      v.literal("nas"),
      v.literal("security"),
      v.literal("general")
    ),
    tags: v.array(v.string()),
    authorId: v.optional(v.id("users")),
    published: v.boolean(),
    viewCount: v.number(),
  }).index("by_category", ["category"])
    .searchIndex("search_title_body", {
      searchField: "title",
      filterFields: ["category"],
    }),

  // Incidents / Tickets
  tickets: defineTable({
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    category: v.string(),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
    relatedAssetId: v.optional(v.id("assets")),
  }).index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_assigned", ["assignedTo"]),

  // Backups
  backups: defineTable({
    assetId: v.id("assets"),
    backupType: v.string(),
    frequency: v.string(),
    lastBackup: v.optional(v.number()),
    nextBackup: v.optional(v.number()),
    status: v.union(v.literal("success"), v.literal("failed"), v.literal("warning")),
    notes: v.optional(v.string()),
  }).index("by_asset", ["assetId"])
    .index("by_status", ["status"]),

  // Shared Folders
  sharedFolders: defineTable({
    name: v.string(),
    path: v.string(),
    serverId: v.optional(v.id("assets")),
    owner: v.optional(v.id("users")),
    description: v.optional(v.string()),
    permissions: v.array(
      v.object({
        userOrGroup: v.string(),
        accessLevel: v.union(v.literal("read"), v.literal("modify"), v.literal("full_control")),
      })
    ),
    ntfsPermissions: v.optional(v.string()),
  }).index("by_server", ["serverId"]),

  // VPN Connections
  vpnConnections: defineTable({
    name: v.string(),
    type: v.union(v.literal("l2tp"), v.literal("wireguard"), v.literal("site_to_site"), v.literal("teleport"), v.literal("ssl"), v.literal("ipsec")),
    gatewayId: v.optional(v.id("assets")),
    serverAddress: v.optional(v.string()),
    configuration: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("error")),
    notes: v.optional(v.string()),
  }).index("by_type", ["type"]),

  // Audit Log
  auditLog: defineTable({
    action: v.string(),
    userId: v.optional(v.id("users")),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  // Comments (for tickets and other items)
  comments: defineTable({
    ticketId: v.optional(v.id("tickets")),
    assetId: v.optional(v.id("assets")),
    userId: v.optional(v.id("users")),
    userName: v.string(),
    body: v.string(),
  }).index("by_ticket", ["ticketId"])
    .index("by_asset", ["assetId"]),

  // Troubleshooting Guides
  troubleshootingGuides: defineTable({
    title: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    problem: v.string(),
    symptoms: v.array(v.string()),
    causes: v.array(v.string()),
    solutions: v.array(
      v.object({
        step: v.number(),
        description: v.string(),
      })
    ),
    relatedAssetType: v.optional(v.string()),
    tags: v.array(v.string()),
    authorId: v.optional(v.id("users")),
  }).index("by_category", ["category"])
    .searchIndex("search_problem", {
      searchField: "problem",
      filterFields: ["category"],
    }),
});

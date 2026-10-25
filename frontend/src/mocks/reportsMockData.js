/**
 * Mock data for the Reports Queue admin screen (feature/admin-reports-queue-ui).
 *
 * FLAG: SRS §3.11 and architecture §7.1 were referenced in the ticket but
 * are not present in the provided project zip, so the shape below is my
 * best reasonable guess at a moderation-report record, not a confirmed
 * contract. Please diff this against the actual SRS/architecture docs —
 * field names (especially `reason` enum values and `status` values) are
 * the most likely things to need adjusting once the real backend schema
 * is available.
 *
 * Report shape used here:
 * {
 *   id: string,
 *   status: 'open' | 'resolved' | 'dismissed',
 *   reason: 'harassment' | 'fake_profile' | 'inappropriate_content' | 'spam' | 'other',
 *   description: string,          // free text the reporter submitted
 *   reportedBy: { id, name, email },
 *   reportedUser: { id, name, email },
 *   createdAt: string (ISO date),
 *   resolvedAt: string (ISO date) | null,
 *   resolvedBy: string | null,    // admin name who actioned it
 *   adminNotes: string | null,
 * }
 */

export const REPORT_REASONS = {
  harassment: "Harassment",
  fake_profile: "Fake profile",
  inappropriate_content: "Inappropriate content",
  spam: "Spam",
  other: "Other",
};

export const REPORT_STATUSES = ["open", "resolved", "dismissed"];

export const mockReports = [
  {
    id: "rep_001",
    status: "open",
    reason: "harassment",
    description:
      "This user has sent repeated messages after I asked them to stop. Attaching screenshots on request.",
    reportedBy: { id: "u_101", name: "Marta Alemu", email: "marta.a@example.com" },
    reportedUser: { id: "u_204", name: "Yonas Bekele", email: "yonas.b@example.com" },
    createdAt: "2026-08-14T09:22:00Z",
    resolvedAt: null,
    resolvedBy: null,
    adminNotes: null,
  },
  {
    id: "rep_002",
    status: "open",
    reason: "fake_profile",
    description:
      "Profile photo appears to be a stock image and the bio doesn't match any of the answers in chat.",
    reportedBy: { id: "u_115", name: "Selam Girma", email: "selam.g@example.com" },
    reportedUser: { id: "u_233", name: "Unknown User", email: "temp233@example.com" },
    createdAt: "2026-08-15T14:05:00Z",
    resolvedAt: null,
    resolvedBy: null,
    adminNotes: null,
  },
  {
    id: "rep_003",
    status: "resolved",
    reason: "inappropriate_content",
    description: "Sent unsolicited explicit images in chat.",
    reportedBy: { id: "u_120", name: "Bethel Tesfaye", email: "bethel.t@example.com" },
    reportedUser: { id: "u_240", name: "Dawit Mengistu", email: "dawit.m@example.com" },
    createdAt: "2026-08-10T11:40:00Z",
    resolvedAt: "2026-08-11T08:15:00Z",
    resolvedBy: "admin_robel",
    adminNotes: "Account suspended for 30 days per policy §4.2. User notified by email.",
  },
  {
    id: "rep_004",
    status: "dismissed",
    reason: "spam",
    description: "This person keeps posting links to an external rental listing site.",
    reportedBy: { id: "u_130", name: "Hana Solomon", email: "hana.s@example.com" },
    reportedUser: { id: "u_250", name: "Kebede Worku", email: "kebede.w@example.com" },
    createdAt: "2026-08-09T16:30:00Z",
    resolvedAt: "2026-08-09T18:02:00Z",
    resolvedBy: "admin_robel",
    adminNotes: "Reviewed conversation — links were to the user's own current listing, not spam. No action taken.",
  },
  {
    id: "rep_005",
    status: "open",
    reason: "other",
    description: "Asked me to pay a 'deposit' before meeting in person. Feels like a scam.",
    reportedBy: { id: "u_142", name: "Ruth Alazar", email: "ruth.a@example.com" },
    reportedUser: { id: "u_261", name: "Samuel Fikru", email: "samuel.f@example.com" },
    createdAt: "2026-08-16T10:12:00Z",
    resolvedAt: null,
    resolvedBy: null,
    adminNotes: null,
  },
  {
    id: "rep_006",
    status: "resolved",
    reason: "harassment",
    description: "Repeated rude comments about my appearance after I declined to match.",
    reportedBy: { id: "u_150", name: "Liya Tadesse", email: "liya.t@example.com" },
    reportedUser: { id: "u_270", name: "Abel Girma", email: "abel.g@example.com" },
    createdAt: "2026-08-05T13:00:00Z",
    resolvedAt: "2026-08-06T09:45:00Z",
    resolvedBy: "admin_sara",
    adminNotes: "First offense — formal warning issued, no suspension.",
  },
];
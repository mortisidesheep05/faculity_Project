import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    details: {
      type: String,
    },
  },
  { timestamps: true },
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;

import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number,
});

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "Mentor / Speaker" },
    type: { type: String, enum: ["Mentor", "Speaker", "Mentor / Speaker"], default: "Mentor / Speaker" },
    organization: String,
    email: String,
    linkedIn: String,
    image: String,
  },
  { _id: true },
);

const completionSchema = new mongoose.Schema(
  {
    registeredStudents: { type: Number, min: 0, default: 0 },
    participatedStudents: { type: Number, min: 0, default: 0 },
    absentStudents: { type: Number, min: 0, default: 0 },
    attendedStudents: { type: Number, min: 0, default: 0 },
    attendedGuests: { type: Number, min: 0, default: 0 },
    guestAttendance: {
      type: [
        {
          guestId: String,
          name: String,
          type: String,
          attended: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    results: [
      {
        position: String,
        winner: String,
      },
    ],
    summary: String,
    activities: String,
    achievements: String,
    outcome: String,
    feedback: String,
    notes: String,
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    category: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    responsibility: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    }, // e.g. "NSS Incharge", "Placement"
    description: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    date: {
      type: Date,
      required: function () {
        return this.status !== "Draft";
      },
    },
    time: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    venue: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    participants: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    budget: {
      type: Number,
      required: function () {
        return this.status !== "Draft";
      },
    },
    coordinator: {
      type: String,
      required: function () {
        return this.status !== "Draft";
      },
    },
    objectives: { type: String },
    requirements: { type: String },

    // Extended Schema Fields
    priority: { type: String, default: "Medium" },
    endDate: { type: Date },
    endTime: { type: String },
    building: { type: String },
    floor: { type: String },
    room: { type: String },
    mapsLink: { type: String },
    venueType: { type: String, default: "Indoor" },
    coCoordinator: { type: String },
    orgDepartment: { type: String, default: "CSE" },
    guestName: { type: String },
    guestOrg: { type: String },
    guestEmail: { type: String },
    guestLinkedIn: { type: String },
    guests: { type: [guestSchema], default: [] },
    maxCapacity: { type: Number },
    targetAudience: { type: String, default: "Students" },
    eligibility: { type: String, default: "Open For Everyone" },
    regRequired: { type: String, default: "Yes" },
    certAvailable: { type: String, default: "Yes" },
    regFee: { type: Number },
    sponsorAmount: { type: Number },
    tags: { type: String },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Pending HOD",
        "Pending Principal",
        "Pending Director",
        "Approved",
        "Rejected",
        "Returned",
      ],
      default: "Submitted",
    },

    // Approval Workflow History
    approvalHistory: [
      {
        role: { type: String, enum: ["HOD", "Principal", "Director"] },
        status: { type: String, enum: ["Approved", "Rejected", "Returned"] },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvedAt: Date,
        remarks: String,
      },
    ],

    // Files uploaded before approval
    attachments: [attachmentSchema],

    // Documentation uploaded after Principal Approval
    documentation: {
      photos: [attachmentSchema],
      videos: [attachmentSchema],
      poster: [attachmentSchema],
      notice: [attachmentSchema],
      invitation: [attachmentSchema],
      reportPdf: [attachmentSchema],
      brochure: [attachmentSchema],
      attendanceSheet: [attachmentSchema],
      certificates: [attachmentSchema],
      pressRelease: [attachmentSchema],
      others: [attachmentSchema],
    },
    completion: { type: completionSchema },
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);
export default Event;

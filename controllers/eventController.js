import Event from "../models/Event.js";
import AuditLog from "../models/AuditLog.js";

const getEventLifecycleStatus = (event) => {
  if (!event.date) return "Upcoming";
  const startDate = new Date(event.date);
  const start = event.time
    ? new Date(`${startDate.toISOString().split("T")[0]}T${event.time}`)
    : startDate;
  const endDate = event.endDate ? new Date(event.endDate) : startDate;
  const end = event.endTime
    ? new Date(`${endDate.toISOString().split("T")[0]}T${event.endTime}`)
    : new Date(start.getTime() + 60 * 60 * 1000);
  const now = new Date();
  if (now < start) return "Upcoming";
  if (now <= end) return "Ongoing";
  return "Completed";
};

const withLifecycleStatus = (event) => {
  const data = event.toObject ? event.toObject() : event;
  return { ...data, eventStatus: getEventLifecycleStatus(data) };
};

// Helper to log audit
const logAudit = async (action, performedBy, eventId, details) => {
  await AuditLog.create({ action, performedBy, eventId, details });
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Faculty)
export const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body };
    eventData.department = req.user.department;
    eventData.createdBy = req.user._id;
    eventData.status = req.body.status === "Draft" ? "Draft" : "Pending HOD";

    // Clean empty number/date fields to prevent CastError
    [
      "date",
      "endDate",
      "budget",
      "regFee",
      "sponsorAmount",
      "maxCapacity",
    ].forEach((field) => {
      if (eventData[field] === "") delete eventData[field];
    });

    const event = new Event(eventData);

    const createdEvent = await event.save();
    await logAudit(
      "CREATE_EVENT",
      req.user._id,
      createdEvent._id,
      `Event ${createdEvent.title || "Draft"} created${createdEvent.status === "Draft" ? " as Draft." : " and sent to HOD."}`,
    );

    // If socket.io is setup, emit notification (only if not a draft)
    const io = req.app.get("io");
    if (io && eventData.status !== "Draft") {
      io.to("HOD").emit("notification", {
        message: `New event created: ${createdEvent.title}`,
      });
    }

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Private (Faculty - only for Returned events)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to edit this event" });
    }

    if (event.status !== "Returned" && event.status !== "Draft") {
      return res
        .status(400)
        .json({
          message: "Can only edit events that have been returned or are drafts",
        });
    }

    const allowedFields = [
      "title",
      "category",
      "responsibility",
      "description",
      "date",
      "time",
      "venue",
      "participants",
      "budget",
      "coordinator",
      "objectives",
      "requirements",
      "attachments",
      "priority",
      "endDate",
      "endTime",
      "building",
      "floor",
      "room",
      "mapsLink",
      "venueType",
      "coCoordinator",
      "orgDepartment",
      "guestName",
      "guestOrg",
      "guestEmail",
      "guestLinkedIn",
      "guests",
      "maxCapacity",
      "targetAudience",
      "eligibility",
      "regRequired",
      "certAvailable",
      "regFee",
      "sponsorAmount",
      "tags",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (
          req.body[field] === "" &&
          [
            "date",
            "endDate",
            "budget",
            "regFee",
            "sponsorAmount",
            "maxCapacity",
          ].includes(field)
        ) {
          event[field] = undefined;
        } else {
          event[field] = req.body[field];
        }
      }
    });

    let nextStatus = "Pending HOD";
    if (req.body.status === "Draft") {
      nextStatus = "Draft";
    } else if (
      event.status === "Returned" &&
      event.approvalHistory &&
      event.approvalHistory.length > 0
    ) {
      // Find the role that returned it to send it directly back to them
      const lastReturn = [...event.approvalHistory]
        .reverse()
        .find((h) => h.status === "Returned");
      if (lastReturn) {
        if (lastReturn.role === "HOD") nextStatus = "Pending HOD";
        else if (lastReturn.role === "Principal")
          nextStatus = "Pending Principal";
        else if (lastReturn.role === "Director")
          nextStatus = "Pending Director";
      }
    }

    event.status = nextStatus;

    const updatedEvent = await event.save();
    await logAudit(
      "UPDATE_EVENT",
      req.user._id,
      updatedEvent._id,
      `Event ${event.title || "Draft"} updated${updatedEvent.status === "Draft" ? " as Draft." : " and resubmitted."}`,
    );

    const io = req.app.get("io");
    if (io && updatedEvent.status !== "Draft") {
      let targetRole = "HOD";
      if (updatedEvent.status === "Pending Principal") targetRole = "Principal";
      if (updatedEvent.status === "Pending Director") targetRole = "Director";

      io.to(targetRole).emit("notification", {
        message: `Event resubmitted: ${updatedEvent.title}`,
      });
    }

    res.json(withLifecycleStatus(updatedEvent));
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events (filtered by role)
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Faculty") {
      query.createdBy = req.user._id;
    } else if (req.user.role === "HOD") {
      query.department = req.user.department;
      query.status = { $ne: "Draft" }; // HOD doesn't see drafts
    } else if (req.user.role === "Principal") {
      query.status = {
        $in: [
          "Pending Principal",
          "Pending Director",
          "Approved",
          "Rejected",
          "Returned",
        ],
      }; // Principal sees events that passed HOD
    } else if (req.user.role === "Director") {
      query.status = {
        $in: ["Pending Director", "Approved", "Rejected", "Returned"],
      }; // Director sees events that passed Principal
    }

    // Filters from query params
    if (req.query.department) query.department = req.query.department;
    if (req.query.status) query.status = req.query.status;
    if (req.query.responsibility)
      query.responsibility = req.query.responsibility;

    // Search
    if (req.query.keyword) {
      query.title = { $regex: req.query.keyword, $options: "i" };
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email department")
      .populate("approvalHistory.approvedBy", "name role")
      .sort({ createdAt: -1 });
    res.json(events.map(withLifecycleStatus));
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email department")
      .populate("approvalHistory.approvedBy", "name role");

    if (event) {
      res.json(withLifecycleStatus(event));
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event status (Approve/Reject/Return)
// @route   PUT /api/events/:id/status
// @access  Private (HOD, Principal)
export const updateEventStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const role = req.user.role;
    if (role !== "HOD" && role !== "Principal" && role !== "Director") {
      return res
        .status(401)
        .json({ message: "Not authorized to update status" });
    }

    let nextStatus = event.status;

    if (role === "HOD") {
      if (status === "Approved") nextStatus = "Pending Principal";
      else nextStatus = status; // Rejected or Returned
    } else if (role === "Principal") {
      if (status === "Approved") nextStatus = "Pending Director";
      else nextStatus = status; // Rejected, Returned
    } else if (role === "Director") {
      nextStatus = status; // Approved, Rejected, Returned
    }

    event.status = nextStatus;
    event.approvalHistory.push({
      role: role,
      status: status,
      approvedBy: req.user._id,
      approvedAt: Date.now(),
      remarks,
    });

    const updatedEvent = await event.save();
    await logAudit(
      `${status.toUpperCase()}_${role}`,
      req.user._id,
      event._id,
      remarks || `Status updated to ${nextStatus}`,
    );

    const io = req.app.get("io");
    if (io) {
      io.to(event.createdBy.toString()).emit("notification", {
        message: `Event ${event.title} was ${status} by ${role}`,
      });
      if (nextStatus === "Pending Principal") {
        io.to("Principal").emit("notification", {
          message: `New event pending principal approval: ${event.title}`,
        });
      } else if (nextStatus === "Pending Director") {
        io.to("Director").emit("notification", {
          message: `New event pending director approval: ${event.title}`,
        });
      }
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Post-Approval Documentation
// @route   POST /api/events/:id/documents
// @access  Private (Faculty)
export const uploadDocumentation = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (event.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Cannot upload docs for unapproved events" });
    }

    // expects req.body.category (e.g. 'photos', 'reportPdf') and req.body.files (array of attachment objects)
    const { category, files } = req.body;
    if (!event.documentation[category]) {
      return res
        .status(400)
        .json({ message: "Invalid documentation category" });
    }

    event.documentation[category].push(...files);
    await event.save();

    await logAudit(
      "UPLOAD_DOCS",
      req.user._id,
      event._id,
      `Uploaded ${category} documents.`,
    );

    res.json(withLifecycleStatus(event));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save post-event completion details
// @route   PUT /api/events/:id/completion
// @access  Private (Faculty)
export const updateCompletion = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (getEventLifecycleStatus(event) !== "Completed") {
      return res.status(400).json({ message: "Completion details can only be added after the event has ended" });
    }

    const completion = { ...req.body };

    if (!Array.isArray(completion.guestAttendance)) {
      completion.guestAttendance = [];
    } else {
      completion.guestAttendance = completion.guestAttendance.map((guest) => ({
        guestId: guest?.guestId || "",
        name: guest?.name || "",
        type: guest?.type || "Mentor / Speaker",
        attended: Boolean(guest?.attended),
      }));
    }

    const registered = Number(completion.registeredStudents) || 0;
    const attended = Number(completion.attendedStudents) || 0;
    completion.absentStudents = Math.max(registered - attended, 0);
    event.completion = completion;
    await event.save();

    await logAudit("UPDATE_COMPLETION", req.user._id, event._id, `Completion details updated for ${event.title}.`);
    res.json(withLifecycleStatus(event));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Faculty only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    await logAudit(
      "DELETE_EVENT",
      req.user._id,
      event._id,
      `Event ${event.title} deleted.`,
    );

    res.json({ message: "Event removed" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

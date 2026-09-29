import Event from "../models/Event.js";

export const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    let baseQuery = {};

    if (role === "Faculty") {
      baseQuery.createdBy = req.user._id;
    } else if (role === "HOD") {
      baseQuery.department = req.user.department;
    }
    // Principal and Admin see all

    const totalEvents = await Event.countDocuments(baseQuery);

    // Group by status
    const pendingCount = await Event.countDocuments({
      ...baseQuery,
      status: { $regex: /Pending/i },
    });
    const approvedCount = await Event.countDocuments({
      ...baseQuery,
      status: "Approved",
    });
    const rejectedCount = await Event.countDocuments({
      ...baseQuery,
      status: "Rejected",
    });

    // Group by department (mostly for Principal)
    const departmentStats = await Event.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    res.json({
      totalEvents,
      pendingCount,
      approvedCount,
      rejectedCount,
      departmentStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

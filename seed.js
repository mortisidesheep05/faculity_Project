import User from "./models/User.js";
import Event from "./models/Event.js";

const createFacultyEvents = async (user) => {
  const titles = [
    "TinkerHub Innovation Sprint",
    "AI & Web Development Bootcamp",
    "Campus Tech Leadership Day",
  ];

  for (const [index, title] of titles.entries()) {
    const existing = await Event.findOne({ title, createdBy: user._id });
    if (existing) continue;

    await Event.create({
      title,
      category: index % 2 === 0 ? "Workshop" : "Seminar",
      responsibility: user.responsibilities?.[0] || "Faculty Event",
      description:
        index % 2 === 0
          ? "A hands-on session designed to explore creative ideas and rapid prototyping."
          : "An interactive event focused on practical learning, collaboration, and project presentation.",
      date: new Date(Date.now() + (index + 1) * 86400000),
      time: index % 2 === 0 ? "10:00" : "14:00",
      venue: "Innovation Lab",
      participants: index % 2 === 0 ? "60" : "80",
      budget: 2500 + index * 500,
      coordinator: user.name,
      department: user.department,
      createdBy: user._id,
      status: index === 0 ? "Approved" : "Pending HOD",
      guestName: index === 0 ? "Ms. Jipsa Kurian" : "Guest Speaker",
      guestOrg: "College Community",
      guests: [
        {
          name: index === 0 ? "Mentor Team" : "Guest Speaker",
          designation: "Mentor / Speaker",
          type: "Mentor / Speaker",
          organization: "College Community",
        },
      ],
      maxCapacity: 100,
      targetAudience: "Students",
      eligibility: "Open For Everyone",
      regRequired: "Yes",
      certAvailable: "Yes",
    });
  }
};

export const seedDatabase = async () => {
  try {
    await User.deleteMany();

    const users = [
      {
        name: "Admin User",
        email: "admin@college.edu",
        password: "password123",
        role: "Admin",
        department: "Administration",
      },
      {
        name: "Dr. Josephkutty Jacob",
        email: "principal@college.edu",
        password: "password123",
        role: "Principal",
        department: "Administration",
      },
      {
        name: "Executive Director",
        email: "director@college.edu",
        password: "password123",
        role: "Director",
        department: "Administration",
      },
      {
        name: "Dr. Sujithra MS",
        email: "hod.cs@college.edu",
        password: "password123",
        role: "HOD",
        department: "Computer Science",
      },
      {
        name: "Thomas Sir",
        email: "thomas@college.edu",
        password: "password123",
        role: "Faculty",
        department: "Computer Science",
        designation: "Assistant Professor",
        responsibilities: ["Association Incharge"],
      },
      {
        name: "Ms. Josemary A",
        email: "josemary@college.edu",
        password: "password123",
        role: "Faculty",
        department: "Computer Science",
        designation: "Associate Professor",
        responsibilities: ["IEEE Incharge"],
      },
      {
        name: "Ms. Jipsa Kurian",
        email: "jipsa@college.edu",
        password: "password123",
        role: "Faculty",
        department: "Computer Science",
        designation: "Assistant Professor",
        responsibilities: ["TinkerHub Incharge"],
      },
    ];

    for (let user of users) {
      try {
        const exists = await User.findOne({ email: user.email });
        if (!exists) {
          await User.create(user);
          console.log(`Created missing seed user: ${user.name} (${user.email})`);
        }
      } catch (err) {
        if (err.code !== 11000) {
          console.error(`Error creating user ${user.email}:`, err);
        }
      }
    }

    const allUsers = await User.find();
    for (const user of allUsers.filter((u) => u.role === "Faculty")) {
      await createFacultyEvents(user);
    }

    console.log("Database seed check completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Allow direct execution via `node seed.js`
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  const dotenv = await import("dotenv");
  dotenv.config();
  const mongoose = (await import("mongoose")).default;
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/faculty_portal";
  console.log("Connecting to MongoDB for manual seeding...");
  await mongoose.connect(uri);
  await seedDatabase();
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}


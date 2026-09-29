const axios = require("axios");

async function run() {
  try {
    const login = await axios.post("http://localhost:5001/api/users/login", {
      email: "josemary@college.edu",
      password: "password123",
    });
    const token = login.data.token;
    console.log("Logged in");

    // Create draft
    const draft = await axios.post(
      "http://localhost:5001/api/events",
      {
        title: "Test Draft",
        category: "Workshop",
        status: "Draft",
        date: "2025-01-01",
        time: "10:00",
        venue: "Room 1",
        budget: 100,
      },
      { headers: { Authorization: "Bearer " + token } },
    );

    const id = draft.data._id;
    console.log("Created Draft: " + id);

    // Submit draft
    const submit = await axios.put(
      "http://localhost:5001/api/events/" + id,
      { status: "Submitted" },
      { headers: { Authorization: "Bearer " + token } },
    );
    console.log("Submitted!", submit.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
}
run();

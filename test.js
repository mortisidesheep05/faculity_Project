import fs from "fs";

async function run() {
  try {
    const login = await fetch("http://localhost:5001/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "josemary@college.edu",
        password: "password123",
      }),
    }).then((r) => r.json());

    const token = login.token;

    const draftRes = await fetch("http://localhost:5001/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title: "Test Draft",
        category: "Workshop",
        status: "Draft",
        date: "2025-01-01",
        time: "10:00",
        venue: "Room 1",
        budget: 100,
      }),
    });
    const draft = await draftRes.json();
    const id = draft._id;
    console.log("Draft:", id);

    const submitRes = await fetch("http://localhost:5001/api/events/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status: "Submitted" }),
    });
    console.log("Submit status:", submitRes.status);
    console.log("Response:", await submitRes.json());
  } catch (err) {
    console.error(err);
  }
}
run();

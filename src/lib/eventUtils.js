export const getEventStatus = (event) => {
  if (!event.date) return "Upcoming";

  const start = new Date(`${event.date.split("T")[0]}T${event.time || "00:00"}`);
  const endDate = (event.endDate || event.date).split("T")[0];
  const end = new Date(`${endDate}T${event.endTime || event.time || "01:00"}`);
  const now = new Date();

  if (now < start) return "Upcoming";
  if (now <= end) return "Ongoing";
  return "Completed";
};

export const formatEventDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not set";

export const formatEventTime = (time) => {
  if (!time) return "Not set";
  const [hours, minutes] = time.split(":");
  const value = new Date(2000, 0, 1, Number(hours), Number(minutes));
  return value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export const formatEventDateTime = (event) => ({
  startDate: formatEventDate(event.date),
  endDate: formatEventDate(event.endDate || event.date),
  startTime: formatEventTime(event.time),
  endTime: formatEventTime(event.endTime || event.time),
});

export const statusClasses = {
  Upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Ongoing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};
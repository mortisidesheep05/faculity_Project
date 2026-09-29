import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../lib/axios";
import { formatEventDateTime, getEventStatus, statusClasses } from "../lib/eventUtils";

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/events"),
        ]);
        setStats(statsRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 dark:text-white animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const renderStatCard = (title, value, icon, color) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4`}
    >
      <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome, {user.email === "jipsa@college.edu" ? "Ms. Jipsa Kurian" : user.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Here is what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderStatCard(
          "Total Events",
          stats?.totalEvents || 0,
          <Calendar size={24} />,
          "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        )}
        {renderStatCard(
          "Pending",
          stats?.pendingCount || 0,
          <Clock size={24} />,
          "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        )}
        {renderStatCard(
          "Approved",
          stats?.approvedCount || 0,
          <CheckCircle size={24} />,
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        )}
        {renderStatCard(
          "Rejected",
          stats?.rejectedCount || 0,
          <XCircle size={24} />,
          "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        )}
      </div>

      {user.role === "Faculty" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user.responsibilities?.map((resp, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                onClick={() =>
                  navigate("/events/new", { state: { responsibility: resp } })
                }
                className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white cursor-pointer shadow-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:scale-110 transition-transform">
                  <Calendar size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">{resp}</h3>
                <p className="text-indigo-100 text-sm flex items-center gap-1">
                  <Plus size={16} /> Create Event
                </p>
              </motion.div>
            ))}
            {(!user.responsibilities || user.responsibilities.length === 0) && (
              <p className="text-slate-500">
                No responsibilities assigned yet.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Recent Events
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Event Title
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Responsibility
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Date
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Time
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Mentors / Speakers
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 5).map((event) => (
                <tr
                  key={event._id}
                  onClick={() => navigate(`/events/${event._id}`)}
                  className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 text-slate-900 dark:text-slate-100 font-medium">
                    {event.title}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    {event.responsibility}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    {formatEventDateTime(event).startDate}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    {formatEventDateTime(event).startTime} - {formatEventDateTime(event).endTime}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">
                    {event.guests?.length || (event.guestName ? 1 : 0)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[getEventStatus(event)]}`}>
                        {getEventStatus(event)}
                      </span>
                      {getEventStatus(event) === "Completed" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event._id}`);
                          }}
                          className="text-[11px] text-green-600 dark:text-green-400 hover:underline"
                        >
                          {event.completion ? "View Event Details" : "Add Event Details"}
                        </button>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${event.status.includes("Pending") ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : ""}
                        ${event.status === "Approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
                        ${event.status === "Rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : ""}
                      `}
                      >
                        {event.status}
                      </span>
                      {event.approvalHistory &&
                        event.approvalHistory.some(
                          (h) => h.status === "Approved",
                        ) && (
                          <div
                            className="text-[11px] text-slate-500 mt-1 max-w-[200px] truncate"
                            title={`Approved by: ${event.approvalHistory
                              .filter((h) => h.status === "Approved")
                              .map((h) => h.approvedBy?.name || h.role)
                              .join(", ")}`}
                          >
                            <span className="font-medium">Approved by:</span>{" "}
                            {event.approvalHistory
                              .filter((h) => h.status === "Approved")
                              .map((h) => h.approvedBy?.name || h.role)
                              .join(", ")}
                          </div>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";
import html2pdf from "html2pdf.js";
import { formatEventDateTime, getEventStatus, statusClasses } from "../lib/eventUtils";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completion, setCompletion] = useState({
    registeredStudents: 0,
    participatedStudents: 0,
    attendedStudents: 0,
    attendedGuests: 0,
    results: [],
    summary: "",
    activities: "",
    achievements: "",
    feedback: "",
    notes: "",
    outcome: "",
    guestAttendance: [],
  });
  const fileInputRef = useRef(null);

  // Helper functions to get approval history
  const getApproval = (role) =>
    event?.approvalHistory?.find(
      (a) => a.role === role && a.status === "Approved",
    );
  const hodApproval = getApproval("HOD");
  const principalApproval = getApproval("Principal");
  const directorApproval = getApproval("Director");

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
      setCompletion((current) => ({
        ...current,
        ...(res.data.completion || {}),
        guestAttendance:
          res.data.completion?.guestAttendance ||
          (res.data.guests || []).map((guest) => ({
            guestId: guest._id,
            name: guest.name,
            type: guest.type || guest.designation || "Mentor / Speaker",
            attended: false,
          })),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("event-pdf-content");
    const opt = {
      margin: 0.4,
      filename: `${event.title || "Event"}_Details.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleDownloadFinalPDF = () => {
    const element = document.getElementById("final-approval-pdf-content");
    const opt = {
      margin: 0.4,
      filename: `${event.title || "Event"}_Final_Approval.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleAction = async (status) => {
    try {
      await api.put(`/events/${id}/status`, { status, remarks });
      fetchEvent();
      setRemarks("");
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/events/${id}`);
        navigate("/");
      } catch (err) {
        alert("Failed to delete event");
      }
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await api.post("/uploads", formData);
      const category = "photos";

      await api.post(`/events/${id}/documents`, {
        category,
        files: [
          {
            name: uploadRes.data.name,
            url: uploadRes.data.url,
            type: uploadRes.data.type,
            size: uploadRes.data.size,
          },
        ],
      });
      fetchEvent();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      if (err.response?.status === 401) {
        alert("Your session expired. Please log in again.");
        navigate("/login");
      } else {
        alert(err.response?.data?.message || "Upload failed");
      }
    }
  };

  const updateCompletion = (field, value) =>
    setCompletion((current) => ({ ...current, [field]: value }));

  const saveCompletion = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/events/${id}/completion`, completion);
      setEvent(response.data);
      setShowCompletionForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save completion details");
    }
  };

  if (loading || !event) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-end gap-3 mb-2">
        {user.role === "Faculty" && event.status === "Approved" && (
          <button
            onClick={handleDownloadFinalPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            <CheckCircle size={18} />
            Approval Certificate
          </button>
        )}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
              <span>{event.responsibility}</span>
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <span className="font-semibold">{event.createdBy.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"></span>
                <span className="font-medium">
                  {event.createdBy.department} Dept.
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "Faculty" && (
              <>
                {event.status === "Draft" && (
                  <>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to submit this draft for approval?",
                          )
                        ) {
                          try {
                            await api.put(`/events/${id}`, {
                              status: "Submitted",
                            });
                            navigate("/dashboard");
                          } catch (err) {
                            if (
                              err.response?.data?.message?.includes(
                                "validation failed",
                              )
                            ) {
                              alert(
                                'Cannot submit draft yet. Please click "Edit Draft" to fill in all required fields first.',
                              );
                            } else {
                              alert(
                                err.response?.data?.message ||
                                  "Failed to submit draft",
                              );
                            }
                          }
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      Submit Event
                    </button>
                    <button
                      onClick={() => navigate(`/events/edit/${id}`)}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      Edit Draft
                    </button>
                  </>
                )}
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Delete Event
                </button>
                {getEventStatus(event) === "Completed" && (
                  <button
                    onClick={() => setShowCompletionForm(true)}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    + Add Event Details
                  </button>
                )}
              </>
            )}
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {event.status}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusClasses[getEventStatus(event)]}`}>
              {getEventStatus(event)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
            <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">
              Venue
            </span>
            <span className="font-medium dark:text-slate-200">
              {event.venue}
            </span>{" "}
            {event.room && (
              <span className="text-xs">
                ({event.building}, Room {event.room})
              </span>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
            <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">
              Date & Time
            </span>
            <span className="font-medium dark:text-slate-200">
              {formatEventDateTime(event).startDate}
            </span>{" "}
            <span className="block text-xs mt-1">
              {formatEventDateTime(event).startTime} - {formatEventDateTime(event).endTime}
            </span>
            {event.endDate && event.endDate.split("T")[0] !== event.date.split("T")[0] && (
              <span className="block text-xs mt-1">Ends {formatEventDateTime(event).endDate}</span>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
            <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">
              Coordinator
            </span>
            <span className="font-medium dark:text-slate-200">
              {event.coordinator}
            </span>{" "}
            {event.coCoordinator && (
              <span className="text-xs text-slate-400 block mt-0.5">
                & {event.coCoordinator}
              </span>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
            <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">
              Budget & Sponsorship
            </span>
            <span className="font-medium dark:text-slate-200">
              ₹{event.budget}
            </span>{" "}
            {event.sponsorAmount ? (
              <span className="text-xs text-green-600 block mt-0.5">
                + ₹{event.sponsorAmount} Sponsor
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audience & Registration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Audience & Registration
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">
                    Target Audience
                  </span>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {event.targetAudience}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">
                    Eligibility
                  </span>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {event.eligibility}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">
                    Participants Expected
                  </span>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {event.participants}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">
                    Max Capacity
                  </span>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {event.maxCapacity || "Unlimited"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">
                    Registration Fee
                  </span>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {event.regFee ? `₹${event.regFee}` : "Free"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">
                    Certificate
                  </span>{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {event.certAvailable}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Guest / Speaker Details
              </h3>
              {(event.guests?.length || event.guestName) ? (
                <div className="text-sm space-y-3">
                  {(event.guests?.length ? event.guests : [{
                    name: event.guestName,
                    designation: "Mentor / Speaker",
                    type: "Mentor / Speaker",
                    organization: event.guestOrg,
                    email: event.guestEmail,
                    linkedIn: event.guestLinkedIn,
                  }]).map((guest, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                      <div className="flex justify-between gap-3">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{guest.name}</span>
                        <span className="text-xs text-primary">{guest.type || guest.designation || "Mentor / Speaker"}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{guest.designation || "Mentor / Speaker"}{guest.organization ? ` · ${guest.organization}` : ""}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No external guests specified.
                </p>
              )}
            </div>
          </div>

          {event.tags && (
            <div className="pt-2">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                Tags
              </h3>
              <div className="flex gap-2 flex-wrap">
                {event.tags.split(",").map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {event.completion && !showCompletionForm && (
          <section id="saved-event-details" className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Event Completion Details</h2>
              {user.role === "Faculty" && getEventStatus(event) === "Completed" && <button type="button" onClick={() => setShowCompletionForm(true)} className="text-sm font-semibold text-primary">Edit Details</button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div><span className="block text-xs text-slate-400">Registered</span>{event.completion.registeredStudents || 0}</div>
              <div><span className="block text-xs text-slate-400">Attended</span>{event.completion.attendedStudents || 0}</div>
              <div><span className="block text-xs text-slate-400">Absent</span>{event.completion.absentStudents || 0}</div>
              <div><span className="block text-xs text-slate-400">Guests Attended</span>{event.completion.attendedGuests || 0}</div>
            </div>
            {(event.completion.summary || event.completion.outcome || event.completion.achievements) && <p className="text-sm text-slate-600 dark:text-slate-300">{event.completion.summary || event.completion.outcome || event.completion.achievements}</p>}
          </section>
        )}

        {user.role === "Faculty" && getEventStatus(event) === "Completed" && showCompletionForm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 sm:p-8 overflow-y-auto" data-html2canvas-ignore>
          <form onSubmit={saveCompletion} id="completion-details" className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-slate-900 dark:text-white">Add Event Details</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Record participation, outcomes, and completion notes.</p>
              </div><button type="button" onClick={() => setShowCompletionForm(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white" aria-label="Close event details"><XCircle size={20} /></button></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
              <div><span className="block text-xs text-slate-400">Event Name</span>{event.title}</div><div><span className="block text-xs text-slate-400">Event Status</span>{getEventStatus(event)}</div>
              <div><span className="block text-xs text-slate-400">Event Date</span>{formatEventDateTime(event).startDate}</div><div><span className="block text-xs text-slate-400">Venue</span>{event.venue}</div>
              <div><span className="block text-xs text-slate-400">Time</span>{formatEventDateTime(event).startTime} - {formatEventDateTime(event).endTime}</div><div><span className="block text-xs text-slate-400">Description</span>{event.description}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {["registeredStudents", "participatedStudents", "attendedStudents", "attendedGuests"].map((field) => (
                <label key={field} className="text-sm text-slate-600 dark:text-slate-300">
                  {field === "registeredStudents" ? "Registered Students" : field === "participatedStudents" ? "Participated Students" : field === "attendedStudents" ? "Students Attended" : "Guests Attended"}
                  <input type="number" min="0" value={completion[field] || 0} onChange={(e) => updateCompletion(field, e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                </label>
              ))}
              <div className="text-sm text-slate-600 dark:text-slate-300">Students Absent<input readOnly value={Math.max((Number(completion.registeredStudents) || 0) - (Number(completion.attendedStudents) || 0), 0)} className="mt-2 w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" /></div>
            </div>
            <div className="space-y-3"><h3 className="font-semibold text-slate-900 dark:text-white">Guest / Mentor / Speaker Attendance</h3>{(completion.guestAttendance || []).length === 0 ? <p className="text-sm text-slate-500">No mentors or speakers were added.</p> : completion.guestAttendance.map((guest, index) => <label key={guest.guestId || index} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-sm text-slate-700 dark:text-slate-200"><span>{guest.name} <span className="text-slate-400">- {guest.type}</span></span><span className="flex items-center gap-2"><input type="checkbox" checked={Boolean(guest.attended)} onChange={(e) => { const guests = [...completion.guestAttendance]; guests[index] = { ...guest, attended: e.target.checked }; updateCompletion("guestAttendance", guests); }} /> Attended</span></label>)}</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900 dark:text-white">Event Outcomes / Results</h3><button type="button" onClick={() => updateCompletion("results", [...(completion.results || []), { position: "1st Prize", winner: "" }])} className="text-sm font-semibold text-primary">+ Add Result</button></div>
              {(completion.results || []).map((result, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3">
                  <select value={result.position} onChange={(e) => { const results = [...completion.results]; results[index] = { ...result, position: e.target.value }; updateCompletion("results", results); }} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"><option>1st Prize</option><option>2nd Prize</option><option>3rd Prize</option><option>Special Mention</option><option>Other</option></select>
                  <input value={result.winner} onChange={(e) => { const results = [...completion.results]; results[index] = { ...result, winner: e.target.value }; updateCompletion("results", results); }} placeholder="Student / Team Name" className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" />
                  <button type="button" onClick={() => updateCompletion("results", completion.results.filter((_, resultIndex) => resultIndex !== index))} className="p-3 text-red-500" aria-label="Remove result"><XCircle size={18} /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {["summary", "activities", "achievements", "feedback", "notes"].map((field) => (
                <label key={field} className="text-sm text-slate-600 dark:text-slate-300">{field === "summary" ? "Event Summary" : field === "activities" ? "Activities Conducted" : field === "achievements" ? "Achievements" : field === "feedback" ? "Feedback / Remarks" : "Completion Notes"}<textarea rows="3" value={completion[field] || ""} onChange={(e) => updateCompletion(field, e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" /></label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><label className="text-sm text-slate-600 dark:text-slate-300">Event Outcome<textarea rows="3" value={completion.outcome || ""} onChange={(e) => updateCompletion("outcome", e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" /></label><label className="text-sm text-slate-600 dark:text-slate-300">Additional Remarks<textarea rows="3" value={completion.notes || ""} onChange={(e) => updateCompletion("notes", e.target.value)} className="mt-2 w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" /></label></div>
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Upload Documents / Photos</h3>
                <p className="text-xs text-slate-500 mt-1">Event photos, attendance sheet, report, certificates, result sheet, or other files.</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap"><Upload size={16} className="inline mr-2" />Upload</button>
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowCompletionForm(false)} className="px-5 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300">Cancel</button><button type="submit" className="px-5 py-3 bg-primary text-white rounded-xl font-semibold">Save Completion Details</button></div>
          </form>
          </div>
        )}

        {/* Faculty Action Panel for Returned Events */}
        {user.role === "Faculty" && event.status === "Returned" && (
          <div
            data-html2canvas-ignore
            className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-700/50 flex items-center justify-between mb-8"
          >
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                Event Returned for Changes
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Please edit the event details and resubmit.
              </p>
            </div>
            <button
              onClick={() => navigate(`/events/edit/${id}`)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Edit & Resubmit
            </button>
          </div>
        )}

        {/* Action Panel for Approvers */}
        {((user.role === "HOD" && event.status === "Pending HOD") ||
          (user.role === "Principal" && event.status === "Pending Principal") ||
          (user.role === "Director" &&
            event.status === "Pending Director")) && (
          <div
            data-html2canvas-ignore
            className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Approval Action
            </h3>
            <textarea
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-slate-900 dark:text-slate-100 outline-none"
              placeholder="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleAction("Approved")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <CheckCircle size={18} /> Approve
              </button>
              <button
                onClick={() => handleAction("Returned")}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2"
              >
                <Clock size={18} /> Return for Changes
              </button>
              <button
                onClick={() => handleAction("Rejected")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <XCircle size={18} /> Reject
              </button>
            </div>
          </div>
        )}

        {/* Documentation Upload (Faculty only, after approval) */}
        {user.role === "Faculty" && event.status === "Approved" && (
          <div
            data-html2canvas-ignore
            className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {getEventStatus(event) === "Completed" ? "Completion Proof / Files" : "Post-Event Documentation"}
            </h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-2"
            >
              <Upload size={18} /> Upload Document
            </button>

            <div className="mt-6 space-y-4">
              {Object.entries(event.documentation || {}).map(
                ([category, files]) => {
                  if (!files || files.length === 0) return null;
                  return (
                    <div key={category}>
                      <h4 className="capitalize font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {category}
                      </h4>
                      <ul className="space-y-2">
                        {files.map((file, idx) => (
                          <li
                            key={idx}
                            className="text-primary hover:underline"
                          >
                            <a
                              href={file.url.startsWith("http") ? file.url : file.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Approval Timeline
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Submitted by {event.createdBy.name}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {["HOD", "Principal", "Director"].map((role, idx) => {
            const history = event.approvalHistory.find((h) => h.role === role);
            const isRejected = event.status === "Rejected";
            const isPending = event.status === `Pending ${role}`;

            if (history) {
              return (
                <div key={idx} className="flex gap-4 items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      history.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {history.status === "Approved" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {history.status} by {history.role} (
                      {history.approvedBy?.name || history.role})
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(history.approvedAt).toLocaleString()}
                    </p>
                    {history.remarks && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">
                        "{history.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            if (isRejected) return null;

            return (
              <div key={idx} className="flex gap-4 items-start opacity-70">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPending
                      ? "bg-orange-100 text-orange-600"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                  }`}
                >
                  {isPending ? (
                    <Clock size={16} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${isPending ? "text-orange-600 dark:text-orange-400" : "text-slate-500"}`}
                  >
                    {isPending
                      ? `Pending ${role} Approval`
                      : `Awaiting ${role}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden PDF Template */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div
            id="event-pdf-content"
            style={{
              width: "720px",
              padding: "10px",
              backgroundColor: "#fff",
              color: "#000",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                fontSize: "22px",
                fontWeight: "bold",
                textTransform: "uppercase",
                marginBottom: "20px",
                borderBottom: "2px solid #000",
                paddingBottom: "10px",
              }}
            >
              Event Proposal Form
            </h1>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "30px",
                fontSize: "13px",
                tableLayout: "fixed",
                wordWrap: "break-word",
              }}
            >
              <tbody>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      width: "20%",
                      textAlign: "left",
                    }}
                  >
                    Event Title
                  </th>
                  <td
                    colSpan="3"
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {event.title}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      width: "20%",
                      textAlign: "left",
                    }}
                  >
                    Category
                  </th>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      width: "30%",
                    }}
                  >
                    {event.category}
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      width: "20%",
                      textAlign: "left",
                    }}
                  >
                    Responsibility
                  </th>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      width: "30%",
                    }}
                  >
                    {event.responsibility}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Date & Time
                  </th>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {new Date(event.date).toLocaleDateString()}{" "}
                    {event.endDate
                      ? ` - ${new Date(event.endDate).toLocaleDateString()}`
                      : ""}{" "}
                    <br />
                    {event.time} {event.endTime ? ` - ${event.endTime}` : ""}
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Venue
                  </th>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {event.venue}{" "}
                    {event.room
                      ? `(${event.building}, Room ${event.room})`
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Coordinator(s)
                  </th>
                  <td
                    colSpan="3"
                    style={{ border: "1px solid #000", padding: "8px" }}
                  >
                    {event.coordinator}{" "}
                    {event.coCoordinator ? `& ${event.coCoordinator}` : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Target Audience
                  </th>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {event.targetAudience}
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Participants
                  </th>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    Expected: {event.participants}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Budget
                  </th>
                  <td
                    colSpan="3"
                    style={{ border: "1px solid #000", padding: "8px" }}
                  >
                    ₹{event.budget}{" "}
                    {event.sponsorAmount
                      ? `(+ ₹${event.sponsorAmount} Sponsor)`
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Guest Speaker
                  </th>
                  <td
                    colSpan="3"
                    style={{ border: "1px solid #000", padding: "8px" }}
                  >
                    {event.guestName
                      ? `${event.guestName} (${event.guestOrg || "N/A"})`
                      : "None"}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                      verticalAlign: "top",
                    }}
                  >
                    Description
                  </th>
                  <td
                    colSpan="3"
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      whiteSpace: "pre-wrap",
                      height: "350px",
                      verticalAlign: "top",
                    }}
                  >
                    {event.description}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Submitted By
                  </th>
                  <td style={{ border: "1px solid #000", padding: "12px" }}>
                    {event.createdBy.name} ({event.createdBy.department} Dept.)
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Status
                  </th>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {event.status}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                marginTop: "40px",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <div style={{ textAlign: "center", width: "25%" }}>
                <div
                  style={{
                    width: "100%",
                    marginBottom: "5px",
                    height: "50px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontStyle: "italic",
                      color: "#555",
                      fontSize: "11px",
                      marginBottom: "5px",
                    }}
                  >
                    Submitted digitally
                  </span>
                  <div
                    style={{ width: "100%", borderBottom: "1px solid #000" }}
                  ></div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Faculty Signature
                </div>
              </div>

              <div style={{ textAlign: "center", width: "25%" }}>
                {hodApproval ? (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      Approved Digitally
                    </span>
                    <span style={{ fontSize: "11px", color: "#4b5563" }}>
                      {hodApproval.approvedBy?.name || "HOD"}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        marginBottom: "5px",
                      }}
                    >
                      {new Date(hodApproval.approvedAt).toLocaleDateString()}
                    </span>
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                )}
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  HOD Signature
                </div>
              </div>

              <div style={{ textAlign: "center", width: "25%" }}>
                {principalApproval ? (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      Approved Digitally
                    </span>
                    <span style={{ fontSize: "11px", color: "#4b5563" }}>
                      {principalApproval.approvedBy?.name || "Principal"}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        marginBottom: "5px",
                      }}
                    >
                      {new Date(
                        principalApproval.approvedAt,
                      ).toLocaleDateString()}
                    </span>
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                )}
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Principal Signature
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Final Approval PDF Template */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div
            id="final-approval-pdf-content"
            style={{
              width: "720px",
              padding: "10px",
              backgroundColor: "#fff",
              color: "#000",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "25px",
                padding: "15px",
                border: "2px solid #16a34a",
                borderRadius: "8px",
                backgroundColor: "#f0fdf4",
              }}
            >
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#16a34a",
                  textTransform: "uppercase",
                  margin: "0 0 5px 0",
                }}
              >
                Event Successfully Approved
              </h1>
              <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>
                This document certifies that the following event proposal has
                completed all required administrative approvals.
              </p>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "30px",
                fontSize: "13px",
                tableLayout: "fixed",
                wordWrap: "break-word",
              }}
            >
              <tbody>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      width: "20%",
                      textAlign: "left",
                    }}
                  >
                    Event Title
                  </th>
                  <td
                    colSpan="3"
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {event.title}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      width: "20%",
                      textAlign: "left",
                    }}
                  >
                    Category
                  </th>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      width: "30%",
                    }}
                  >
                    {event.category}
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      width: "20%",
                      textAlign: "left",
                    }}
                  >
                    Responsibility
                  </th>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      width: "30%",
                    }}
                  >
                    {event.responsibility}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Date & Time
                  </th>
                  <td style={{ border: "1px solid #000", padding: "12px" }}>
                    {new Date(event.date).toLocaleDateString()}{" "}
                    {event.endDate
                      ? ` - ${new Date(event.endDate).toLocaleDateString()}`
                      : ""}{" "}
                    <br />
                    {event.time} {event.endTime ? ` - ${event.endTime}` : ""}
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Venue
                  </th>
                  <td style={{ border: "1px solid #000", padding: "12px" }}>
                    {event.venue}{" "}
                    {event.room
                      ? `(${event.building}, Room ${event.room})`
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Coordinator(s)
                  </th>
                  <td
                    colSpan="3"
                    style={{ border: "1px solid #000", padding: "12px" }}
                  >
                    {event.coordinator}{" "}
                    {event.coCoordinator ? `& ${event.coCoordinator}` : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Target Audience
                  </th>
                  <td style={{ border: "1px solid #000", padding: "12px" }}>
                    {event.targetAudience}
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Participants
                  </th>
                  <td style={{ border: "1px solid #000", padding: "12px" }}>
                    Expected: {event.participants}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Budget
                  </th>
                  <td
                    colSpan="3"
                    style={{ border: "1px solid #000", padding: "12px" }}
                  >
                    ₹{event.budget}{" "}
                    {event.sponsorAmount
                      ? `(+ ₹${event.sponsorAmount} Sponsor)`
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Guest Speaker
                  </th>
                  <td
                    colSpan="3"
                    style={{ border: "1px solid #000", padding: "8px" }}
                  >
                    {event.guestName
                      ? `${event.guestName} (${event.guestOrg || "N/A"})`
                      : "None"}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                      verticalAlign: "top",
                    }}
                  >
                    Description
                  </th>
                  <td
                    colSpan="3"
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      whiteSpace: "pre-wrap",
                      height: "250px",
                      verticalAlign: "top",
                    }}
                  >
                    {event.description}
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Submitted By
                  </th>
                  <td style={{ border: "1px solid #000", padding: "12px" }}>
                    {event.createdBy.name} ({event.createdBy.department} Dept.)
                  </td>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      backgroundColor: "#f3f4f6",
                      textAlign: "left",
                    }}
                  >
                    Status
                  </th>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "12px",
                      fontWeight: "bold",
                      color: "#16a34a",
                    }}
                  >
                    FULLY APPROVED
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <div style={{ textAlign: "center", width: "25%" }}>
                <div
                  style={{
                    width: "100%",
                    marginBottom: "5px",
                    height: "50px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontStyle: "italic",
                      color: "#555",
                      fontSize: "11px",
                      marginBottom: "5px",
                    }}
                  >
                    Submitted digitally
                  </span>
                  <div
                    style={{ width: "100%", borderBottom: "1px solid #000" }}
                  ></div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Faculty Signature
                </div>
              </div>

              <div style={{ textAlign: "center", width: "25%" }}>
                {hodApproval ? (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      Approved Digitally
                    </span>
                    <span style={{ fontSize: "11px", color: "#4b5563" }}>
                      {hodApproval.approvedBy?.name || "HOD"}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        marginBottom: "5px",
                      }}
                    >
                      {new Date(hodApproval.approvedAt).toLocaleDateString()}
                    </span>
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                )}
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  HOD Signature
                </div>
              </div>

              <div style={{ textAlign: "center", width: "25%" }}>
                {principalApproval ? (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      Approved Digitally
                    </span>
                    <span style={{ fontSize: "11px", color: "#4b5563" }}>
                      {principalApproval.approvedBy?.name || "Principal"}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        marginBottom: "5px",
                      }}
                    >
                      {new Date(
                        principalApproval.approvedAt,
                      ).toLocaleDateString()}
                    </span>
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                )}
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Principal Signature
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                padding: "0 20px",
              }}
            >
              <div style={{ textAlign: "center", width: "30%" }}>
                {directorApproval ? (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                    >
                      Approved Digitally
                    </span>
                    <span style={{ fontSize: "11px", color: "#4b5563" }}>
                      {directorApproval.approvedBy?.name || "Director"}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        marginBottom: "5px",
                      }}
                    >
                      {new Date(
                        directorApproval.approvedAt,
                      ).toLocaleDateString()}
                    </span>
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "5px",
                      height: "50px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{ width: "100%", borderBottom: "1px solid #000" }}
                    ></div>
                  </div>
                )}
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Director Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

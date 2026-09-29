import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Send } from "lucide-react";
import api from "../lib/axios";

import LiveSummary from "../components/event-form/LiveSummary";
import {
  BasicInfoSection,
  DateTimeSection,
  LocationSection,
  OrganizersSection,
  ParticipantsSection,
  BudgetSection,
  DetailsSection,
  DocumentsSection,
} from "../components/event-form/FormSections";

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultResponsibility = location.state?.responsibility || "";

  const [formData, setFormData] = useState({
    // Core Schema Fields
    title: "",
    category: "",
    responsibility: defaultResponsibility,
    description: "",
    date: "",
    time: "",
    venue: "",
    participants: "",
    budget: "",
    coordinator: "",
    objectives: "",
    requirements: "",

    // Extended UI Fields (Will be packaged into requirements)
    priority: "Medium",
    localStatus: "Planning",
    endDate: "",
    endTime: "",
    building: "",
    floor: "",
    room: "",
    mapsLink: "",
    venueType: "Indoor",
    coCoordinator: "",
    orgDepartment: "CSE",
    guestName: "",
    guestOrg: "",
    guestEmail: "",
    guestLinkedIn: "",
    maxCapacity: "",
    targetAudience: "Students",
    eligibility: "Open For Everyone",
    regRequired: "Yes",
    certAvailable: "Yes",
    regFee: "",
    sponsorAmount: "",
    tags: "",
    attachments: [],
    guests: [],
  });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const res = await api.get(`/events/${id}`);
          const event = res.data;

          setFormData({
            title: event.title || "",
            category: event.category || "",
            responsibility: event.responsibility || defaultResponsibility,
            description: event.description || "",
            date: event.date ? event.date.split("T")[0] : "",
            time: event.time || "",
            venue: event.venue || "",
            participants: event.participants || "",
            budget: event.budget || "",
            coordinator: event.coordinator || "",
            objectives: event.objectives || "",
            requirements: event.requirements || "",

            // Extended UI Fields
            priority: event.priority || "Medium",
            localStatus: event.status || "Planning",
            endDate: event.endDate ? event.endDate.split("T")[0] : "",
            endTime: event.endTime || "",
            building: event.building || "",
            floor: event.floor || "",
            room: event.room || "",
            mapsLink: event.mapsLink || "",
            venueType: event.venueType || "Indoor",
            coCoordinator: event.coCoordinator || "",
            orgDepartment: event.orgDepartment || "CSE",
            guestName: event.guestName || "",
            guestOrg: event.guestOrg || "",
            guestEmail: event.guestEmail || "",
            guestLinkedIn: event.guestLinkedIn || "",
            maxCapacity: event.maxCapacity || "",
            targetAudience: event.targetAudience || "Students",
            eligibility: event.eligibility || "Open For Everyone",
            regRequired: event.regRequired || "Yes",
            certAvailable: event.certAvailable || "Yes",
            regFee: event.regFee || "",
            sponsorAmount: event.sponsorAmount || "",
            tags: event.tags || "",
            attachments: event.attachments || [],
            guests: event.guests?.length
              ? event.guests
              : event.guestName
                ? [{
                    name: event.guestName,
                    designation: "Mentor / Speaker",
                    type: "Mentor / Speaker",
                    organization: event.guestOrg || "",
                    email: event.guestEmail || "",
                    linkedIn: event.guestLinkedIn || "",
                  }]
                : [],
          });
        } catch (err) {
          console.error(err);
          alert("Failed to load event data for editing.");
        }
      };
      fetchEvent();
    }
  }, [id, defaultResponsibility]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      status: formData.localStatus, // Remap localStatus back to status for the backend (if they wanted to save it, although backend overwrites with Pending HOD initially anyway)
    };

    try {
      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      // Wait a tiny bit for the confetti effect to show (UX)
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);

    const payload = {
      ...formData,
      status: "Draft",
    };

    try {
      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error(err);
      alert("Failed to save draft");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-20">
      {/* Header Area */}
      <div className="mb-10 mt-4 border-b border-slate-200 dark:border-white/10 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 text-sm font-medium tracking-wide"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            {id ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            {id
              ? "Update your event details and resubmit."
              : "Plan and organize your college event professionally using the enterprise dashboard."}
          </p>
        </motion.div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8"
      >
        {/* Left Side: Form Sections */}
        <div className="space-y-6">
          <BasicInfoSection data={formData} handleChange={handleChange} />
          <DateTimeSection data={formData} handleChange={handleChange} />
          <LocationSection data={formData} handleChange={handleChange} />
          <OrganizersSection
            data={{ ...formData, setFormData }}
            handleChange={handleChange}
          />
          <ParticipantsSection data={formData} handleChange={handleChange} />
          <BudgetSection data={formData} handleChange={handleChange} />
          <DetailsSection data={formData} handleChange={handleChange} />
          <DocumentsSection data={formData} setFormData={setFormData} />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 dark:text-white dark:border-white/10 dark:hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} /> {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {loading
                ? id
                  ? "Updating..."
                  : "Submitting..."
                : id
                  ? "Update & Resubmit"
                  : "Submit Event"}
            </button>
          </div>
        </div>

        {/* Right Side: Sticky Live Summary */}
        <div className="hidden xl:block">
          <LiveSummary data={formData} />
        </div>
      </form>
    </div>
  );
}

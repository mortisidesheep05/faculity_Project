import React, { useState } from "react";
import {
  Info,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckSquare,
  List,
  UserPlus,
  Image as ImageIcon,
  Bell,
  Clock,
  Hash,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import CollapsibleSection from "../ui/CollapsibleSection";
import PremiumInput from "../ui/PremiumInput";
import PremiumSelect from "../ui/PremiumSelect";
import PremiumTextarea from "../ui/PremiumTextarea";

// Section 1: Basic Info
export function BasicInfoSection({ data, handleChange }) {
  const categories = [
    "Technical Event",
    "Workshop",
    "Seminar",
    "Conference",
    "Hackathon",
    "Placement Drive",
    "Sports",
    "Cultural Fest",
    "Industrial Visit",
    "Webinar",
    "Competition",
    "Club Activity",
    "Orientation",
    "Alumni Meet",
    "Faculty Development Program",
    "Community Outreach",
    "Other",
  ];

  return (
    <CollapsibleSection
      title="Event Information"
      icon={Info}
      defaultOpen={true}
      badge="Required"
    >
      <div className="space-y-5">
        <PremiumInput
          label="Event Name *"
          name="title"
          value={data.title}
          onChange={handleChange}
          placeholder="e.g. IEEE National Workshop on Artificial Intelligence"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PremiumInput
            label="Event Code"
            name="eventCode"
            value={`EVT-${new Date().getFullYear()}-001`}
            readOnly
          />
          <PremiumSelect
            label="Category *"
            name="category"
            value={data.category}
            onChange={handleChange}
            options={categories}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PremiumSelect
            label="Priority"
            name="priority"
            value={data.priority || "Medium"}
            onChange={handleChange}
            options={["High", "Medium", "Low"]}
          />
          <PremiumSelect
            label="Status"
            name="localStatus"
            value={data.localStatus || "Planning"}
            onChange={handleChange}
            options={[
              "Planning",
              "Upcoming",
              "Registration Open",
              "Completed",
              "Cancelled",
            ]}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}

// Section 2: Date & Time
export function DateTimeSection({ data, handleChange }) {
  return (
    <CollapsibleSection title="Date & Time" icon={CalendarIcon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PremiumInput
          type="date"
          label="Start Date *"
          name="date"
          value={data.date}
          onChange={handleChange}
          required
        />
        <PremiumInput
          type="date"
          label="End Date"
          name="endDate"
          value={data.endDate || ""}
          onChange={handleChange}
        />
        <PremiumInput
          type="time"
          label="Start Time *"
          name="time"
          value={data.time}
          onChange={handleChange}
          required
        />
        <PremiumInput
          type="time"
          label="End Time"
          name="endTime"
          value={data.endTime || ""}
          onChange={handleChange}
        />
        <PremiumInput
          type="date"
          label="Registration Deadline"
          name="regDeadline"
          value={data.regDeadline || ""}
          onChange={handleChange}
        />
      </div>
    </CollapsibleSection>
  );
}

// Section 3: Location
export function LocationSection({ data, handleChange }) {
  return (
    <CollapsibleSection title="Location Details" icon={MapPin}>
      <div className="space-y-5">
        <PremiumInput
          label="Venue *"
          name="venue"
          value={data.venue}
          onChange={handleChange}
          placeholder="Main Auditorium"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <PremiumInput
            label="Building"
            name="building"
            value={data.building || ""}
            onChange={handleChange}
          />
          <PremiumInput
            label="Floor"
            name="floor"
            value={data.floor || ""}
            onChange={handleChange}
          />
          <PremiumInput
            label="Room Number"
            name="room"
            value={data.room || ""}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PremiumInput
            label="Google Maps Link (Optional)"
            name="mapsLink"
            value={data.mapsLink || ""}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
          />
          <PremiumSelect
            label="Type"
            name="venueType"
            value={data.venueType || "Indoor"}
            onChange={handleChange}
            options={["Indoor", "Outdoor", "Virtual", "Hybrid"]}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}

// Section 4 & 5: Organizers & Guests
export function OrganizersSection({ data, handleChange }) {
  const guests = data.guests?.length ? data.guests : [{ type: "Mentor / Speaker" }];

  const updateGuest = (index, field, value) => {
    const nextGuests = [...guests];
    nextGuests[index] = { ...nextGuests[index], [field]: value };
    data.setFormData({ ...data, guests: nextGuests });
  };

  const addGuest = () =>
    data.setFormData({
      ...data,
      guests: [...guests, { type: "Mentor / Speaker" }],
    });

  const removeGuest = (index) =>
    data.setFormData({
      ...data,
      guests: guests.filter((_, guestIndex) => guestIndex !== index),
    });

  return (
    <CollapsibleSection title="Organizers & Guests" icon={Users}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PremiumInput
            label="Faculty Coordinator *"
            name="coordinator"
            value={data.coordinator}
            onChange={handleChange}
            required
          />
          <PremiumInput
            label="Co-Coordinator"
            name="coCoordinator"
            value={data.coCoordinator || ""}
            onChange={handleChange}
          />
          <PremiumInput
            label="Responsibility Charge *"
            name="responsibility"
            value={data.responsibility}
            onChange={handleChange}
            required
          />
          <PremiumSelect
            label="Department"
            name="orgDepartment"
            value={data.orgDepartment || "CSE"}
            onChange={handleChange}
            options={["CSE", "ECE", "EEE", "ME", "CE", "MBA", "MCA", "BCA"]}
          />
        </div>
        <hr className="border-slate-200 dark:border-white/5" />
        <h4 className="text-slate-700 dark:text-slate-300 font-medium">
          Guest Details
        </h4>
        <div className="space-y-4">
          {guests.map((guest, index) => (
            <div key={index} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Guest {index + 1}</span>
                {guests.length > 1 && (
                  <button type="button" onClick={() => removeGuest(index)} className="text-red-500 hover:text-red-600 p-1" aria-label="Remove guest">
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <PremiumInput label="Name *" value={guest.name || ""} onChange={(e) => updateGuest(index, "name", e.target.value)} placeholder="Name" required={index === 0} />
                <PremiumInput label="Designation / Role" value={guest.designation || ""} onChange={(e) => updateGuest(index, "designation", e.target.value)} placeholder="Mentor / Speaker" />
                <PremiumSelect label="Type" value={guest.type || "Mentor / Speaker"} onChange={(e) => updateGuest(index, "type", e.target.value)} options={["Mentor", "Speaker", "Mentor / Speaker"]} />
                <PremiumInput label="Organization" value={guest.organization || ""} onChange={(e) => updateGuest(index, "organization", e.target.value)} placeholder="Company / University" />
                <PremiumInput label="LinkedIn Profile" value={guest.linkedIn || ""} onChange={(e) => updateGuest(index, "linkedIn", e.target.value)} placeholder="https://linkedin.com/in/..." />
                <PremiumInput label="Contact Email" type="email" value={guest.email || ""} onChange={(e) => updateGuest(index, "email", e.target.value)} placeholder="email@example.com" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addGuest} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
            <Plus size={17} /> Add Mentor / Speaker
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}

// Section 6: Participants
export function ParticipantsSection({ data, handleChange }) {
  return (
    <CollapsibleSection title="Participants & Audience" icon={UserPlus}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PremiumInput
          label="Expected Participants *"
          name="participants"
          type="number"
          value={data.participants}
          onChange={handleChange}
          required
        />
        <PremiumInput
          label="Maximum Capacity"
          name="maxCapacity"
          type="number"
          value={data.maxCapacity || ""}
          onChange={handleChange}
        />
        <PremiumSelect
          label="Target Audience"
          name="targetAudience"
          value={data.targetAudience || "Students"}
          onChange={handleChange}
          options={[
            "Students",
            "Faculty",
            "Alumni",
            "External Participants",
            "Mixed",
          ]}
        />
        <PremiumSelect
          label="Eligibility"
          name="eligibility"
          value={data.eligibility || "Open For Everyone"}
          onChange={handleChange}
          options={[
            "Open For Everyone",
            "Only CSE",
            "Only Final Year",
            "All Departments",
          ]}
        />
        <PremiumSelect
          label="Registration Required?"
          name="regRequired"
          value={data.regRequired || "Yes"}
          onChange={handleChange}
          options={["Yes", "No"]}
        />
        <PremiumSelect
          label="Certificate Available?"
          name="certAvailable"
          value={data.certAvailable || "Yes"}
          onChange={handleChange}
          options={["Yes", "No"]}
        />
      </div>
    </CollapsibleSection>
  );
}

// Section 7: Budget
export function BudgetSection({ data, handleChange }) {
  const budget = parseFloat(data.budget) || 0;
  const regFee = parseFloat(data.regFee) || 0;
  const spon = parseFloat(data.sponsorAmount) || 0;

  return (
    <CollapsibleSection title="Budget & Finance" icon={DollarSign}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <PremiumInput
            label="Total Expected Budget (₹) *"
            name="budget"
            type="number"
            value={data.budget}
            onChange={handleChange}
            required
          />
          <PremiumInput
            label="Registration Fee (₹)"
            name="regFee"
            type="number"
            value={data.regFee || ""}
            onChange={handleChange}
          />
          <PremiumInput
            label="Sponsor Amount (₹)"
            name="sponsorAmount"
            type="number"
            value={data.sponsorAmount || ""}
            onChange={handleChange}
          />
        </div>

        {budget > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Estimated Collection: ₹{regFee * 50 + spon}
              </span>
              <span className="text-primary font-medium">
                Budget: ₹{budget}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: "45%" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

// Section 8 & 9: Description & Requirements
export function DetailsSection({ data, handleChange }) {
  return (
    <CollapsibleSection title="Event Details & Requirements" icon={FileText}>
      <div className="space-y-5">
        <PremiumTextarea
          label="Event Description *"
          name="description"
          value={data.description}
          onChange={handleChange}
          rows={5}
          placeholder="Describe the event..."
          required
        />
        <PremiumTextarea
          label="Objectives"
          name="objectives"
          value={data.objectives}
          onChange={handleChange}
          rows={3}
          placeholder="What are the goals?"
        />
        <PremiumTextarea
          label="Logistics & Requirements"
          name="requirements"
          value={data.requirements}
          onChange={handleChange}
          rows={3}
          placeholder="E.g., Projector, Sound System, 50 Chairs..."
        />
      </div>
    </CollapsibleSection>
  );
}

// Section 10: Documents & Attachments
export function DocumentsSection({ data, setFormData }) {
  const [uploading, setUploading] = React.useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const api = (await import("../../lib/axios")).default;
      const res = await api.post("/uploads", formData);

      const newAttachment = {
        name: res.data.name,
        url: res.data.url,
        type: res.data.type,
        size: res.data.size,
      };

      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment],
      }));
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setFormData((prev) => {
      const newAttachments = [...(prev.attachments || [])];
      newAttachments.splice(index, 1);
      return { ...prev, attachments: newAttachments };
    });
  };

  return (
    <CollapsibleSection
      title="Event Attachments (PDF, Images, Video)"
      icon={Upload}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Upload any supporting documents (Brochure, Poster, Budget PDF, etc.)
        </p>

        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-3 rounded-xl flex items-center gap-2 transition-colors">
            <Upload size={18} />
            <span className="font-medium">
              {uploading ? "Uploading..." : "Upload File"}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {data.attachments && data.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-2"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

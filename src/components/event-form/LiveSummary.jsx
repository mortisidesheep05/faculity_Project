import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Tag,
  CheckCircle,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";

export default function LiveSummary({ data }) {
  const isComplete =
    data.title && data.category && data.date && data.venue && data.budget;

  return (
    <div className="sticky top-24">
      <GlassCard className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-primary/20"></div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full"></span>
          Live Summary
        </h3>

        <div className="space-y-5 relative z-10">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Event Name
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white break-words">
              {data.title || (
                <span className="text-slate-400 dark:text-slate-600 italic">
                  Enter event title...
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
              <Tag size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Category
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.category || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Date & Time
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.date ? new Date(data.date).toLocaleDateString() : "-"}{" "}
                {data.time && `• ${data.time}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Venue
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.venue || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Participants
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {data.participants || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg text-green-500">
              <DollarSign size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Budget
              </p>
              <p className="text-sm font-medium text-green-400">
                {data.budget ? `₹${data.budget}` : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Status
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-full text-xs font-medium border dark:border-slate-700">
              Draft
            </span>
          </div>

          <motion.div
            initial={false}
            animate={{
              height: isComplete ? "auto" : 0,
              opacity: isComplete ? 1 : 0,
            }}
            className="overflow-hidden mt-4"
          >
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Ready to submit!</span>
            </div>
          </motion.div>
        </div>
      </GlassCard>
    </div>
  );
}

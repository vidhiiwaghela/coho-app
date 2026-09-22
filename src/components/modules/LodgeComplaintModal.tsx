"use client";

import React, { useState } from "react";
import { FlatUser, ComplaintTicket } from "../../types";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Zap,
  Volume2,
  Trash2,
  Shield,
  HelpCircle,
} from "lucide-react";

interface LodgeComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FlatUser;
  onSubmitComplaint: (
    complaint: Omit<ComplaintTicket, "id" | "createdAt" | "status">
  ) => void;
}

const CATEGORIES: {
  id: ComplaintTicket["category"];
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "water_supply", label: "Water Supply & Plumbing", icon: Droplets },
  { id: "lift_electrical", label: "Lift & Electrical", icon: Zap },
  { id: "noise_disturbance", label: "Noise & Disturbance", icon: Volume2 },
  { id: "cleanliness", label: "Cleanliness & Sanitation", icon: Trash2 },
  { id: "other", label: "Other Society Issue", icon: HelpCircle },
];

export const LodgeComplaintModal: React.FC<LodgeComplaintModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitComplaint,
}) => {
  const [category, setCategory] = useState<ComplaintTicket["category"]>("water_supply");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const catLabel = CATEGORIES.find((c) => c.id === category)?.label || "General Issue";

    onSubmitComplaint({
      flatId: currentUser.id,
      flatNumber: currentUser.flatNumber,
      residentName: currentUser.residentName,
      category,
      categoryLabel: catLabel,
      description: description.trim(),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription("");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl w-full max-w-md shadow-sm p-6 relative animate-scale-up space-y-5 text-[#F5F1E8]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A6ACC0] hover:text-[#F5F1E8] p-1.5 rounded-full hover:bg-[#1C2740] transition-colors"
          id="btn-close-lodge-complaint"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] border border-[#E8B565]/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F5F1E8]">
              Lodge a Complaint / Ticket
            </h3>
            <p className="text-xs text-[#A6ACC0]">
              Flat {currentUser.flatNumber} • {currentUser.residentName}
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#1C2740] border border-[#E8B565]/40 text-[#F5F1E8] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#F5F1E8]">
              Ticket Registered!
            </h4>
            <p className="text-xs text-[#A6ACC0]">
              Your complaint has been logged and assigned status:{" "}
              <span className="text-[#F5F1E8] font-bold">Pending</span>. The managing committee will inspect promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6ACC0] block">
                Complaint Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#1C2740] border-[#E8B565] text-[#F5F1E8] font-bold shadow-sm"
                          : "bg-[#0E1420]/60 border-[#2B3854] text-[#A6ACC0] hover:bg-[#1C2740]/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#F5F1E8]" : "text-[#A6ACC0]"}`} />
                      <span className="text-xs truncate">{cat.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6ACC0] block">
                Issue Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Explain what is wrong (location, timing, severity)..."
                className="w-full bg-[#0E1420] text-[#F5F1E8] border border-[#2B3854] rounded-xl px-3.5 py-3 text-xs placeholder:text-[#A6ACC0]/50 focus:outline-none focus:border-[#E8B565]"
                id="input-complaint-desc"
              />
            </div>

            <div className="text-[11px] text-[#A6ACC0] bg-[#0E1420]/60 p-3 rounded-xl border border-[#2B3854] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E8B565] shrink-0" />
              <span>
                Ticket progression: <strong>Pending</strong> → <strong>In Progress</strong> → <strong>Resolved</strong>
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-black text-sm py-3.5 rounded-xl shadow-sm transition-all"
                id="btn-submit-complaint"
              >
                Submit Ticket to Society Admin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

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
      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl w-full max-w-md shadow-sm p-6 relative animate-scale-up space-y-5 text-[#F3F5F9]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C97AD] hover:text-[#F3F5F9] p-1.5 rounded-full hover:bg-[#16233A] transition-colors"
          id="btn-close-lodge-complaint"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] border border-[#EFE4CC]/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F3F5F9]">
              Lodge a Complaint / Ticket
            </h3>
            <p className="text-xs text-[#8C97AD]">
              Flat {currentUser.flatNumber} • {currentUser.residentName}
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#16233A] border border-[#EFE4CC]/40 text-[#F3F5F9] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#F3F5F9]">
              Ticket Registered!
            </h4>
            <p className="text-xs text-[#8C97AD]">
              Your complaint has been logged and assigned status:{" "}
              <span className="text-[#F3F5F9] font-bold">Pending</span>. The managing committee will inspect promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
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
                          ? "bg-[#16233A] border-[#EFE4CC] text-[#F3F5F9] font-bold shadow-sm"
                          : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:bg-[#16233A]/40"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#F3F5F9]" : "text-[#8C97AD]"}`} />
                      <span className="text-xs truncate">{cat.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
                Issue Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Explain what is wrong (location, timing, severity)..."
                className="w-full bg-[#0A1120] text-[#F3F5F9] border border-[#22304A] rounded-xl px-3.5 py-3 text-xs placeholder:text-[#8C97AD]/50 focus:outline-none focus:border-[#EFE4CC]"
                id="input-complaint-desc"
              />
            </div>

            <div className="text-[11px] text-[#8C97AD] bg-[#0A1120]/60 p-3 rounded-xl border border-[#22304A] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EFE4CC] shrink-0" />
              <span>
                Ticket progression: <strong>Pending</strong> → <strong>In Progress</strong> → <strong>Resolved</strong>
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-black text-sm py-3.5 rounded-xl shadow-sm transition-all"
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

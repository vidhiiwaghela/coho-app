"use client";

import React, { useState } from "react";
import { FlatUser, FacilityBooking } from "../../types";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";

interface BookFacilityModalProps {
  currentUser: FlatUser;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<FacilityBooking, "id" | "status" | "createdAt">
  ) => void;
}

const FACILITIES: {
  id: "Clubhouse" | "Society Ground" | "Party Hall";
  label: string;
  capacity: string;
  deposit: string;
}[] = [
  {
    id: "Clubhouse",
    label: "Clubhouse & Indoor Lounge",
    capacity: "Up to 50 guests",
    deposit: "₹2,000 Refundable Deposit",
  },
  {
    id: "Society Ground",
    label: "Society Central Ground",
    capacity: "Sports & Community events",
    deposit: "₹1,500 Refundable Deposit",
  },
  {
    id: "Party Hall",
    label: "Banquet / Party Hall",
    capacity: "Up to 100 guests",
    deposit: "₹3,000 Refundable Deposit",
  },
];

const TIME_SLOTS: (
  | "Morning (09:00 AM - 01:00 PM)"
  | "Evening (04:00 PM - 09:00 PM)"
  | "Full Day (09:00 AM - 10:00 PM)"
)[] = [
  "Morning (09:00 AM - 01:00 PM)",
  "Evening (04:00 PM - 09:00 PM)",
  "Full Day (09:00 AM - 10:00 PM)",
];

export const BookFacilityModal: React.FC<BookFacilityModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedFacility, setSelectedFacility] =
    useState<"Clubhouse" | "Society Ground" | "Party Hall">("Clubhouse");
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<
    | "Morning (09:00 AM - 01:00 PM)"
    | "Evening (04:00 PM - 09:00 PM)"
    | "Full Day (09:00 AM - 10:00 PM)"
  >("Evening (04:00 PM - 09:00 PM)");
  const [purpose, setPurpose] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    onSubmit({
      flatId: currentUser.id,
      flatNumber: currentUser.flatNumber,
      residentName: currentUser.residentName,
      facility: selectedFacility,
      date: bookingDate,
      timeSlot: selectedSlot,
      purpose: purpose.trim(),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setPurpose("");
      onClose();
    }, 1200);
  };

  const currentFacilityMeta = FACILITIES.find(
    (f) => f.id === selectedFacility
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#111C2E] border border-[#22304A] rounded-2xl shadow-sm p-6 relative text-[#F3F5F9] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22304A] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F3F5F9]">
                Book Society Facility
              </h3>
              <p className="text-[11px] text-[#8C97AD]">
                Flat {currentUser.flatNumber} • {currentUser.residentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#16233A] border border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#16233A] text-[#F3F5F9] border border-[#EFE4CC]/40 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-[#F3F5F9]">
              Booking Request Submitted!
            </h4>
            <p className="text-xs text-[#8C97AD] max-w-xs mx-auto">
              Your booking for the {selectedFacility} on {bookingDate} has been
              sent to the Managing Committee for approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Facility Choice */}
            <div>
              <label className="text-xs font-semibold text-[#8C97AD] block mb-2">
                Select Facility
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FACILITIES.map((f) => {
                  const isSelected = selectedFacility === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFacility(f.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-[#16233A] border-[#EFE4CC] text-[#F3F5F9] font-bold shadow-sm"
                          : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9]"
                      }`}
                    >
                      <Building className="w-4 h-4 mx-auto mb-1 opacity-80" />
                      <span className="text-xs block truncate leading-tight">
                        {f.id}
                      </span>
                    </button>
                  );
                })}
              </div>
              {currentFacilityMeta && (
                <div className="mt-2 bg-[#0A1120]/60 border border-[#22304A] rounded-xl p-2.5 text-[11px] text-[#8C97AD] flex justify-between items-center">
                  <span>{currentFacilityMeta.capacity}</span>
                  <span className="text-[#F3F5F9] font-semibold">
                    {currentFacilityMeta.deposit}
                  </span>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-xs font-semibold text-[#8C97AD] block mb-1.5">
                Date of Event
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-3 py-2 text-xs text-[#F3F5F9] focus:outline-none focus:border-[#EFE4CC]"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="text-xs font-semibold text-[#8C97AD] block mb-1.5">
                Time Slot
              </label>
              <div className="space-y-1.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full py-2 px-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#16233A] border-[#EFE4CC] text-[#F3F5F9] font-bold shadow-sm"
                          : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="text-xs font-semibold text-[#8C97AD] block mb-1.5">
                Purpose / Gathering Details
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g., Birthday Party, Family Pooja, Society Sports"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl p-3 text-xs text-[#F3F5F9] placeholder-[#8C97AD]/40 focus:outline-none focus:border-[#EFE4CC]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Booking Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

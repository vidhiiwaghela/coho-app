"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SponsorshipCampaign, FlatUser } from "../../types";
import { DarkHeroCard } from "../common/DarkHeroCard";
import { formatINR } from "../../lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  HeartHandshake,
  Trophy,
  Users,
  CheckCircle2,
  Calendar,
  Gift,
  QrCode,
  X,
  MessageSquareQuote,
  Plus,
  AlertCircle,
  CreditCard,
  Lock,
  Loader2,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { openRazorpayCheckout } from "../../lib/razorpay";

const getTierBadgeStyle = (tierName?: string) => {
  if (!tierName) return { color: "#EFE4CC", bg: "bg-[#16233A]", border: "border-[#22304A]" };
  const lower = tierName.toLowerCase();
  if (lower.includes("gold")) {
    return { color: "#F2C14E", bg: "bg-[#16233A]", border: "border-[#F2C14E]/30" };
  }
  if (lower.includes("silver")) {
    return { color: "#B9C2D0", bg: "bg-[#16233A]", border: "border-[#B9C2D0]/30" };
  }
  if (lower.includes("bronze")) {
    return { color: "#C98A5A", bg: "bg-[#16233A]", border: "border-[#C98A5A]/30" };
  }
  return { color: "#EFE4CC", bg: "bg-[#16233A]", border: "border-[#22304A]" };
};

interface SponsorshipViewProps {
  campaigns: SponsorshipCampaign[];
  currentUser: FlatUser;
  onDonate: (
    campaignId: string,
    donation: {
      donorName: string;
      flatNumber: string;
      amount: number;
      tierName?: string;
      message?: string;
      paymentRef?: string;
      paymentMethod?: string;
    }
  ) => void;
  onAddCampaign?: (
    campaign: Omit<SponsorshipCampaign, "id" | "collectedAmount" | "donations"> & { id?: string }
  ) => void;
}

export const SponsorshipView: React.FC<SponsorshipViewProps> = ({
  campaigns,
  currentUser,
  onDonate,
  onAddCampaign,
}) => {
  const isAdmin = currentUser.role === "admin";
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ""
  );

  // Modal & Expandable Description States
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [viewTierModal, setViewTierModal] = useState<{
    name: string;
    amount: number;
    perks: string;
    slotsAvailable: number;
    slotsFilled: number;
  } | null>(null);

  const [pledgeModalOpen, setPledgeModalOpen] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("2000");
  const [donorMessage, setDonorMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");

  // Admin Create Drive Modal State
  const [isCreateDriveModalOpen, setIsCreateDriveModalOpen] = useState<boolean>(false);
  const [driveTitle, setDriveTitle] = useState<string>("");
  const [driveDate, setDriveDate] = useState<string>("");
  const [driveDesc, setDriveDesc] = useState<string>("");
  const [driveGoal, setDriveGoal] = useState<string>("150000");
  const [driveTiers, setDriveTiers] = useState<
    Array<{
      name: string;
      amount: number;
      slotsAvailable: number;
      perks: string;
    }>
  >([
    {
      name: "Grand Festival Patron (Gold)",
      amount: 25000,
      slotsAvailable: 5,
      perks: "VIP front-row seating for all evenings + Special family Maha-Aarti slot + Banner recognition at stage",
    },
    {
      name: "Community Feast Sponsor (Silver)",
      amount: 10000,
      slotsAvailable: 10,
      perks: "Co-host recognition + Name in event program + 10 special prasad hampers",
    },
    {
      name: "Aarti & Decoration Supporter (Bronze)",
      amount: 5000,
      slotsAvailable: 20,
      perks: "Evening Aarti dedicated in your family's name + Floral decoration sponsorship plaque",
    },
  ]);

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCreateDriveModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateDriveModalOpen]);

  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  if (!activeCampaign) return null;

  const percentage = Math.min(
    100,
    Math.round((activeCampaign.collectedAmount / activeCampaign.targetAmount) * 100)
  );

  const handleOpenPledge = (tierName?: string, defaultAmt?: number) => {
    setSelectedTier(tierName || null);
    setValidationError("");
    if (defaultAmt) {
      setCustomAmount(String(defaultAmt));
    } else {
      setCustomAmount("2000");
    }
    setPledgeModalOpen(true);
  };

  const completeDonationSuccess = (amountNum: number, paymentRef: string) => {
    onDonate(activeCampaign.id, {
      donorName: currentUser.residentName,
      flatNumber: currentUser.flatNumber,
      amount: amountNum,
      tierName: selectedTier || "Community Supporter",
      message: donorMessage.trim() || "Best wishes for the celebrations!",
      paymentRef,
      paymentMethod: "Razorpay",
    });

    setIsProcessing(false);
    setPledgeModalOpen(false);
    setDonorMessage("");

    // Trigger Confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#EFE4CC", "#F2C14E", "#4FD1A1", "#F3F5F9"],
    });
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.floor(Number(customAmount));

    if (!amountNum || isNaN(amountNum) || amountNum < 1) {
      setValidationError("Please enter a valid contribution amount of at least ₹1.");
      return;
    }

    setValidationError("");
    setIsProcessing(true);

    await openRazorpayCheckout({
      amount: amountNum,
      title: "Emerald Heights CHS Ltd.",
      description: `${selectedTier || "Festival Donation"} - ${activeCampaign.title}`,
      receipt: `rcpt_fest_${Date.now()}`,
      prefill: {
        name: currentUser.residentName,
        email: currentUser.email || "resident@emeraldheights.com",
        contact: currentUser.phone || "9820001122",
      },
      notes: {
        flatNumber: currentUser.flatNumber,
        campaignId: activeCampaign.id,
        tier: selectedTier || "General",
      },
      onSuccess: (payment) => {
        completeDonationSuccess(amountNum, payment.paymentId);
      },
      onError: (err) => {
        setIsProcessing(false);
        setValidationError(err || "Razorpay checkout was cancelled or failed.");
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  const handleSimulateDonation = () => {
    const amountNum = Math.floor(Number(customAmount));
    if (!amountNum || isNaN(amountNum) || amountNum < 1) {
      setValidationError("Please enter a valid contribution amount of at least ₹1.");
      return;
    }
    setIsProcessing(true);
    setValidationError("");

    setTimeout(() => {
      completeDonationSuccess(amountNum, `pay_sim_${Date.now().toString().slice(-8)}`);
    }, 1000);
  };

  // Admin Create Campaign Handler
  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveTitle.trim() || !driveDate.trim() || !driveDesc.trim() || !driveGoal) {
      return;
    }

    const newId = `camp-${Date.now()}`;
    const newCampaignData = {
      id: newId,
      title: driveTitle.trim(),
      festivalDate: driveDate.trim(),
      description: driveDesc.trim(),
      targetAmount: Number(driveGoal) || 100000,
      tiers: driveTiers.map((t) => ({
        name: t.name.trim(),
        amount: Number(t.amount) || 1000,
        slotsAvailable: Number(t.slotsAvailable) || 5,
        slotsFilled: 0,
        perks: t.perks.trim(),
      })),
    };

    if (onAddCampaign) {
      onAddCampaign(newCampaignData);
      setSelectedCampaignId(newId);
    }

    setIsCreateDriveModalOpen(false);
    // Reset Form
    setDriveTitle("");
    setDriveDate("");
    setDriveDesc("");
    setDriveGoal("150000");

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#EFE4CC", "#F2C14E", "#4FD1A1"],
    });
  };

  const handleUpdateTier = (index: number, field: string, value: any) => {
    setDriveTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddTierRow = () => {
    setDriveTiers((prev) => [
      ...prev,
      {
        name: `Custom Sponsor Tier (${prev.length + 1})`,
        amount: 3000,
        slotsAvailable: 10,
        perks: "Special mention in society event brochure and display board",
      },
    ]);
  };

  const handleRemoveTierRow = (index: number) => {
    if (driveTiers.length <= 1) return;
    setDriveTiers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header with Title & Admin Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text)] tracking-tight">
            Festival Sponsorships & Fund
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Community event contributions, tier sponsorships & donor roll
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateDriveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
            id="btn-create-festival-drive"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add New Festival Drive</span>
          </button>
        )}
      </div>

      {/* Campaign Selector Tabs / Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {campaigns.map((camp) => (
          <button
            key={camp.id}
            onClick={() => {
              setSelectedCampaignId(camp.id);
              setIsDescriptionExpanded(false);
            }}
            className={`pill-btn text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              camp.id === activeCampaign.id
                ? "bg-[var(--accent)] text-[var(--on-accent)] font-bold shadow-sm"
                : "bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
            }`}
          >
            {camp.title}
          </button>
        ))}

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateDriveModalOpen(true)}
            className="text-xs font-bold px-3.5 py-2 rounded-full border border-dashed border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10 flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 cursor-pointer"
            id="btn-pill-add-drive"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Festival Drive</span>
          </button>
        )}
      </div>

      {/* 1. Hero Campaign Card */}
      <DarkHeroCard>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="bg-[var(--accent)] text-[var(--on-accent)] p-1.5 rounded-xl font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
              Community Festival Drive
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border)]">
            <Calendar className="w-3 h-3 text-[var(--text)]" />
            <span>{activeCampaign.festivalDate}</span>
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-[var(--text)] mt-2 leading-tight">
          {activeCampaign.title}
        </h3>

        {/* Expandable Festival Description with Read More / Show Less Toggle */}
        <div className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
          {isDescriptionExpanded ? (
            <p className="leading-relaxed text-[var(--text-secondary)]">
              {activeCampaign.description}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(false);
                }}
                className="text-[var(--accent)] hover:underline ml-1 font-medium text-xs focus:outline-none cursor-pointer"
              >
                Show less
              </button>
            </p>
          ) : (
            <div>
              <p className="line-clamp-2 leading-relaxed text-[var(--text-secondary)]">
                {activeCampaign.description}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(true);
                }}
                className="text-[var(--accent)] hover:underline ml-1 font-medium text-xs focus:outline-none cursor-pointer inline-block mt-0.5"
              >
                Read more
              </button>
            </div>
          )}
        </div>

        {/* Target Progress Bar */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-[var(--text-secondary)]">Total Contributions Raised</span>
            <span className="text-xs font-bold text-[var(--accent)]">{percentage}% Funded</span>
          </div>

          <div className="w-full bg-[var(--surface)] h-3.5 rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
            <div
              className="bg-[var(--accent)] h-full rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="text-2xl font-black text-[var(--text)]">
              {formatINR(activeCampaign.collectedAmount)}
            </div>
            <div className="text-[var(--text-secondary)] font-medium">
              Goal: <strong className="text-[var(--text)]">{formatINR(activeCampaign.targetAmount)}</strong>
            </div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={() => handleOpenPledge()}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-black text-xs py-3.5 mt-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          id="sponsor-contribute-btn"
        >
          <HeartHandshake className="w-4 h-4 stroke-[2.5]" />
          <span>Contribute / Sponsor Event</span>
        </button>
      </DarkHeroCard>

      {/* 2. Sponsorship Tiers */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Available Sponsorship Tiers
          </h3>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Limited slots per tier</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activeCampaign.tiers.map((tier) => {
            const isFull = tier.slotsFilled >= tier.slotsAvailable;

            return (
              <div
                key={tier.name}
                className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)] flex flex-col justify-between space-y-3 hover:border-[var(--accent)]/40 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[var(--text)] leading-tight">
                      {tier.name}
                    </span>
                    <Trophy
                      className="w-4 h-4 shrink-0"
                      style={{ color: getTierBadgeStyle(tier.name).color }}
                    />
                  </div>

                  <div className="text-lg font-black text-[var(--text)] mt-1">
                    {formatINR(tier.amount)}
                  </div>

                  {/* Natural wrapping without overflow */}
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    {tier.perks}
                  </p>

                  {/* View Tier Details Button */}
                  <button
                    type="button"
                    onClick={() => setViewTierModal(tier)}
                    className="text-[10px] text-[var(--accent)] hover:underline font-semibold mt-2 inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                  >
                    <span>View Tier Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                    {tier.slotsFilled} / {tier.slotsAvailable} slots taken
                  </span>
                  <button
                    onClick={() => handleOpenPledge(tier.name, tier.amount)}
                    disabled={isFull}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isFull
                        ? "bg-[var(--surface)] text-[var(--text-secondary)]/50 cursor-not-allowed border border-[var(--border)]"
                        : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)]"
                    }`}
                  >
                    {isFull ? "Filled" : "Select Slot"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Community Sponsors & Donors Wall */}
      <div className="bg-[var(--card)] rounded-2xl p-5 border border-[var(--border)] space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--text)]" />
            <h3 className="text-sm font-bold text-[var(--text)]">
              Sponsor & Donor Honor Roll ({activeCampaign.donations.length})
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--surface)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-full">
            Live Feed
          </span>
        </div>

        <div className="divide-y divide-white/[0.08] space-y-2">
          {activeCampaign.donations.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
              Be the first to sponsor or contribute to this festival drive!
            </div>
          ) : (
            activeCampaign.donations.map((don) => (
              <div key={don.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text)]">{don.donorName}</span>
                    <span className="text-[10px] font-bold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                      Flat {don.flatNumber}
                    </span>
                    {don.tierName && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: getTierBadgeStyle(don.tierName).color,
                          backgroundColor: "var(--surface)",
                          border: `1px solid ${getTierBadgeStyle(don.tierName).color}40`,
                        }}
                      >
                        {don.tierName}
                      </span>
                    )}
                  </div>
                  {don.message && (
                    <p className="text-[11px] text-[var(--text-secondary)] italic flex items-center gap-1 mt-0.5">
                      <MessageSquareQuote className="w-3 h-3 text-[var(--text-secondary)]/70 inline" />
                      "{don.message}"
                    </p>
                  )}
                  <span className="text-[10px] text-[var(--text-secondary)]/70 block">{don.donatedAt}</span>
                </div>

                <div className="text-sm font-black text-[var(--text)] shrink-0">
                  {formatINR(don.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Tier Details Modal */}
      {viewTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-sm bg-[var(--card)] text-[var(--text)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden space-y-4 p-5 my-auto">
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: `${getTierBadgeStyle(viewTierModal.name).color}40`,
                  }}
                >
                  <Trophy
                    className="w-5 h-5"
                    style={{ color: getTierBadgeStyle(viewTierModal.name).color }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text)] leading-tight">
                    {viewTierModal.name}
                  </h4>
                  <span className="text-xs font-black text-[var(--accent)] mt-0.5 block">
                    {formatINR(viewTierModal.amount)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewTierModal(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--surface)]/80 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--border)]">
                <span className="text-[var(--text-secondary)]">Availability</span>
                <span className="font-bold text-[var(--text)]">
                  {viewTierModal.slotsFilled} / {viewTierModal.slotsAvailable} Slots Reserved
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                  Full Benefits & Perks
                </span>
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] text-xs text-[var(--text)] leading-relaxed space-y-2">
                  {viewTierModal.perks.split("+").map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                      <span>{perk.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setViewTierModal(null)}
                className="flex-1 py-2.5 bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--text)] text-xs font-bold rounded-xl border border-[var(--border)] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = viewTierModal;
                  setViewTierModal(null);
                  handleOpenPledge(t.name, t.amount);
                }}
                disabled={viewTierModal.slotsFilled >= viewTierModal.slotsAvailable}
                className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-black rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {viewTierModal.slotsFilled >= viewTierModal.slotsAvailable
                  ? "Slot Full"
                  : "Select Slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Pledge Donation Modal */}
      {pledgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--card)] text-[var(--text)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden my-auto">
            <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[var(--text)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">Pledge Sponsorship / Donation</h3>
              </div>
              <button
                type="button"
                onClick={() => setPledgeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--surface)]/80 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePledgeSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Contributor</label>
                <div className="bg-[var(--surface)] p-2.5 rounded-xl text-[var(--text)] font-semibold flex justify-between border border-[var(--border)]">
                  <span>{currentUser.residentName}</span>
                  <span className="text-[var(--text)]">Flat {currentUser.flatNumber}</span>
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Selected Tier / Category</label>
                <input
                  type="text"
                  value={selectedTier || "General Community Donation"}
                  readOnly
                  className="w-full bg-[var(--surface)] text-[var(--text)] p-2.5 rounded-xl border border-[var(--border)] font-semibold"
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Contribution Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-[var(--bg)] text-[var(--text)] text-lg font-black p-3 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="2000"
                />
              </div>

              {validationError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  Festive Greetings / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="e.g. Wishing our society neighbors a wonderful festival!"
                  className="w-full bg-[var(--bg)] text-[var(--text)] p-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-extrabold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                  id="confirm-pay-razorpay-btn"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay {formatINR(Math.max(0, Number(customAmount) || 0))} via Razorpay</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateDonation}
                  disabled={isProcessing}
                  className="w-full bg-[var(--surface)] hover:bg-[var(--surface)]/80 border border-[var(--border)] text-[var(--text)] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all disabled:opacity-50 cursor-pointer"
                  id="simulate-sponsorship-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--text)]" />
                  <span>One-Click Test Contribution</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPledgeModalOpen(false)}
                  className="w-full py-1.5 text-center text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-secondary)] pt-1">
                  <Lock className="w-3 h-3 text-[var(--text)]" />
                  <span>Razorpay Test Gateway (UPI, Cards, NetBanking, QR)</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Dedicated Full-Screen Sub-View: Add Festival & Sponsorship Drive */}
      {isAdmin && isCreateDriveModalOpen && (() => {
        const subViewContent = (
          <div className="fixed inset-0 z-50 bg-[#0A1120] text-[#F3F5F9] min-h-screen w-full overflow-y-auto pb-28 animate-fade-in">
            {/* 2. Desktop / Responsive Shell Alignment */}
            <div className="max-w-md mx-auto min-h-screen bg-[#0A1120] relative flex flex-col">
              {/* 3. Sticky Top App Bar */}
              <header className="sticky top-0 z-20 bg-[#0A1120] px-4 pt-12 pb-3 border-b border-[#22304A] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateDriveModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#16233A] border border-[#22304A] text-[#F3F5F9] flex items-center justify-center hover:bg-[#16233A]/80 transition cursor-pointer shadow-sm active:scale-95"
                  aria-label="Go Back"
                  id="btn-back-create-festival"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <h1 className="text-[17px] font-semibold text-[#F3F5F9]">New Festival Drive</h1>

                <div className="w-9" aria-hidden="true" />
              </header>

              {/* 4. Form Sections & Button */}
              <form onSubmit={handleCreateCampaignSubmit} className="flex-1 flex flex-col">
                {/* SECTION 1: FESTIVAL DETAILS */}
                <div className="mx-4 my-4 bg-[#111C2E] border border-[#22304A] rounded-2xl p-4 space-y-4">
                  <div className="border-b border-[#22304A] pb-2.5">
                    <h2 className="text-sm font-bold text-[#F3F5F9]">Festival Details</h2>
                    <p className="text-xs text-[#8C97AD] mt-0.5">Primary information for the community drive</p>
                  </div>

                  {/* Field: Festival / Drive Title */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#8C97AD] uppercase tracking-wider block mb-1.5">
                      Festival / Drive Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={driveTitle}
                      onChange={(e) => setDriveTitle(e.target.value)}
                      placeholder="e.g. Diwali Deepotsav & Mela 2026"
                      className="w-full bg-[#16233A] border border-[#22304A] rounded-xl px-4 py-3 text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC] text-sm"
                      id="input-drive-title"
                    />
                  </div>

                  {/* Field: Date Range */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#8C97AD] uppercase tracking-wider block mb-1.5">
                      Date Range <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      placeholder="e.g. 31 Oct – 02 Nov 2026"
                      className="w-full bg-[#16233A] border border-[#22304A] rounded-xl px-4 py-3 text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC] text-sm"
                      id="input-drive-date"
                    />
                  </div>

                  {/* Field: Fundraising Target (₹) */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#8C97AD] uppercase tracking-wider block mb-1.5">
                      Fundraising Target (₹) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="500"
                      value={driveGoal}
                      onChange={(e) => setDriveGoal(e.target.value)}
                      placeholder="250000"
                      className="w-full bg-[#16233A] border border-[#22304A] rounded-xl px-4 py-3 text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC] text-sm font-semibold"
                      id="input-drive-goal"
                    />
                  </div>

                  {/* Field: Full Description */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#8C97AD] uppercase tracking-wider block mb-1.5">
                      Full Description <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={driveDesc}
                      onChange={(e) => setDriveDesc(e.target.value)}
                      placeholder="Describe the celebration, events, and community activities..."
                      className="w-full bg-[#16233A] border border-[#22304A] rounded-xl px-4 py-3 text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC] text-sm resize-none leading-relaxed"
                      id="input-drive-desc"
                    />
                  </div>
                </div>

                {/* SECTION 2: SPONSORSHIP TIERS CONFIGURATION */}
                <div className="mx-4 my-4 bg-[#111C2E] border border-[#22304A] rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#22304A] pb-2.5">
                    <div>
                      <h2 className="text-sm font-bold text-[#F3F5F9]">Sponsorship Tiers Configuration</h2>
                      <p className="text-xs text-[#8C97AD] mt-0.5">Configure tier amounts, slot caps & perks</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTierRow}
                      className="flex items-center gap-1 text-xs text-[#EFE4CC] hover:underline font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {driveTiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="bg-[#16233A] p-3.5 rounded-xl border border-[#22304A] space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy
                              className="w-4 h-4"
                              style={{ color: getTierBadgeStyle(tier.name).color }}
                            />
                            <span className="text-xs font-bold text-[#F3F5F9]">
                              Tier {idx + 1}
                            </span>
                          </div>
                          {driveTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTierRow(idx)}
                              className="text-[#8C97AD] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                              title="Remove Tier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[11px] text-[#8C97AD] block mb-1">Tier Name</label>
                            <input
                              type="text"
                              required
                              value={tier.name}
                              onChange={(e) => handleUpdateTier(idx, "name", e.target.value)}
                              placeholder="e.g. Grand Festival Patron (Gold)"
                              className="w-full bg-[#111C2E] border border-[#22304A] rounded-xl px-3 py-2 text-xs text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-[#8C97AD] block mb-1">Price (₹)</label>
                              <input
                                type="number"
                                required
                                min="100"
                                step="100"
                                value={tier.amount}
                                onChange={(e) => handleUpdateTier(idx, "amount", e.target.value)}
                                className="w-full bg-[#111C2E] border border-[#22304A] rounded-xl px-3 py-2 text-xs text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC] font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-[#8C97AD] block mb-1">Max Slots</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={tier.slotsAvailable}
                                onChange={(e) => handleUpdateTier(idx, "slotsAvailable", e.target.value)}
                                className="w-full bg-[#111C2E] border border-[#22304A] rounded-xl px-3 py-2 text-xs text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC] font-semibold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-[#8C97AD] block mb-1">Tier Perks & Benefits</label>
                            <input
                              type="text"
                              required
                              value={tier.perks}
                              onChange={(e) => handleUpdateTier(idx, "perks", e.target.value)}
                              placeholder="e.g. VIP front-row seating + Special Aarti + Stage banner"
                              className="w-full bg-[#111C2E] border border-[#22304A] rounded-xl px-3 py-2 text-xs text-[#F3F5F9] placeholder:text-[#8C97AD] focus:outline-none focus:border-[#EFE4CC]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Submit Button */}
                <div className="mt-auto">
                  <button
                    type="submit"
                    className="mx-4 my-6 w-[calc(100%-2rem)] py-3.5 rounded-xl bg-[#EFE4CC] text-[#0A1120] font-bold text-[15px] hover:bg-[#F7F0DF] transition cursor-pointer shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
                    id="btn-publish-festival-drive"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Publish Festival Drive</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

        return mounted ? createPortal(subViewContent, document.body) : subViewContent;
      })()}
    </div>
  );
};

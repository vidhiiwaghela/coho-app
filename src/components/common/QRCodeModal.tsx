"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  CreditCard,
  QrCode,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR } from "../../lib/utils";
import { openRazorpayCheckout } from "../../lib/razorpay";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  subtitle: string;
  billId?: string;
  residentName?: string;
  flatNumber?: string;
  onPaymentSuccess: (method: "Razorpay" | "UPI" | "NetBanking" | "Card", paymentRef?: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  amount,
  title,
  subtitle,
  billId,
  residentName = "Resident",
  flatNumber = "B-402",
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDirectQR, setShowDirectQR] = useState(false);
  const [lastPaymentRef, setLastPaymentRef] = useState<string>("");

  if (!isOpen) return null;

  const upiId = "emeraldheights.rwa@hdfcbank";
  const upiUri = `upi://pay?pa=${upiId}&pn=Emerald%20Heights%20CHS%20Ltd&am=${amount}&cu=INR&tn=${encodeURIComponent(
    title
  )}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchRazorpay = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    await openRazorpayCheckout({
      amount,
      title: "Emerald Heights CHS Ltd.",
      description: `${title} - Flat ${flatNumber}`,
      receipt: billId ? `rcpt_${billId.replace(/-/g, "_")}` : `rcpt_${Date.now()}`,
      prefill: {
        name: residentName,
        email: "resident@emeraldheights.com",
        contact: "9820001122",
      },
      notes: {
        flatNumber,
        purpose: title,
        billId: billId || "",
      },
      onSuccess: (payment) => {
        setIsProcessing(false);
        setIsSuccess(true);
        setLastPaymentRef(payment.paymentId);

        // Trigger celebration confetti
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#D6FF3F", "#3B82F6", "#3FBF6F", "#ffffff"],
        });

        setTimeout(() => {
          onPaymentSuccess("Razorpay", payment.paymentId);
          setIsSuccess(false);
          onClose();
        }, 1800);
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(err || "Razorpay payment was not completed.");
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setErrorMessage("");

    const simRef = `pay_sim_${Date.now().toString().slice(-8)}`;

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setLastPaymentRef(simRef);

      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D6FF3F", "#161616", "#3FBF6F", "#ffffff"],
      });

      setTimeout(() => {
        onPaymentSuccess("Razorpay", simRef);
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="modal-pop-in w-full max-w-md bg-[#161F30] text-[#F5F1E8] rounded-2xl border border-[#2B3854] shadow-sm overflow-hidden relative">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#2B3854]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] border border-[#E8B565]/30 flex items-center justify-center font-black text-xs">
              RZP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold leading-tight">Razorpay Secure Checkout</h2>
                <span className="text-[10px] bg-[#E8B565]/20 text-[#F5F1E8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Test Mode
                </span>
              </div>
              <p className="text-xs text-[#A6ACC0]">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A6ACC0] hover:text-[#F5F1E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center">
          {isSuccess ? (
            <div className="py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#161F30] text-[#F5F1E8] border border-[#E8B565]/40 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-[#F5F1E8]">Payment Verified!</h3>
              <p className="text-xs text-[#A6ACC0]">
                Processed securely via Razorpay. Reference:{" "}
                <strong className="text-white font-mono">{lastPaymentRef}</strong>
              </p>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="mb-5 bg-[#1C2740] p-4 rounded-2xl border border-[#2B3854]">
                <span className="text-xs uppercase tracking-wider text-[#A6ACC0] font-semibold">
                  Amount Payable
                </span>
                <div className="text-3xl font-extrabold text-white mt-0.5 tracking-tight">
                  {formatINR(amount)}
                </div>
                <div className="text-xs text-[#F5F1E8] mt-1 font-medium">{title}</div>
              </div>

              {errorMessage && (
                <div className="mb-4 flex items-center gap-2 text-[#E2685B] text-xs bg-[#2A1418] p-3 rounded-xl border border-[#E2685B]/30 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#E2685B]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Razorpay Launch CTA */}
              <div className="space-y-2.5">
                <button
                  onClick={handleLaunchRazorpay}
                  disabled={isProcessing}
                  className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-extrabold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
                  id="razorpay-checkout-btn"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay via Razorpay Gateway</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                {/* Instant Sandbox Simulation fallback */}
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full bg-[#1C2740] hover:bg-[#A6ACC0]/10 border border-[#2B3854] text-[#F5F1E8] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all disabled:opacity-50"
                  id="simulate-payment-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5F1E8]" />
                  <span>One-Click Test Success</span>
                </button>
              </div>

              {/* Optional Static QR Drawer toggle */}
              <div className="mt-4 pt-4 border-t border-[#2B3854]">
                <button
                  onClick={() => setShowDirectQR(!showDirectQR)}
                  className="text-xs text-[#A6ACC0] hover:text-white flex items-center justify-center gap-1.5 mx-auto"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showDirectQR ? "Hide Static UPI QR" : "Show Society Direct UPI QR"}</span>
                </button>

                {showDirectQR && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="p-3 bg-white rounded-xl w-fit mx-auto shadow-sm">
                      <QRCodeSVG value={upiUri} size={150} level="H" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs bg-[#1C2740] border border-[#2B3854] rounded-full py-1.5 px-3 w-fit mx-auto">
                      <span className="text-[#A6ACC0]">UPI:</span>
                      <span className="font-mono text-white text-[11px]">{upiId}</span>
                      <button onClick={handleCopyUPI} className="text-[#F5F1E8] p-0.5">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A6ACC0] mt-4">
                <Lock className="w-3 h-3 text-[#F5F1E8]" />
                <span>256-Bit SSL Encrypted by Razorpay • Test API Key Active</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

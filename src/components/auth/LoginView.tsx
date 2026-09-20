"use client";

import React, { useState } from "react";
import { FlatUser, UserRole } from "../../types";
import {
  ShieldAlert,
  Home,
  KeyRound,
  Lock,
  ChevronDown,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface LoginViewProps {
  flats: FlatUser[];
  onLogin: (flatId: string, role?: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ flats, onLogin }) => {
  const residentFlats = flats.filter((f) => f.role !== "admin");
  const adminFlat = flats.find((f) => f.role === "admin") || flats[0];

  const [loginMode, setLoginMode] = useState<"resident" | "admin">("resident");
  const [selectedFlatId, setSelectedFlatId] = useState<string>("flat-a101");
  const [selectedRole, setSelectedRole] = useState<UserRole>("resident");
  const [password, setPassword] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("committee@emeraldheights.org");
  const [adminPin, setAdminPin] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showDemoAutofill, setShowDemoAutofill] = useState<boolean>(false);

  const handleResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFlat = residentFlats.find((f) => f.id === selectedFlatId);
    const expectedPin = selectedFlat?.pin || "1234";
    if (password.trim() !== expectedPin && password.trim() !== "1234") {
      setErrorMsg("Invalid PIN. Please check your credentials and try again.");
      return;
    }
    setErrorMsg("");
    onLogin(selectedFlatId, selectedRole);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() !== "1234" && adminPin.trim() !== "COHO-ADMIN-2026") {
      setErrorMsg("Invalid PIN. Please check your credentials and try again.");
      return;
    }
    setErrorMsg("");
    onLogin(adminFlat.id, "admin");
  };

  // Group flats by Wing
  const wings = [
    { name: "Building A", prefix: "A-" },
    { name: "Building B", prefix: "B-" },
    { name: "Building C", prefix: "C-" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0A1120] flex flex-col items-center justify-center p-4 sm:p-6 text-[#F3F5F9] relative overflow-hidden">
      <div className="w-full max-w-sm relative z-10 space-y-6">
        {/* Society Branding Header */}
        <div className="text-center space-y-2.5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111C2E] border border-[#22304A] p-2 flex items-center justify-center">
            <img
              src="/coho_logo.jpeg"
              alt="CoHo Logo"
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F3F5F9] tracking-tight">
              Emerald Heights CHS
            </h1>
            <p className="text-xs text-[#8C97AD] font-medium">
              CoHo Smart Resident Portal
            </p>
          </div>
        </div>

        {/* Clean Auth Card */}
        <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-6 shadow-sm space-y-5">
          {/* Toggle: Resident or Admin */}
          <div className="grid grid-cols-2 gap-1 bg-[#0A1120] p-1 rounded-xl border border-[#22304A]">
            <button
              type="button"
              onClick={() => {
                setLoginMode("resident");
                setErrorMsg("");
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === "resident"
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "text-[#8C97AD] hover:text-[#F3F5F9]"
              }`}
              id="tab-resident"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Resident</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode("admin");
                setErrorMsg("");
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === "admin"
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "text-[#8C97AD] hover:text-[#F3F5F9]"
              }`}
              id="tab-admin"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A1418] border border-[#F0736A]/30 text-[#F0736A] text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loginMode === "resident" ? (
            /* Resident Login Form */
            <form onSubmit={handleResidentSubmit} className="space-y-4">
              {/* Society Flat Selector */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C97AD] block mb-1.5">
                  Flat Number
                </label>
                <div className="relative">
                  <select
                    value={selectedFlatId}
                    onChange={(e) => setSelectedFlatId(e.target.value)}
                    className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-3 py-2.5 text-xs text-[#F3F5F9] appearance-none focus:outline-none focus:border-[#EFE4CC] cursor-pointer"
                    id="select-flat-number"
                  >
                    {wings.map((wing) => {
                      const wingFlats = residentFlats.filter((f) => f.flatNumber.startsWith(wing.prefix));
                      if (wingFlats.length === 0) return null;
                      return (
                        <optgroup key={wing.name} label={wing.name} className="bg-[#111C2E] text-[#8C97AD]">
                          {wingFlats.map((flat) => {
                            const roleTag = flat.flatNumber === "B-402" ? "(Secretary / Owner)" : "(Owner)";
                            return (
                              <option
                                key={flat.id}
                                value={flat.id}
                                className="bg-[#0A1120] text-[#F3F5F9]"
                              >
                                Flat {flat.flatNumber} — {flat.residentName} {roleTag}
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8C97AD] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Role Toggle: Owner vs Tenant */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C97AD] block mb-1.5">
                  Occupancy Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("resident")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedRole === "resident"
                        ? "bg-[#16233A] border-[#EFE4CC] text-[#F3F5F9] shadow-sm"
                        : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9]"
                    }`}
                  >
                    Owner / Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("tenant")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedRole === "tenant"
                        ? "bg-[#16233A] border-[#EFE4CC] text-[#F3F5F9] shadow-sm"
                        : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9]"
                    }`}
                  >
                    Tenant
                  </button>
                </div>
              </div>

              {/* Password / PIN Input - Empty by default with placeholder */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C97AD] block mb-1.5">
                  Passcode / PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Enter 4-digit PIN"
                    className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-3 py-2.5 text-xs text-[#F3F5F9] focus:outline-none focus:border-[#EFE4CC]"
                    id="input-pin-resident"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#8C97AD] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Prominent Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 pt-2.5"
                id="btn-resident-signin"
              >
                <span>Sign In as Resident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C97AD] block mb-1.5">
                  Committee Email / Admin ID
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-3 py-2.5 text-xs text-[#F3F5F9] focus:outline-none focus:border-[#EFE4CC]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C97AD] block mb-1.5">
                  Admin Passcode / Security PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Enter 4-digit PIN"
                    className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-3 py-2.5 text-xs text-[#F3F5F9] focus:outline-none focus:border-[#EFE4CC]"
                    id="input-pin-admin"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-[#8C97AD] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                id="btn-admin-signin"
              >
                <span>Sign In as Managing Committee</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Discreet Demo Autofill Link at Bottom */}
        <div className="text-center space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setShowDemoAutofill(!showDemoAutofill)}
            className="text-[11px] text-[#8C97AD]/70 hover:text-[#F3F5F9] underline decoration-dotted transition-colors"
          >
            Demo Autofill
          </button>

          {showDemoAutofill && (
            <div className="bg-[#111C2E] border border-[#22304A] p-2.5 rounded-xl shadow-sm flex flex-wrap items-center justify-center gap-2 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setSelectedFlatId("flat-a101");
                  setSelectedRole("resident");
                  setPassword("1234");
                  onLogin("flat-a101", "resident");
                }}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#16233A] hover:bg-[#8C97AD]/10 text-[#F3F5F9] rounded-lg border border-[#EFE4CC]/30"
              >
                Pooja (A-101)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFlatId("flat-b402");
                  setSelectedRole("resident");
                  setPassword("1234");
                  onLogin("flat-b402", "resident");
                }}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#16233A] hover:bg-[#8C97AD]/10 text-[#F3F5F9] rounded-lg border border-[#EFE4CC]/30"
              >
                Rajesh (B-402)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFlatId("flat-b204");
                  setSelectedRole("resident");
                  setPassword("1234");
                  onLogin("flat-b204", "resident");
                }}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#16233A] hover:bg-[#8C97AD]/10 text-[#F3F5F9] rounded-lg border border-[#EFE4CC]/30"
              >
                Ananya (B-204)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFlatId("flat-c303");
                  setSelectedRole("resident");
                  setPassword("1234");
                  onLogin("flat-c303", "resident");
                }}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#16233A] hover:bg-[#8C97AD]/10 text-[#F3F5F9] rounded-lg border border-[#EFE4CC]/30"
              >
                Vikram (C-303)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminPin("1234");
                  onLogin(adminFlat.id, "admin");
                }}
                className="px-2.5 py-1 text-[10px] font-bold bg-[#16233A] hover:bg-[#8C97AD]/10 text-[#F3F5F9] rounded-lg border border-[#EFE4CC]/30"
              >
                Admin (Secretary)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

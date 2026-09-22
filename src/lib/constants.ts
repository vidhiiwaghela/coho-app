export const DEFAULT_UNAVAILABLE_DOC_MESSAGE =
  "This physical document is currently unavailable and is expected to be ready in approximately 30 days.";

export type DocumentRequestStatus = "pending" | "fulfilled" | "unavailable" | "not_available";

export const DOC_STATUS_META: Record<
  string,
  {
    label: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  pending: {
    label: "Pending",
    textColor: "text-[#A9B4CC]",
    bgColor: "bg-[#161F30]",
    borderColor: "border-[#A9B4CC]/30",
  },
  fulfilled: {
    label: "Fulfilled",
    textColor: "text-[#8FBF8A]",
    bgColor: "bg-[#161F30]",
    borderColor: "border-[#8FBF8A]/30",
  },
  unavailable: {
    label: "Not Available",
    textColor: "text-[#E2685B]",
    bgColor: "bg-[#2A1418]",
    borderColor: "border-[#E2685B]/40",
  },
  not_available: {
    label: "Not Available",
    textColor: "text-[#E2685B]",
    bgColor: "bg-[#2A1418]",
    borderColor: "border-[#E2685B]/40",
  },
};

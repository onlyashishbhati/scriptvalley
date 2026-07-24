"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import { useUser, useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

type UserData = {
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  collegeName?: string | null;
  state?: string | null;
  country?: string | null;
};
type FormState = {
  name: string;
  email: string;
  phoneNumber: string;
  collegeName: string;
  state: string;
  country: string;
};
type Payload = {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  collegeName?: string;
  state?: string;
  country?: string;
  idToken?: string;
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">
      {children}
    </p>
  );
}

export default function BasicInfoForm() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id ?? "";

  const rawUserData = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const updateBasicInfo = useMutation(api.users.updateBasicInfo);

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phoneNumber: "",
    collegeName: "",
    state: "",
    country: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const d = rawUserData as unknown as UserData | null;
    if (d && typeof d === "object") {
      setFormData({
        name: d.name ?? "",
        email: d.email ?? user?.primaryEmailAddress?.emailAddress ?? "",
        phoneNumber: d.phoneNumber ?? "",
        collegeName: d.collegeName ?? "",
        state: d.state ?? "",
        country: d.country ?? "",
      });
    } else if (user) {
      setFormData((p) => ({
        ...p,
        email: user.primaryEmailAddress?.emailAddress ?? p.email,
      }));
    }
  }, [rawUserData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber" && !/^\d*$/.test(value)) return;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !userId) {
      toast.error("Please sign in.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error("Enter a valid 10-digit number.");
      return;
    }
    setIsSaving(true);
    try {
      let idToken: string | undefined;
      try {
        const t = await getToken({ template: "convex" });
        idToken = t ?? undefined;
      } catch {
        /* noop */
      }
      const payload: Payload = {
        userId,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        collegeName: formData.collegeName || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        ...(idToken ? { idToken } : {}),
      };
      await updateBasicInfo(payload);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    "w-full h-8 bg-[var(--bg-input)] border border-transparent rounded-md px-3 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none focus:bg-[var(--bg-hover)] focus:border-[var(--border-default)] transition-all duration-100";
  const readonlyCls =
    "w-full h-8 bg-[var(--bg-elevated)] border border-transparent rounded-md px-3 text-sm text-[var(--text-disabled)] outline-none cursor-not-allowed";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="max-w-xl space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label>Full Name</Label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className={inputCls}
          />
        </div>

        <div>
          <Label>Email</Label>
          <input
            name="email"
            value={formData.email}
            readOnly
            className={readonlyCls}
          />
        </div>

        <div className="md:col-span-2">
          <Label>Phone Number</Label>
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            maxLength={10}
            className={inputCls}
          />
        </div>

        <div className="md:col-span-2">
          <Label>College Name</Label>
          <input
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            placeholder="e.g. IIT Delhi"
            className={inputCls}
          />
        </div>

        <div>
          <Label>State</Label>
          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="e.g. Delhi"
            className={inputCls}
          />
        </div>

        <div>
          <Label>Country</Label>
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g. India"
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {/* Save — brand primary action, intentionally hardcoded */}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-sm font-medium transition-colors duration-100 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
        <p className="text-xs text-[var(--text-disabled)]">
          Your basic profile information
        </p>
      </div>
    </motion.form>
  );
}

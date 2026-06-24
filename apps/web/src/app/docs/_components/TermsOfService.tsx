import { FileText } from "lucide-react";

type TermsSection = { heading: string; body: string | string[] };

const SECTIONS: TermsSection[] = [
  {
    heading: "Acceptance of terms",
    body: "By accessing or using Script Valley, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms apply to all users, registered or not.",
  },
  {
    heading: "Your account",
    body: [
      "You must sign in with a valid Google account to access most features.",
      "You are responsible for maintaining the security of your account and for all activity that occurs under it.",
      "You must be at least 13 years old to use Script Valley.",
      "You may not create accounts on behalf of others without their explicit consent.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "You may not use Script Valley to run code that is intended to harm, attack, or compromise any system, network, or service.",
      "You may not use the compiler to mine cryptocurrency, run distributed computing tasks, or perform any activity that constitutes abuse of shared computational resources.",
      "You may not upload, share, or publish content that is illegal, defamatory, obscene, or violates the rights of others.",
      "You may not attempt to reverse engineer, scrape, or abuse the platform's APIs beyond normal use.",
      "You may not impersonate other users or create fake developer profiles.",
    ],
  },
  {
    heading: "Content you publish",
    body: [
      "Code and content you publish as public snippets is visible to all users and the general public.",
      "You retain ownership of the code you write. By making it public, you grant Script Valley a non-exclusive, royalty-free licence to display it on the platform.",
      "You are responsible for ensuring your public content does not infringe on others' intellectual property rights.",
      "We reserve the right to remove any content that violates these terms without notice.",
    ],
  },
  {
    heading: "Third-party services",
    body: "Script Valley uses Convex for data storage and Clerk for authentication. Both services have their own terms and privacy policies. By using Script Valley, you are also subject to Clerk's terms of service. We are not responsible for the availability or practices of these third-party providers.",
  },
  {
    heading: "Availability and modifications",
    body: [
      "Script Valley is provided as-is. We make no guarantees of 100% uptime or uninterrupted service.",
      "We reserve the right to modify, suspend, or discontinue any feature at any time, with or without notice.",
      "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance.",
      "We will make reasonable efforts to notify users of material changes via the platform or email.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: "Script Valley is provided free of charge. To the maximum extent permitted by law, we disclaim all warranties, express or implied. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, loss of code, or service interruptions.",
  },
  {
    heading: "Termination",
    body: "We reserve the right to suspend or terminate any account that violates these terms, at our sole discretion and without notice. You may delete your account at any time via the contact form. Upon account deletion, your private data will be removed from our systems within 7 business days.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by and construed in accordance with applicable laws. Any disputes shall be subject to the exclusive jurisdiction of the courts of the relevant jurisdiction.",
  },
  {
    heading: "Contact",
    body: "For questions about these terms, use the contact form on this page or email us at hello@scriptvalley.com.",
  },
];

export default function TermsOfService() {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">

      <div className="px-6 py-5 bg-[var(--bg-input)] border-b border-[var(--border-subtle)] flex items-start gap-3">
        <FileText className="w-4 h-4 text-[#3A5EFF] shrink-0 mt-[3px]" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1">Legal</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Terms of Service</h2>
          <p className="mt-1.5 text-sm text-[var(--text-faint)]">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
        <p className="text-sm text-[var(--text-faint)] leading-[1.8]">
          These are the rules for using Script Valley. We&apos;ve tried to write them
          plainly. The short version: don&apos;t abuse the platform, don&apos;t publish harmful content,
          and be respectful. The longer version is below.
        </p>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {SECTIONS.map(({ heading, body }, i) => (
          <div key={heading} className="px-6 py-4 flex gap-4">
            <span className="w-5 h-5 rounded-md bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-disabled)] flex items-center justify-center shrink-0 mt-[2px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">{heading}</p>
              {Array.isArray(body) ? (
                <ul className="flex flex-col gap-1.5">
                  {body.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-[var(--text-faint)] leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-[var(--text-disabled)] shrink-0 mt-2" />
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-faint)] leading-[1.8]">{body}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
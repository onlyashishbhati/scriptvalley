import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider  from "../components/providers/ConvexClientProvider";
import AuthModalProvider     from "../components/providers/AuthModalProvider";
import AuthModal             from "../components/auth/AuthModal";
import { Toaster }           from "react-hot-toast";
import ClientAnalytics       from "../components/ClientAnalytics";
import UserSyncProvider      from "../components/providers/UserSyncProvider";
import SiteChrome from "../components/SiteChrome";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  display:  "swap",
});

const SITE_URL  = "https://scriptvalley.com";
const SITE_NAME = "Script Valley";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} · Learn DSA & Programming`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Script Valley offers structured DSA courses, curated problem sheets, coding challenges, and MCQs built by expert instructors. Learn at your own pace.",
  openGraph: {
    siteName:    SITE_NAME,
    type:        "website",
    locale:      "en_US",
    url:         SITE_URL,
    title:       `${SITE_NAME} · Learn DSA & Programming`,
    description: "Structured DSA courses and curated problem sheets built by expert instructors.",
  },
  twitter: {
    card:  "summary",
    title: `${SITE_NAME} · Learn DSA & Programming`,
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-snippet":       -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var saved = localStorage.getItem('sv-theme');
                    if (saved === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  } catch(e) {}
                })();
              `,
            }}
          />
        </head>
        <body
          className={`${inter.variable} antialiased min-h-screen flex flex-col mb-14`}
          style={{
            fontFamily:      "var(--font-inter), var(--font-sans)",
            backgroundColor: "var(--bg-base)",
            color:           "var(--text-secondary)",
          }}
        >
          <ConvexClientProvider>
            <AuthModalProvider>
              <UserSyncProvider />
              <SiteChrome>{children}</SiteChrome>

              <AuthModal />
            </AuthModalProvider>
          </ConvexClientProvider>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:   "var(--bg-elevated)",
                color:        "var(--text-primary)",
                border:       "1px solid var(--border-subtle)",
                borderRadius: "10px",
                fontSize:     "13px",
                fontFamily:   "var(--font-inter), sans-serif",
                boxShadow:    "0 4px 24px rgba(0,0,0,0.2)",
              },
              success: {
                iconTheme: { primary: "#3A5EFF",  secondary: "var(--bg-elevated)" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "var(--bg-elevated)" },
              },
            }}
          />
          <ClientAnalytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
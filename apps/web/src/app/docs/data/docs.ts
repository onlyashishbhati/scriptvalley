import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Bug,
  Code2,
  FileCode,
  FileText,
  GitBranch,
  Globe,
  GraduationCap,
  HelpCircle,
  Mail,
  Shield,
  StickyNote,
  Star,
  Trophy,
  Users2,
} from "lucide-react";
import type { ElementType } from "react";

export type DocItem  = { heading: string; body: string };
export type DocStep  = { text: string };

export type DocSection = {
  id: string;
  label: string;
  icon: ElementType;
  custom?: boolean;
  content: {
    eyebrow: string;
    title: string;
    intro: string;
    whatItDoes: string;
    steps: DocStep[];
    whyItMatters: string;
    highlights: string[];
    items: DocItem[];
  };
};

export const DOC_GROUPS: { label: string; ids: string[] }[] = [
  { label: "Platform",  ids: ["overview", "offer"] },
  { label: "Features",  ids: ["courses", "devprofile", "portfolio", "blend", "dsa", "notes", "starred", "notifications", "compiler", "snippets", "contests", "visualizers"] },
  { label: "Support",   ids: ["faq", "contact", "feedback"] },
  { label: "Legal",     ids: ["privacy", "terms"] },
];

export const DOCS: DocSection[] = [
  // ── 1. Who We Are
  {
    id: "overview", label: "Who We Are", icon: BookOpen,
    content: {
      eyebrow: "Overview", title: "Who We Are",
      intro: "Script Valley is a free, course-first platform for students preparing for placements. The core product is short, focused courses built to be finished. Everything else, the compiler, DSA sheets, notes, portfolio, and Blend, is there to support the learning and revision loop.",
      whatItDoes: "Script Valley is built around one idea: if a student can actually finish a course, it is worth more than a longer one they abandon halfway through. Each course covers exactly what shows up in interviews, nothing extra. At 50 percent completion, handwritten notes for that course unlock and become downloadable, so revision does not depend on reopening lessons. Practice tools, progress tracking, a portfolio builder, and Blend, a way to keep a DSA sheet or course going together with friends, all live in the same account and connect to the same workflow. There is no upsell, no locked tier, and nothing separate to sign up for.",
      steps: [
        { text: "Visit scriptvalley.com and click Get started." },
        { text: "Sign in with your Google account. No email verification, no onboarding survey." },
        { text: "You land on your Developer Profile, your personal dashboard." },
        { text: "Go to Courses and pick a topic you are preparing for." },
        { text: "Work through the lessons. Progress saves automatically." },
        { text: "Hit 50 percent and download the handwritten notes for that course." },
        { text: "Practice in the Compiler or work through a DSA Sheet for the same topic." },
        { text: "Build your Developer Portfolio when you have work worth sharing." },
        { text: "Start a Blend to keep a sheet or course going together with friends." },
      ],
      whyItMatters: "Most students preparing for placements are juggling too many tools with no clear thread between them. Script Valley keeps courses, practice, notes, progress, portfolio, and accountability with friends all in one place, with the learning always at the center.",
      highlights: [
        "Course-first: short, interview-focused lessons built to be completed",
        "Handwritten notes unlock at 50 percent completion and are downloadable",
        "Free, always: no subscriptions, no trials, no hidden limits",
        "Single sign on: one Google login, everything in one place",
        "Developer Profile and Developer Portfolio are separate by design",
        "Blend keeps a small group accountable to the same sheet or course",
      ],
      items: [
        { heading: "Who it is for",    body: "Students preparing for placement interviews who want focused learning, practice tools, and a portfolio, all from one account." },
        { heading: "Getting started",  body: "Sign in with Google and go straight to Courses. No setup required." },
        { heading: "Is it free?",      body: "Yes. All core features are free. No credit card, no trial period, no paywalls." },
      ],
    },
  },

  // ── 2. What We Offer
  {
    id: "offer", label: "What We Offer", icon: BarChart3,
    content: {
      eyebrow: "Platform", title: "What We Offer",
      intro: "Script Valley is built around a single workflow: learn, practice, revise, and show your work. Courses are the core. Everything else supports them.",
      whatItDoes: "Courses are the main feature. They are short, interview-focused, and designed around completion. Handwritten notes unlock at 50 percent and are downloadable, so you have a revision resource that does not depend on rewatching lessons. The rest of the platform, the compiler for testing ideas, DSA sheets for tracking practice, notes linked to questions, a contest calendar, Blend for staying accountable with friends, and a portfolio builder, all exist to support that learning loop. Your Developer Profile tracks activity automatically. Your Developer Portfolio is separate, built by hand, and shareable with recruiters.",
      steps: [
        { text: "Pick a Course on a topic you are preparing for and start the first lesson." },
        { text: "Work through lessons. Quizzes inside each course test what you have just covered." },
        { text: "Hit 50 percent completion and download the handwritten notes for that course." },
        { text: "Practice the topic in the Compiler or work through a DSA Sheet." },
        { text: "Save a sheet or course to keep it bookmarked, and pin one to your dashboard as your main focus." },
        { text: "Start or join a Blend to track that same sheet or course together with friends." },
        { text: "Add notes to any question you want to remember." },
        { text: "Star questions you want to revisit before an interview." },
        { text: "Check the Contest Calendar to plan your week." },
        { text: "Build your Portfolio when you have projects worth sharing with recruiters." },
      ],
      whyItMatters: "The whole workflow, learning, practice, notes, progress, accountability, and portfolio, lives in one account. Nothing is split across tools, and the course is always the starting point.",
      highlights: [
        "Courses: short, focused, interview-only content built to be finished",
        "Handwritten notes unlock at 50 percent completion, downloadable per course",
        "DSA Sheets for tracking practice progress, not the primary learning tool",
        "Save and Pin: bookmark any number of sheets or courses, pin one of each to your dashboard",
        "Blend: track a sheet or course together with a small group and see everyone's progress",
        "Compiler for testing ideas while working through a course or problem sheet",
        "Developer Profile tracks activity automatically",
        "Developer Portfolio is a separate, manual page built to share with recruiters",
      ],
      items: [
        { heading: "Courses",               body: "Short, interview-focused lessons. Reach 50 percent and downloadable handwritten notes unlock automatically. The main feature." },
        { heading: "Developer Profile",     body: "Your personal dashboard. Tracks DSA progress, streaks, pinned sheet and course, and your Blends automatically." },
        { heading: "Developer Portfolio",   body: "A placement-focused page you build by hand. Separate from your dashboard, shareable via a permanent URL, with its own accent color and layout." },
        { heading: "DSA Sheets",            body: "Curated problem sets for tracking practice. Save a sheet to bookmark it, pin one to your dashboard, and progress syncs to your Developer Profile automatically." },
        { heading: "Blend",                 body: "Create or join a small group tracking the same DSA sheet or course. See everyone's progress side by side, not just your own." },
        { heading: "Centralized Notes",     body: "Private markdown notes attached to DSA questions. Always next to the problem they belong to." },
        { heading: "Starred Questions",     body: "Bookmark any question from any sheet. Quick access for pre-interview review." },
        { heading: "Online Compiler",       body: "Run code in 10+ languages in the browser. Useful for testing ideas alongside a course or DSA sheet." },
        { heading: "AI Debugging",          body: "One click explains a failed run and returns a corrected version. Built into the compiler." },
        { heading: "Snippets",              body: "Save runs as snippets, public or private. Searchable by language, commentable with code blocks." },
        { heading: "Contest Calendar",      body: "Upcoming contests from multiple platforms in one view, shown in your local timezone." },
      ],
    },
  },

  // ── 3. Courses (hero)
  {
    id: "courses", label: "Courses", icon: GraduationCap,
    content: {
      eyebrow: "Core Feature", title: "Courses",
      intro: "Courses are the main feature of Script Valley. Everything else on the platform is built to support them. Each course is short, covers only what matters for interviews, and is designed around one goal: getting finished.",
      whatItDoes: "Most interview prep gets abandoned halfway through, not because the content is bad, but because there is too much of it. Script Valley courses strip that out. Each one covers a single topic in short lessons with no padding, no detours into theory that does not show up in interviews. Progress tracks automatically as you move through the lessons, and you can stop and resume anytime without losing your place. Quizzes inside each course test what you just covered so the learning sticks. At 50 percent completion, handwritten notes for that course unlock automatically, shown right at the top of the course sidebar so you never miss when they become available. The notes are written in the same practical, stripped-down style as the lessons. They are downloadable, so revision does not depend on reopening the course. You can also save any course to bookmark it for later, or pin one as the course you are actively focused on, which surfaces it on your Developer Profile. The full loop is: take the course, unlock the notes at 50 percent, finish at your own pace, revise from the downloaded notes before an interview.",
      steps: [
        { text: "Go to Courses and pick one that matches what you are preparing for." },
        { text: "Save it to bookmark it, or pin it if it is what you are focused on right now." },
        { text: "Work through the lessons in order. Each one is short by design." },
        { text: "Take the quiz at the end of each lesson to reinforce what you covered." },
        { text: "Watch your progress update automatically as you go." },
        { text: "Hit 50 percent completion and handwritten notes unlock automatically, visible at the top of the course sidebar." },
        { text: "Download the notes. They are yours to keep, no account access needed to use them." },
        { text: "Finish the rest of the course at your own pace." },
        { text: "Revise from the downloaded notes before an interview instead of rewatching lessons." },
      ],
      whyItMatters: "Short courses get finished. Finished courses create a real revision resource. The handwritten notes that unlock at 50 percent are the most useful thing on the platform: concise, practical, and available offline. They are not a bonus feature. They are the reason the 50 percent mark exists.",
      highlights: [
        "Interview-only content: no unnecessary theory, no filler",
        "Short lessons designed to be completed, not abandoned",
        "Quizzes inside every course to reinforce what was just covered",
        "Progress tracking: resume from exactly where you left off",
        "Save any course to bookmark it, pin one as your current focus",
        "Handwritten notes unlock at 50 percent completion, shown at the top of the course sidebar",
        "Notes are downloadable per course and yours to keep",
        "Built for the learn, then revise loop",
      ],
      items: [
        { heading: "Lesson format",     body: "Each lesson covers one thing and stays short. The goal is finishing the course, not stretching it out." },
        { heading: "Quizzes",           body: "Built into each course to test understanding after each lesson, not just at the end." },
        { heading: "Progress tracking", body: "Saves automatically. Pick up exactly where you left off, no replaying content you have already covered." },
        { heading: "Save vs Pin",       body: "Save keeps a course in an unlimited bookmark list you can browse from the Courses page. Pin puts a single course front and center on your Developer Profile, with its own progress card." },
        { heading: "Handwritten notes", body: "The main feature. Unlock at 50 percent completion. Written in the same practical style as the lessons, with no extra theory, and always visible at the top of the course sidebar so it is never missed." },
        { heading: "Downloading notes", body: "Once unlocked, download the notes for any course. Revise from them anytime, no internet connection needed." },
        { heading: "Course selection",  body: "Courses are organised by topic so you can close exactly the gap you need before an interview." },
      ],
    },
  },

  // ── 4. Developer Profile
  {
    id: "devprofile", label: "Dev Profile", icon: BarChart3,
    content: {
      eyebrow: "Feature", title: "Developer Profile",
      intro: "Your Developer Profile is your personal dashboard inside Script Valley. It shows where you stand: course progress, DSA sheet completion, streaks, today's problem, your Blends, and your pinned sheet and course. It updates automatically. It is not a portfolio and it is not meant to be shared.",
      whatItDoes: "Problem of the Day and your streak calendar sit at the top, since they are the thing worth checking every day. Right below, a Blend snapshot lists any groups you are part of, so you can jump straight back into a shared sheet or course. Underneath that, two cards show your pinned sheet and pinned course, the two things you have chosen to actively focus on, each with its own progress ring. A quick link to your public Developer Portfolio lives in the sidebar next to your avatar, so it is always one click away without cluttering the main dashboard. None of this needs to be arranged or designed. It is a fixed dashboard that reflects what you have actually done.",
      steps: [
        { text: "Sign in and go to your Developer Profile." },
        { text: "Solve the Problem of the Day to keep your streak going." },
        { text: "Check the Blend snapshot to see groups you are part of and jump back in." },
        { text: "Pin a sheet or course from its own page to see it on your dashboard with a progress ring." },
        { text: "Open the Portfolio link in the sidebar any time you want to view or share your public page." },
        { text: "Switch to the GitHub or LeetCode tab to see those stats without leaving the page." },
        { text: "Come back daily. Streak, progress, and Blend activity update on their own." },
      ],
      whyItMatters: "A dashboard you have to maintain stops being useful fast. The Developer Profile updates itself from what you actually do, so it stays accurate without extra effort. It surfaces the handful of things that change daily, your streak, your Blend, and whatever you have pinned, instead of trying to show everything at once. If you want a page to share with recruiters, that is what the Developer Portfolio is for, and it is always one click away from the sidebar.",
      highlights: [
        "A dashboard for tracking your own progress, not a portfolio",
        "Problem of the Day and streak calendar come first, since they change daily",
        "A Blend snapshot shows your groups right after your streak, not buried in the dock",
        "Pinned sheet and pinned course give you two focused progress cards instead of a long followed-sheets list",
        "Portfolio link lives in the sidebar, one click away, not competing with daily-use content",
        "Updates automatically, nothing to arrange or design",
      ],
      items: [
        { heading: "Streak calendar",       body: "Tracks consecutive days of activity with a monthly view. Miss a day and the streak resets." },
        { heading: "Problem of the Day",    body: "One question, refreshed daily. Solve it to keep your streak alive." },
        { heading: "Blend snapshot",        body: "Lists the groups you belong to with a quick link into each one. Shows an empty state with a create-or-join prompt if you are not in one yet." },
        { heading: "Pinned sheet & course", body: "Pin exactly one sheet and one course as your current focus. Each shows a progress ring and an Access button straight into the content." },
        { heading: "Portfolio quick access", body: "A link to view your public portfolio, or set one up if you have not yet, sits in the sidebar next to your name." },
        { heading: "Profile vs Portfolio",   body: "Your Developer Profile is a private dashboard. Your Developer Portfolio is a separate page you build and share. They are not the same thing." },
      ],
    },
  },

  // ── 5. Developer Portfolio
  {
    id: "portfolio", label: "Portfolio", icon: Briefcase,
    content: {
      eyebrow: "Feature", title: "Developer Portfolio",
      intro: "Your Developer Portfolio is completely separate from your Developer Profile. The Profile is a private dashboard that tracks your progress automatically. The Portfolio is a developer portfolio for students that you build by hand, project by project, to show your best work to recruiters. Nothing appears on it unless you put it there.",
      whatItDoes: "The portfolio builder starts as a blank page. Add the projects you actually want recruiters to see, attach links to live demos or repositories, and decide what goes on the page and what stays off. Add a short tagline for the headline under your name, a longer bio, your skills, interests, and tools, work experience, and an education timeline with institution, degree, and dates. Pick an accent color for the page itself, since your public portfolio always uses its own dark theme independent of your site preference, and the accent is the one thing you control there. If you have connected GitHub or LeetCode, they show up as full tabs on your portfolio with real activity, not just a link icon: a contribution heatmap and language breakdown for GitHub, a difficulty breakdown and submission calendar for LeetCode. Once published, your portfolio lives at scriptvalley.com/u/username, a permanent URL you can add to a resume or placement application, with no Script Valley branding on the page itself.",
      steps: [
        { text: "Go to Portfolio from your dashboard." },
        { text: "Write a short tagline and a longer bio." },
        { text: "Click Add Project and fill in the title, description, and any relevant links." },
        { text: "Add your education history: institution, degree, field of study, and dates." },
        { text: "Add skills, interests, and tools as tags." },
        { text: "Pick an accent color for how your public page looks." },
        { text: "Decide what to include and what to leave out. It is entirely up to you." },
        { text: "Reorder projects so your strongest work shows first." },
        { text: "Preview the page exactly as recruiters will see it, including the GitHub and LeetCode tabs if connected." },
        { text: "Publish and copy your permanent portfolio URL: scriptvalley.com/u/username." },
        { text: "Update anytime. Nothing is locked once it is live." },
      ],
      whyItMatters: "A page you build yourself shows exactly what you want recruiters to see, nothing more, nothing accidental. For students focused on placements, that control matters, and being able to make it feel like your own page, not another Script Valley page, matters just as much.",
      highlights: [
        "Fully manual: nothing appears without you adding it",
        "Separate from your Developer Profile, built to be shared, not just tracked",
        "Tagline, bio, skills, interests, tools, work experience, and an education timeline",
        "Pick your own accent color for the page",
        "GitHub and LeetCode appear as full tabs with real activity, not just contact icons",
        "No Script Valley branding on the published page itself",
        "Permanent URL at scriptvalley.com/u/username, ready for a resume or application",
      ],
      items: [
        { heading: "Adding a project",         body: "Add a title, a short description, and links to the repository or live demo." },
        { heading: "Education",                body: "Add one or more entries with institution, degree, field of study, and start and end dates, shown as a timeline." },
        { heading: "Accent color",             body: "Choose from a handful of preset colors that theme your public portfolio page. Your portfolio always uses its own dark theme, independent of your site light or dark mode setting." },
        { heading: "GitHub & LeetCode tabs",   body: "If connected, these appear as dedicated tabs in your portfolio's navigation with real stats: contribution heatmap and top languages for GitHub, difficulty breakdown and activity for LeetCode." },
        { heading: "Choosing what is visible",  body: "Nothing shows up unless you add it. You control every project, section, and link on the page." },
        { heading: "Portfolio URL",             body: "Your portfolio lives at scriptvalley.com/u/username. One permanent link, ready to share." },
        { heading: "Profile vs Portfolio",      body: "Your Developer Profile tracks progress automatically and is private. Your Developer Portfolio is the page you build to share with recruiters. They serve different purposes." },
      ],
    },
  },

  // ── 6. Blend (NEW)
  {
    id: "blend", label: "Blend", icon: Users2,
    content: {
      eyebrow: "Feature", title: "Blend",
      intro: "Blend is a small group tracking the same DSA sheet or course together. Instead of grinding alone, a Blend shows everyone's progress side by side, so studying with friends is not just a plan you make once and forget.",
      whatItDoes: "Create a Blend and choose whether it tracks DSA sheets or courses. Add one or more sheets or courses to it after creating it, there is no limit to picking just one upfront. Invite people with a private invite code, or make the Blend public so anyone can find it and request to join, which you approve or decline as the owner. Every member's individual progress on the tracked sheets or courses is shown as a ranked list, and the group's overall progress is the average of everyone's individual percentage, shown as one shared number at the top of the page. An activity feed shows who has recently joined. Public Blends can be shared with a link, since they are meant to be found; private Blends rely on the invite code instead.",
      steps: [
        { text: "Go to Blend from the dock." },
        { text: "Click Create a Blend, give it a name, and choose whether it tracks sheets or courses." },
        { text: "Choose Private (invite code only) or Public (anyone can request to join)." },
        { text: "Open your new Blend and add the sheets or courses you want to track." },
        { text: "Share the invite code with friends, or share the public Blend's link." },
        { text: "As the owner, approve or decline join requests on a public Blend." },
        { text: "Check the ranking to see how everyone is doing, and the group progress bar for the shared average." },
        { text: "Add or remove tracked sheets and courses any time as the owner." },
      ],
      whyItMatters: "Studying alone is easy to fall off. Seeing that two friends are already ahead on the same sheet, or that the group average dropped because someone has not started, creates a kind of pressure that a private streak never does. Blend turns a shared goal into something visible.",
      highlights: [
        "Track one or more DSA sheets, or one or more courses, per Blend",
        "Private (invite code) or Public (join requests the owner approves)",
        "Group progress is the average of every member's individual percentage",
        "Ranked member list so everyone can see where they stand",
        "Public Blends are shareable by link, meant to be discovered",
        "Owner controls: add or remove tracked resources, approve or remove members",
      ],
      items: [
        { heading: "Creating a Blend",      body: "Pick a name, choose sheets or courses as the resource type, and set visibility. Sheets and courses to track are added afterward, not locked in at creation." },
        { heading: "Private vs Public",     body: "Private Blends are invite-code only, capped at a small group size. Public Blends can be discovered and joined by request, capped higher, and are the ones worth sharing with a link." },
        { heading: "Group progress",        body: "Shown as one percentage at the top of the Blend page: the average of every member's own progress across everything the Blend tracks." },
        { heading: "Join requests",         body: "On a public Blend, requesting to join notifies the owner, who approves or declines it. A declined request can be sent again later." },
        { heading: "Managing members",      body: "The owner can remove a member at any time, with a confirmation step first. Removed members can be invited back or can request to join again." },
      ],
    },
  },

  // ── 7. DSA Sheets
  {
    id: "dsa", label: "DSA Sheets", icon: Trophy,
    content: {
      eyebrow: "Feature", title: "DSA Sheets",
      intro: "DSA Sheets are a practice tracking tool. They give you curated, topic-wise problem sets to work through alongside your courses, and they track your progress automatically. They are not the primary learning tool, courses are.",
      whatItDoes: "Each sheet covers topics like arrays, binary search, graphs, and dynamic programming, with questions linked to the original problem. Save a sheet to bookmark it in an unlimited list you can browse from the DSA Sheets page, and pin one sheet as your current focus, which surfaces a progress card for it on your Developer Profile. Mark each question Solved, Attempted, or Skipped. Per-topic progress bars show where you are strong and where you need more work. Sheets are downloadable for offline revision before an interview. If you want to work through a sheet together with friends, start or join a Blend for it instead of tracking it alone.",
      steps: [
        { text: "Go to DSA Sheets from the dock." },
        { text: "Browse the available sheets and save the ones you want to keep track of." },
        { text: "Pin one sheet as the one you are actively focused on right now." },
        { text: "Open the sheet to see its topics and questions." },
        { text: "Click a question to open the problem link and a space for a note." },
        { text: "Mark the question Solved, Attempted, or Skipped." },
        { text: "Check the topic progress bars to find weak areas." },
        { text: "Download the sheet for offline revision whenever you need it." },
        { text: "Your overall completion updates automatically on your Developer Profile." },
        { text: "Start or join a Blend if you want to track the same sheet with friends." },
      ],
      whyItMatters: "Seeing you have finished 80 percent of trees but only 30 percent of graphs tells you exactly where to focus your next course or practice session.",
      highlights: [
        "Practice tracking tool, not the primary learning resource",
        "Save any number of sheets, pin exactly one as your dashboard focus",
        "Per-topic progress bars: immediate feedback on where you stand",
        "Three question states: Solved, Attempted, Skipped",
        "Syncs to your Developer Profile automatically",
        "Downloadable for offline revision",
        "Track a sheet with friends by starting or joining a Blend for it",
      ],
      items: [
        { heading: "What is a sheet?",     body: "A curated, topic-wise list of DSA problems for students tracking their preparation for placements. Structured for practice alongside courses, not as a standalone learning system." },
        { heading: "Save vs Pin",          body: "Save bookmarks a sheet in an unlimited list on the DSA Sheets page. Pin puts a single sheet on your Developer Profile with its own progress ring, replacing whichever sheet was pinned before." },
        { heading: "Marking questions",    body: "Mark each question Solved, Attempted, or Skipped. Completion updates in real time." },
        { heading: "Notes per question",   body: "Attach a personal note to any question: approach, edge cases, time complexity." },
        { heading: "Downloading a sheet",  body: "Each sheet can be downloaded for offline revision. Progress will not sync back from the offline copy." },
        { heading: "Practicing with friends", body: "Start or join a Blend for a sheet to see everyone's progress on it side by side, instead of tracking it alone." },
      ],
    },
  },

  // ── 8. Notes
  {
    id: "notes", label: "Notes", icon: StickyNote,
    content: {
      eyebrow: "Feature", title: "Centralized Notes",
      intro: "Notes in Script Valley live next to the problems they belong to, not in a separate app you have to switch to.",
      whatItDoes: "Notes are private to your account, accessible from /notes. The notes page has a sidebar listing every question you have added a note to. The editor supports plain text and basic markdown: headings, bold, lists, code blocks. Notes are auto-associated with the question title and can be edited or deleted at any time.",
      steps: [
        { text: "Open any question inside a DSA sheet." },
        { text: "Click Add Note or open the existing note panel." },
        { text: "Write your approach, data structure rationale, time and space complexity." },
        { text: "Add code blocks with triple backticks to preserve implementations." },
        { text: "Save. The note is immediately available from /notes." },
        { text: "Return to /notes any time to review all notes via the sidebar." },
        { text: "Delete notes you no longer need with the delete button and confirmation dialog." },
      ],
      whyItMatters: "The first time you solve a problem, you write down why your approach works. Six weeks later, before an interview, the note is still there: your reasoning, your edge cases, your code.",
      highlights: [
        "Private by default, notes are never visible to other users",
        "Markdown support: headings, lists, bold, and code blocks",
        "Sidebar navigation: browse all notes by question title without searching",
        "Linked to questions, always connected to the problem they belong to",
      ],
      items: [
        { heading: "Where notes live", body: "Each note is tied to a question title. Access all notes from /notes, which has a sidebar for quick navigation." },
        { heading: "Editing",          body: "Click Edit to enter edit mode. Notes support plain text and markdown: bold, lists, code blocks." },
        { heading: "Deleting",         body: "Delete a note from the note viewer with a confirmation dialog. Deletion is permanent." },
      ],
    },
  },

  // ── 9. Starred Questions
  {
    id: "starred", label: "Starred Questions", icon: Star,
    content: {
      eyebrow: "Feature", title: "Starred Questions",
      intro: "Star a question to save it. Starred questions show up in a dedicated list on your Developer Profile, always accessible and ready to review before an interview.",
      whatItDoes: "Any question inside any DSA sheet can be starred with a single click. Starred questions are saved to a private list on your account. View them from the Starred tab on your Developer Profile. The list shows the question title, sheet, topic, and difficulty. Unstar at any time. Starring is independent from question progress status.",
      steps: [
        { text: "Open any DSA sheet and browse its questions." },
        { text: "Click the star icon next to any question to save it." },
        { text: "The star turns filled to confirm it has been saved." },
        { text: "Navigate to your Developer Profile and open the Starred tab." },
        { text: "Use the list before an interview to review challenging problems." },
        { text: "Click any question title to jump directly to the problem." },
        { text: "Click the star icon again to remove it from your list." },
      ],
      whyItMatters: "Your starred list builds naturally as you work through sheets. By interview time it is already waiting for you.",
      highlights: [
        "One click from anywhere inside a DSA sheet",
        "No limit on how many questions you can star",
        "Separate from progress status: starring and solving are independent",
        "Always accessible from your Developer Profile's starred tab",
      ],
      items: [
        { heading: "Starring a question",        body: "Click the star icon next to any question in any DSA sheet. Saved to your list instantly." },
        { heading: "Viewing starred questions",  body: "Go to your Developer Profile and open the Starred tab." },
        { heading: "Removing a star",            body: "Click the star icon again on any starred question to remove it." },
        { heading: "Independent from progress",  body: "Starring does not change a question's solved, attempted, or skipped status." },
      ],
    },
  },

  // ── 10. Notifications (NEW)
  {
    id: "notifications", label: "Notifications", icon: Bell,
    content: {
      eyebrow: "Feature", title: "Notifications",
      intro: "A notification bell in the navigation bar keeps you posted on anything that happens in your Blends without needing to check back manually.",
      whatItDoes: "When someone joins a Blend you own, requests to join a public Blend of yours, or your own request to join a public Blend is approved or declined, a notification appears in the bell menu. Unread notifications are marked with a dot, and the bell shows a count badge. Clicking a notification marks it read and, where relevant, takes you straight to the Blend it is about.",
      steps: [
        { text: "Click the bell icon in the navigation bar at any time." },
        { text: "Unread notifications are highlighted with a dot next to them." },
        { text: "Click a notification to jump to the relevant Blend and mark it read." },
        { text: "Use Mark all read to clear the unread count in one step." },
      ],
      whyItMatters: "Blend only works as an accountability tool if you actually see what is happening in it. Notifications close that loop without needing a separate email or push notification system.",
      highlights: [
        "Covers Blend activity: joins, join requests, and request approvals or declines",
        "Unread count badge on the bell icon",
        "Clicking a notification jumps straight to the relevant Blend",
      ],
      items: [
        { heading: "What triggers a notification", body: "Someone joining your Blend, someone requesting to join your public Blend, or your own join request being approved or declined." },
        { heading: "Marking as read",               body: "Notifications mark themselves read when clicked, or all at once with Mark all read." },
      ],
    },
  },

  // ── 11. Compiler
  {
    id: "compiler", label: "Compiler", icon: Code2,
    content: {
      eyebrow: "Feature", title: "Compiler with AI Debugging",
      intro: "The Script Valley compiler is a browser-based practice tool. Use it to test ideas while working through a course or DSA sheet, without switching to a separate environment.",
      whatItDoes: "The compiler supports JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, Swift, and Ruby. The editor runs on Monaco, fast and familiar. Every run is saved to your history with the language, timestamp, code, and output. If a run fails, click AI Fix for a plain-English explanation and a corrected version. Optimise mode takes working code and rewrites it to be cleaner, faster, or more idiomatic.",
      steps: [
        { text: "Navigate to the Compiler from the dock after login." },
        { text: "Select a language from the dropdown. The editor switches syntax immediately." },
        { text: "Write your code. The editor supports tab indentation, auto-closing brackets, and multi-cursor editing." },
        { text: "Click Run. Output appears in the panel below, separated into stdout and stderr." },
        { text: "If the run fails, click AI Fix. The assistant explains the error and shows a corrected version." },
        { text: "Accept the fix or make your own changes, then run again." },
        { text: "Once the code is working, click Save as Snippet to save it to your library." },
      ],
      whyItMatters: "Having a place to test code quickly, without setup and with a history of every run, makes it easier to practice alongside a course or problem sheet. The AI layer removes the friction of looking up error messages.",
      highlights: [
        "Practice tool: use it alongside courses and DSA sheets, not as a standalone product",
        "Monaco editor: fast and familiar",
        "Execution history: every run saved with code, language, output, and timestamp",
        "AI Fix: one click to explain an error and return a corrected version",
        "AI Optimise: refactors working code for readability or performance",
      ],
      items: [
        { heading: "Supported languages",  body: "JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, Swift, Ruby, with more planned." },
        { heading: "Execution history",    body: "Every run is saved. Browse past executions, revisit the output, or save any run as a snippet." },
        { heading: "AI Fix",               body: "Click after a failed run to get an instant explanation of the error and a corrected version of your code." },
        { heading: "AI Optimise",          body: "Ask the AI to refactor working code for readability, performance, or idiomatic style." },
        { heading: "Context-aware AI",     body: "The AI always sees your current code, the selected language, and the last output. No copy-pasting context." },
      ],
    },
  },

  // ── 12. Snippets
  {
    id: "snippets", label: "Snippets", icon: FileCode,
    content: {
      eyebrow: "Feature", title: "Code Snippets",
      intro: "Save a piece of code from the compiler, give it a title, and decide whether anyone else can see it.",
      whatItDoes: "Any code execution in the compiler can be saved as a snippet, public or private. Public snippets appear in the global library, searchable by language. Each snippet gets a dedicated URL you can share anywhere. Others can star snippets and leave code-block comments. Your starred count shows on your Developer Profile.",
      steps: [
        { text: "Run any code in the Compiler." },
        { text: "Click Save as Snippet in the output panel." },
        { text: "Enter a descriptive title and choose Public or Private." },
        { text: "Copy the snippet URL from the detail page to share it." },
        { text: "Browse public snippets at /snippets and filter by language." },
        { text: "Star snippets you find useful. They save to your Developer Profile." },
        { text: "Leave a comment on a snippet with feedback or an alternative approach." },
      ],
      whyItMatters: "Over time, your public snippets become a record of real solutions you have written.",
      highlights: [
        "Public and private: full control over visibility per snippet",
        "Shareable URLs: every snippet has a permanent, linkable address",
        "Code-block comments: discussions stay readable with inline syntax highlighting",
        "Starred count on your Developer Profile",
      ],
      items: [
        { heading: "Creating a snippet",  body: "Any code execution can be saved as a snippet. Give it a title, choose public or private, and it is instantly searchable." },
        { heading: "Browsing snippets",   body: "The public snippet library is filterable by language and searchable by title. No account required to browse." },
        { heading: "Starring",            body: "Star snippets you find useful. Your starred count is shown on your Developer Profile." },
        { heading: "Comments",            body: "Leave comments on public snippets. Comments support code blocks for cleaner discussions." },
      ],
    },
  },

  // ── 13. Contests
  {
    id: "contests", label: "Contests", icon: Globe,
    content: {
      eyebrow: "Feature", title: "Upcoming Contests",
      intro: "The Script Valley contest calendar pulls together upcoming competitive programming contests from multiple platforms into one view so you do not have to check each site separately.",
      whatItDoes: "The calendar aggregates contests across platforms and shows them sorted by start time. Each entry includes the contest name, platform, local start time, duration, and a direct registration link. Filter by platform to focus on what matters to you.",
      steps: [
        { text: "Navigate to Contests from the sidebar." },
        { text: "All upcoming contests load sorted by start time." },
        { text: "Use the platform filter to show only the contests you care about." },
        { text: "Check the start time column. Times are shown in your local timezone automatically." },
        { text: "Note the duration to plan whether you have a full block available." },
        { text: "Click the Register link to open the contest's registration page directly." },
        { text: "Check back weekly. The calendar refreshes automatically." },
      ],
      whyItMatters: "One place, your timezone, direct registration link. That is the whole feature.",
      highlights: [
        "Multiple platforms aggregated into one view",
        "Local timezone: start times adjusted automatically, no manual conversion",
        "Direct registration links: one click to the contest page",
        "Platform filtering",
      ],
      items: [
        { heading: "What is shown",  body: "Upcoming contests from multiple platforms in a single aggregated list." },
        { heading: "Filtering",      body: "Filter by platform. Jump straight to the registration page from the calendar." },
        { heading: "Timezones",      body: "All start times shown in your local timezone automatically. No manual conversion needed." },
      ],
    },
  },

  // ── 14. Visualizers
  {
    id: "visualizers", label: "Visualizers", icon: GitBranch,
    content: {
      eyebrow: "Tools", title: "Algorithm Visualizers",
      intro: "Interactive, step-by-step visualizations of sorting and pathfinding algorithms. Useful when you want to see how an algorithm actually works, not just read about it.",
      whatItDoes: "The Sorting Visualizer lets you pick an algorithm, set array size and speed, and watch it step through comparisons and swaps in real time. The Pathfinding Visualizer gives you a grid where you draw walls, optionally generate a maze, then run a graph traversal algorithm and watch it find the shortest path.",
      steps: [
        { text: "Navigate to Sorting Visualizer or Pathfinding Visualizer from the Explore menu." },
        { text: "For sorting: choose an algorithm, set array size and speed." },
        { text: "Click Run. Watch bars highlight as they are compared and swapped." },
        { text: "For pathfinding: click and drag on the grid to draw walls." },
        { text: "Optionally choose a maze generation algorithm to auto-fill the grid." },
        { text: "Select a pathfinding algorithm: Dijkstra, A*, BFS, or DFS." },
        { text: "Click Run. Watch explored cells animate, then the final path highlight." },
      ],
      whyItMatters: "Fifteen seconds of watching BFS work is more effective than re-reading an explanation.",
      highlights: [
        "Sorting Visualizer: Bubble, Quick, Merge, Heap Sort, and more",
        "Pathfinding Visualizer: Dijkstra, A*, BFS, DFS on an interactive grid",
        "Maze generation: auto-generate walls to test pathfinding on complex inputs",
        "Speed control: slow down to understand each step or watch at full speed",
      ],
      items: [
        { heading: "Sorting Visualizer",      body: "Visualize Bubble, Quick, Merge, Heap Sort and more. Control speed and array size in real time." },
        { heading: "Pathfinding Visualizer",  body: "Draw walls, choose a maze generation algorithm, then run Dijkstra, A*, BFS, or DFS." },
        { heading: "Speed and size controls", body: "Both visualizers have speed controls so you can step slowly or watch at full speed." },
      ],
    },
  },

  // ── 15. FAQ
  {
    id: "faq", label: "FAQ", icon: HelpCircle, custom: true,
    content: {
      eyebrow: "Support", title: "FAQ", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 16. Contact
  {
    id: "contact", label: "Contact", icon: Mail, custom: true,
    content: {
      eyebrow: "Support", title: "Contact", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 17. Feedback / Bug
  {
    id: "feedback", label: "Report a Bug", icon: Bug, custom: true,
    content: {
      eyebrow: "Support", title: "Report a Bug", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 18. Privacy Policy
  {
    id: "privacy", label: "Privacy Policy", icon: Shield, custom: true,
    content: {
      eyebrow: "Legal", title: "Privacy Policy", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 19. Terms of Service
  {
    id: "terms", label: "Terms of Service", icon: FileText, custom: true,
    content: {
      eyebrow: "Legal", title: "Terms of Service", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },
];
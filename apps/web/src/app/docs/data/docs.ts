import {
  BarChart3,
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
  { label: "Features",  ids: ["courses", "devprofile", "portfolio", "dsa", "notes", "starred", "compiler", "snippets", "contests", "visualizers"] },
  { label: "Support",   ids: ["faq", "contact", "feedback"] },
  { label: "Legal",     ids: ["privacy", "terms"] },
];

export const DOCS: DocSection[] = [
  // ── 1. Who We Are
  {
    id: "overview", label: "Who We Are", icon: BookOpen,
    content: {
      eyebrow: "Overview", title: "Who We Are",
      intro: "Script Valley is a free, course-first platform for students preparing for placements. The core product is short, focused courses built to be finished. Everything else, the compiler, DSA sheets, notes, and portfolio, is there to support the learning and revision loop.",
      whatItDoes: "Script Valley is built around one idea: if a student can actually finish a course, it is worth more than a longer one they abandon halfway through. Each course covers exactly what shows up in interviews, nothing extra. At 50 percent completion, handwritten notes for that course unlock and become downloadable, so revision does not depend on reopening lessons. Practice tools, progress tracking, and a portfolio builder all live in the same account and connect to the same workflow. There is no upsell, no locked tier, and nothing separate to sign up for.",
      steps: [
        { text: "Visit scriptvalley.com and click Get started." },
        { text: "Sign in with your Google account. No email verification, no onboarding survey." },
        { text: "You land on your Developer Profile, your personal dashboard." },
        { text: "Go to Courses and pick a topic you are preparing for." },
        { text: "Work through the lessons. Progress saves automatically." },
        { text: "Hit 50 percent and download the handwritten notes for that course." },
        { text: "Practice in the Compiler or work through a DSA Sheet for the same topic." },
        { text: "Build your Developer Portfolio when you have work worth sharing." },
      ],
      whyItMatters: "Most students preparing for placements are juggling too many tools with no clear thread between them. Script Valley keeps courses, practice, notes, progress, and portfolio in one place, with the learning always at the center.",
      highlights: [
        "Course-first: short, interview-focused lessons built to be completed",
        "Handwritten notes unlock at 50 percent completion and are downloadable",
        "Free, always: no subscriptions, no trials, no hidden limits",
        "Single sign on: one Google login, everything in one place",
        "Developer Profile and Developer Portfolio are separate by design",
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
      whatItDoes: "Courses are the main feature. They are short, interview-focused, and designed around completion. Handwritten notes unlock at 50 percent and are downloadable, so you have a revision resource that does not depend on rewatching lessons. The rest of the platform, the compiler for testing ideas, DSA sheets for tracking practice, notes linked to questions, a contest calendar, and a portfolio builder, all exist to support that learning loop. Your Developer Profile tracks activity automatically. Your Developer Portfolio is separate, built by hand, and shareable with recruiters.",
      steps: [
        { text: "Pick a Course on a topic you are preparing for and start the first lesson." },
        { text: "Work through lessons. Quizzes inside each course test what you have just covered." },
        { text: "Hit 50 percent completion and download the handwritten notes for that course." },
        { text: "Practice the topic in the Compiler or work through a DSA Sheet." },
        { text: "Add notes to any question you want to remember." },
        { text: "Star questions you want to revisit before an interview." },
        { text: "Check the Contest Calendar to plan your week." },
        { text: "Build your Portfolio when you have projects worth sharing with recruiters." },
      ],
      whyItMatters: "The whole workflow, learning, practice, notes, progress, and portfolio, lives in one account. Nothing is split across tools, and the course is always the starting point.",
      highlights: [
        "Courses: short, focused, interview-only content built to be finished",
        "Handwritten notes unlock at 50 percent completion, downloadable per course",
        "DSA Sheets for tracking practice progress, not the primary learning tool",
        "Compiler for testing ideas while working through a course or problem sheet",
        "Developer Profile tracks activity automatically",
        "Developer Portfolio is a separate, manual page built to share with recruiters",
      ],
      items: [
        { heading: "Courses",               body: "Short, interview-focused lessons. Reach 50 percent and downloadable handwritten notes unlock automatically. The main feature." },
        { heading: "Developer Profile",     body: "Your personal dashboard. Tracks DSA progress, streaks, and activity automatically. Not a portfolio." },
        { heading: "Developer Portfolio",   body: "A placement-focused page you build by hand. Separate from your dashboard, shareable via a permanent URL." },
        { heading: "DSA Sheets",            body: "Curated problem sets for tracking practice. Follow a sheet, mark questions, and progress syncs to your Developer Profile." },
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
      whatItDoes: "Most interview prep gets abandoned halfway through, not because the content is bad, but because there is too much of it. Script Valley courses strip that out. Each one covers a single topic in short lessons with no padding, no detours into theory that does not show up in interviews. Progress tracks automatically as you move through the lessons, and you can stop and resume anytime without losing your place. Quizzes inside each course test what you just covered so the learning sticks. At 50 percent completion, handwritten notes for that course unlock automatically. The notes are written in the same practical, stripped-down style as the lessons. They are downloadable, so revision does not depend on reopening the course. The full loop is: take the course, unlock the notes at 50 percent, finish at your own pace, revise from the downloaded notes before an interview.",
      steps: [
        { text: "Go to Courses and pick one that matches what you are preparing for." },
        { text: "Work through the lessons in order. Each one is short by design." },
        { text: "Take the quiz at the end of each lesson to reinforce what you covered." },
        { text: "Watch your progress update automatically as you go." },
        { text: "Hit 50 percent completion and handwritten notes unlock automatically." },
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
        "Handwritten notes unlock at 50 percent completion, the core feature of every course",
        "Notes are downloadable per course and yours to keep",
        "Built for the learn, then revise loop",
      ],
      items: [
        { heading: "Lesson format",     body: "Each lesson covers one thing and stays short. The goal is finishing the course, not stretching it out." },
        { heading: "Quizzes",           body: "Built into each course to test understanding after each lesson, not just at the end." },
        { heading: "Progress tracking", body: "Saves automatically. Pick up exactly where you left off, no replaying content you have already covered." },
        { heading: "Handwritten notes", body: "The main feature. Unlock at 50 percent completion. Written in the same practical style as the lessons, with no extra theory." },
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
      intro: "Your Developer Profile is your personal dashboard inside Script Valley. It shows where you stand: course progress, DSA sheet completion, streaks, today's problem, and a quick overview of recent activity. It updates automatically. It is not a portfolio and it is not meant to be shared.",
      whatItDoes: "The Progress section shows every DSA sheet you follow, broken down by topic with completion percentages, alongside your course progress. Streaks track how many days in a row you have stayed active. Problem of the Day gives you one fresh question, refreshed daily. Activity Overview pulls together your recent runs, notes, and starred questions in one place. None of this needs to be arranged or designed. It is a fixed dashboard that reflects what you have actually done.",
      steps: [
        { text: "Sign in and go to your Developer Profile." },
        { text: "Start a Course or follow a DSA Sheet to begin tracking progress." },
        { text: "Solve the Problem of the Day to keep your streak going." },
        { text: "Check the Progress section to see course and sheet completion by topic." },
        { text: "Open Activity Overview to see recent runs, notes, and starred questions." },
        { text: "Come back daily. Streak and progress update on their own." },
      ],
      whyItMatters: "A dashboard you have to maintain stops being useful fast. The Developer Profile updates itself from what you actually do, so it stays accurate without extra effort. It is there to show you where you stand, not to be shown to anyone else. If you want a page to share with recruiters, that is what the Developer Portfolio is for.",
      highlights: [
        "A dashboard for tracking your own progress, not a portfolio",
        "Shows course progress alongside DSA sheet completion",
        "Streaks and a daily Problem of the Day keep practice consistent",
        "Updates automatically, nothing to arrange or design",
      ],
      items: [
        { heading: "Course progress",     body: "Courses you have started show up here with completion percentage and the point you left off." },
        { heading: "DSA progress",        body: "Every sheet you follow shows up here with per-topic completion and an overall percentage." },
        { heading: "Streaks",             body: "Tracks consecutive days of activity. Miss a day and the streak resets." },
        { heading: "Problem of the Day",  body: "One question, refreshed daily. Solve it to keep your streak alive." },
        { heading: "Activity overview",   body: "Recent runs, notes, and starred questions in one place." },
        { heading: "Profile vs Portfolio", body: "Your Developer Profile is a private dashboard. Your Developer Portfolio is a separate page you build and share. They are not the same thing." },
      ],
    },
  },

  // ── 5. Developer Portfolio
  {
    id: "portfolio", label: "Portfolio", icon: Briefcase,
    content: {
      eyebrow: "Feature", title: "Developer Portfolio",
      intro: "Your Developer Portfolio is completely separate from your Developer Profile. The Profile is a private dashboard that tracks your progress automatically. The Portfolio is a developer portfolio for students that you build by hand, project by project, to show your best work to recruiters. Nothing appears on it unless you put it there.",
      whatItDoes: "The portfolio builder starts as a blank page. Add the projects you actually want recruiters to see, attach links to live demos or repositories, and decide what goes on the page and what stays off. The layout is minimal by default so the focus stays on the work, not the design. Once published, your portfolio lives at scriptvalley.com/u/username, a permanent URL you can add to a resume or placement application.",
      steps: [
        { text: "Go to Portfolio from your dashboard." },
        { text: "Click Add Project and fill in the title, description, and any relevant links." },
        { text: "Decide what to include and what to leave out. It is entirely up to you." },
        { text: "Reorder projects so your strongest work shows first." },
        { text: "Preview the page exactly as recruiters will see it." },
        { text: "Publish and copy your permanent portfolio URL: scriptvalley.com/u/username." },
        { text: "Update anytime. Nothing is locked once it is live." },
      ],
      whyItMatters: "A page you build yourself shows exactly what you want recruiters to see, nothing more, nothing accidental. For students focused on placements, that control matters.",
      highlights: [
        "Fully manual: nothing appears without you adding it",
        "Separate from your Developer Profile, built to be shared, not just tracked",
        "Minimal design, built for placements",
        "Permanent URL at scriptvalley.com/u/username, ready for a resume or application",
      ],
      items: [
        { heading: "Adding a project",         body: "Add a title, a short description, and links to the repository or live demo." },
        { heading: "Choosing what is visible",  body: "Nothing shows up unless you add it. You control every project and link on the page." },
        { heading: "Portfolio URL",             body: "Your portfolio lives at scriptvalley.com/u/username. One permanent link, ready to share." },
        { heading: "Profile vs Portfolio",      body: "Your Developer Profile tracks progress automatically and is private. Your Developer Portfolio is the page you build to share with recruiters. They serve different purposes." },
      ],
    },
  },

  // ── 6. DSA Sheets
  {
    id: "dsa", label: "DSA Sheets", icon: Trophy,
    content: {
      eyebrow: "Feature", title: "DSA Sheets",
      intro: "DSA Sheets are a practice tracking tool. They give you curated, topic-wise problem sets to work through alongside your courses, and they track your progress automatically. They are not the primary learning tool, courses are.",
      whatItDoes: "Each sheet covers topics like arrays, binary search, graphs, and dynamic programming, with questions linked to the original problem. Follow a sheet and it appears on your Developer Profile. Mark each question Solved, Attempted, or Skipped. Per-topic progress bars show where you are strong and where you need more work. Sheets are downloadable for offline revision before an interview.",
      steps: [
        { text: "Go to DSA Sheets from the dock." },
        { text: "Browse the available sheets and follow one that matches what you are studying." },
        { text: "Open the sheet to see its topics and questions." },
        { text: "Click a question to open the problem link and a space for a note." },
        { text: "Mark the question Solved, Attempted, or Skipped." },
        { text: "Check the topic progress bars to find weak areas." },
        { text: "Download the sheet for offline revision whenever you need it." },
        { text: "Your overall completion updates automatically on your Developer Profile." },
      ],
      whyItMatters: "Seeing you have finished 80 percent of trees but only 30 percent of graphs tells you exactly where to focus your next course or practice session.",
      highlights: [
        "Practice tracking tool, not the primary learning resource",
        "Per-topic progress bars: immediate feedback on where you stand",
        "Three question states: Solved, Attempted, Skipped",
        "Syncs to your Developer Profile automatically",
        "Downloadable for offline revision",
      ],
      items: [
        { heading: "What is a sheet?",     body: "A curated, topic-wise list of DSA problems for students tracking their preparation for placements. Structured for practice alongside courses, not as a standalone learning system." },
        { heading: "Following a sheet",    body: "Follow a sheet from the explore page. Progress shows up on your Developer Profile automatically." },
        { heading: "Marking questions",    body: "Mark each question Solved, Attempted, or Skipped. Completion updates in real time." },
        { heading: "Notes per question",   body: "Attach a personal note to any question: approach, edge cases, time complexity." },
        { heading: "Downloading a sheet",  body: "Each sheet can be downloaded for offline revision. Progress will not sync back from the offline copy." },
      ],
    },
  },

  // ── 7. Notes
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

  // ── 8. Starred Questions
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

  // ── 9. Compiler
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

  // ── 10. Snippets
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

  // ── 11. Contests
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

  // ── 12. Visualizers
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

  // ── 13. FAQ
  {
    id: "faq", label: "FAQ", icon: HelpCircle, custom: true,
    content: {
      eyebrow: "Support", title: "FAQ", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 14. Contact
  {
    id: "contact", label: "Contact", icon: Mail, custom: true,
    content: {
      eyebrow: "Support", title: "Contact", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 15. Feedback / Bug
  {
    id: "feedback", label: "Report a Bug", icon: Bug, custom: true,
    content: {
      eyebrow: "Support", title: "Report a Bug", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 16. Privacy Policy
  {
    id: "privacy", label: "Privacy Policy", icon: Shield, custom: true,
    content: {
      eyebrow: "Legal", title: "Privacy Policy", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },

  // ── 17. Terms of Service
  {
    id: "terms", label: "Terms of Service", icon: FileText, custom: true,
    content: {
      eyebrow: "Legal", title: "Terms of Service", intro: "",
      whatItDoes: "", steps: [], whyItMatters: "", highlights: [], items: [],
    },
  },
];
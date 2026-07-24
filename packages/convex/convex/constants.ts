export const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C", "Go", "Rust",
  "React", "Next.js", "Vue", "Angular", "Svelte",
  "Node.js", "Express", "FastAPI", "Django", "Spring Boot",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase", "Convex",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Linux",
  "Git", "GraphQL", "REST", "gRPC",
  "Tailwind CSS", "CSS", "HTML",
  "React Native", "Flutter",
  "Figma", "Blender",
  "Machine Learning", "PyTorch", "TensorFlow",
] as const;

export const TOOL_SUGGESTIONS = [
  "VS Code", "Figma", "Photoshop", "Illustrator", "After Effects",
  "Premiere Pro", "Notion", "Postman", "Docker Desktop", "DaVinci Resolve",
  "Sketch", "Adobe XD", "Blender", "Linear", "Slack", "GitHub Desktop",
] as const;

export const ACCENT_COLOR_OPTIONS = [
  { key: "blue",    label: "Blue",    hex: "#3A5EFF" },
  { key: "emerald", label: "Emerald", hex: "#10b981" },
  { key: "violet",  label: "Violet",  hex: "#8b5cf6" },
  { key: "rose",    label: "Rose",    hex: "#f43f5e" },
  { key: "amber",   label: "Amber",   hex: "#f59e0b" },
  { key: "cyan",    label: "Cyan",    hex: "#06b6d4" },
] as const;

export type AccentColorKey = (typeof ACCENT_COLOR_OPTIONS)[number]["key"];
export const ACCENT_COLOR_KEYS = ACCENT_COLOR_OPTIONS.map((c) => c.key);
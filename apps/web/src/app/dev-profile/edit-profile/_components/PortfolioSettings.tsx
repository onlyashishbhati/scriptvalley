"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import { useUser, useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Save, Plus, Trash2, FolderGit2, Briefcase, Eye, EyeOff } from "lucide-react";
import {
  SKILL_SUGGESTIONS,
  TOOL_SUGGESTIONS,
} from "../../../../../../../packages/convex/convex/constants";

type PortfolioData = {
  bio?: string | null;
  skills?: string[];
  projects?: DraftProject[];
  experience?: DraftExperience[];
  interests?: string[];
  tools?: string[];
  showStats?: boolean;
};

type DraftProject = {
  id: string;
  title: string;
  description?: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  order: number;
};

type DraftExperience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  order: number;
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">{children}</p>;
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const BIO_MAX = 300;
const MAX_INTERESTS = 12;
const MAX_TOOLS = 16;

const inputCls =
  "w-full h-8 bg-[var(--bg-input)] border border-transparent rounded-md px-3 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none focus:bg-[var(--bg-hover)] focus:border-[var(--border-default)] transition-all duration-100";
const textareaCls =
  "w-full bg-[var(--bg-input)] border border-transparent rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none focus:bg-[var(--bg-hover)] focus:border-[var(--border-default)] transition-all duration-100 resize-none";

export default function PortfolioSettings() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id ?? "";

  const rawPortfolio = useQuery(api.portfolio.getPortfolio, userId ? { userId } : "skip");
  const upsertPortfolio = useMutation(api.portfolio.upsertPortfolio);

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [projects, setProjects] = useState<DraftProject[]>([]);
  const [experience, setExperience] = useState<DraftExperience[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (rawPortfolio !== undefined && !hydrated) {
      const p = rawPortfolio as unknown as PortfolioData | null;
      setBio(p?.bio ?? "");
      setSkills(p?.skills ?? []);
      setProjects(
        (p?.projects ?? []).map((proj) => ({
          id: proj.id,
          title: proj.title,
          description: proj.description ?? "",
          techStack: proj.techStack ?? [],
          liveUrl: proj.liveUrl ?? "",
          githubUrl: proj.githubUrl ?? "",
          order: proj.order,
        })),
      );
      setExperience(
        (p?.experience ?? []).map((exp) => ({
          id: exp.id,
          company: exp.company,
          role: exp.role,
          startDate: exp.startDate,
          endDate: exp.endDate ?? "",
          current: exp.current,
          order: exp.order,
        })),
      );
      setInterests(p?.interests ?? []);
      setTools(p?.tools ?? []);
      setShowStats(p?.showStats ?? true);
      setHydrated(true);
    }
  }, [rawPortfolio, hydrated]);

  function addSkill(skill: string) {
    const clean = skill.trim();
    if (!clean || skills.includes(clean) || skills.length >= 30) return;
    setSkills((s) => [...s, clean]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((s) => s.filter((x) => x !== skill));
  }

  const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase()) && skillInput.length > 0,
  ).slice(0, 6);

  function addInterest(interest: string) {
    const clean = interest.trim();
    if (!clean || interests.includes(clean) || interests.length >= MAX_INTERESTS) return;
    setInterests((i) => [...i, clean]);
    setInterestInput("");
  }

  function removeInterest(interest: string) {
    setInterests((i) => i.filter((x) => x !== interest));
  }

  function addTool(tool: string) {
    const clean = tool.trim();
    if (!clean || tools.includes(clean) || tools.length >= MAX_TOOLS) return;
    setTools((t) => [...t, clean]);
    setToolInput("");
  }

  function removeTool(tool: string) {
    setTools((t) => t.filter((x) => x !== tool));
  }

  const filteredToolSuggestions = TOOL_SUGGESTIONS.filter(
    (s) => !tools.includes(s) && s.toLowerCase().includes(toolInput.toLowerCase()) && toolInput.length > 0,
  ).slice(0, 6);

  function addProject() {
    if (projects.length >= 10) return;
    setProjects((p) => [
      ...p,
      { id: newId(), title: "", description: "", techStack: [], liveUrl: "", githubUrl: "", order: p.length },
    ]);
  }

  function updateProject(id: string, patch: Partial<DraftProject>) {
    setProjects((p) => p.map((proj) => (proj.id === id ? { ...proj, ...patch } : proj)));
  }

  function removeProject(id: string) {
    setProjects((p) => p.filter((proj) => proj.id !== id).map((proj, i) => ({ ...proj, order: i })));
  }

  function addExperience() {
    if (experience.length >= 10) return;
    setExperience((e) => [
      ...e,
      { id: newId(), company: "", role: "", startDate: "", endDate: "", current: false, order: e.length },
    ]);
  }

  function updateExperience(id: string, patch: Partial<DraftExperience>) {
    setExperience((e) => e.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp)));
  }

  function removeExperience(id: string) {
    setExperience((e) => e.filter((exp) => exp.id !== id).map((exp, i) => ({ ...exp, order: i })));
  }

  async function handleSave() {
    if (!isSignedIn || !userId) {
      toast.error("Please sign in.");
      return;
    }

    const incompleteProject = projects.find((p) => !p.title.trim());
    if (incompleteProject) {
      toast.error("Every project needs a title.");
      return;
    }

    const incompleteExp = experience.find((e) => !e.company.trim() || !e.role.trim() || !e.startDate);
    if (incompleteExp) {
      toast.error("Every experience entry needs a company, role, and start date.");
      return;
    }

    setIsSaving(true);
    try {
      try {
        await getToken({ template: "convex" });
      } catch {
        /* noop */
      }

      await upsertPortfolio({
        userId,
        bio,
        skills,
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description || undefined,
          techStack: p.techStack,
          liveUrl: p.liveUrl || undefined,
          githubUrl: p.githubUrl || undefined,
          order: p.order,
        })),
        experience: experience.map((e) => ({
          id: e.id,
          company: e.company,
          role: e.role,
          startDate: e.startDate,
          endDate: e.current ? undefined : e.endDate || undefined,
          current: e.current,
          order: e.order,
        })),
        interests,
        tools,
        showStats,
      });
      toast.success("Portfolio updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!hydrated) {
    return <div className="max-w-xl h-40 rounded-lg bg-[var(--bg-input)] animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="max-w-xl space-y-8 pb-4"
    >
      <div className="space-y-1.5">
        <Label>Bio</Label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
          rows={3}
          placeholder="Full-stack dev who loves clean code and bad puns."
          className={textareaCls}
        />
        <p className="text-[10px] text-[var(--text-disabled)] text-right">{bio.length}/{BIO_MAX}</p>
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="relative">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            placeholder="Type a skill and press Enter"
            className={inputCls}
          />
          {filteredSkillSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-lg overflow-hidden">
              {filteredSkillSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill}`}
                className="text-[var(--text-disabled)] hover:text-red-400/70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label>Interests</Label>
          <span className="text-[10px] text-[var(--text-disabled)]">{interests.length}/{MAX_INTERESTS}</span>
        </div>
        <input
          type="text"
          value={interestInput}
          onChange={(e) => setInterestInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addInterest(interestInput);
            }
          }}
          placeholder="e.g. Gaming, Film Making, Traveling"
          disabled={interests.length >= MAX_INTERESTS}
          className={inputCls}
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {interests.map((interest) => (
            <span
              key={interest}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                aria-label={`Remove ${interest}`}
                className="text-[var(--text-disabled)] hover:text-red-400/70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label>Tools</Label>
          <span className="text-[10px] text-[var(--text-disabled)]">{tools.length}/{MAX_TOOLS}</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTool(toolInput);
              }
            }}
            placeholder="e.g. Figma, VS Code, Docker"
            disabled={tools.length >= MAX_TOOLS}
            className={inputCls}
          />
          {filteredToolSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-lg overflow-hidden">
              {filteredToolSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTool(s)}
                  className="w-full text-left px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tools.map((tool) => (
            <span
              key={tool}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            >
              {tool}
              <button
                type="button"
                onClick={() => removeTool(tool)}
                aria-label={`Remove ${tool}`}
                className="text-[var(--text-disabled)] hover:text-red-400/70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Projects</Label>
          <button
            type="button"
            onClick={addProject}
            disabled={projects.length >= 10}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#3A5EFF] hover:text-[#4a6aff] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        {projects.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border-subtle)] py-6 text-center">
            <FolderGit2 className="w-4 h-4 text-[var(--text-disabled)] mx-auto mb-1.5" />
            <p className="text-xs text-[var(--text-disabled)]">No projects yet</p>
          </div>
        )}

        <div className="space-y-3">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14, delay: idx * 0.03 }}
              className="rounded-lg border border-[var(--border-subtle)] overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-input)] border-b border-[var(--border-default)]">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(project.id, { title: e.target.value })}
                  placeholder="Project title"
                  className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  className="p-1 rounded-md text-[var(--text-faint)] hover:text-red-400/70 hover:bg-red-500/[0.06] transition-colors duration-100 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-3 py-2.5 bg-[var(--bg-base)] space-y-2">
                <textarea
                  value={project.description}
                  onChange={(e) => updateProject(project.id, { description: e.target.value })}
                  placeholder="What does it do?"
                  rows={2}
                  className={textareaCls}
                />
                <input
                  type="text"
                  value={project.techStack.join(", ")}
                  onChange={(e) =>
                    updateProject(project.id, {
                      techStack: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Tech stack: comma separated"
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={project.liveUrl}
                    onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                    placeholder="Live URL"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={project.githubUrl}
                    onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                    placeholder="GitHub URL"
                    className={inputCls}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Experience</Label>
          <button
            type="button"
            onClick={addExperience}
            disabled={experience.length >= 10}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#3A5EFF] hover:text-[#4a6aff] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        {experience.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--border-subtle)] py-6 text-center">
            <Briefcase className="w-4 h-4 text-[var(--text-disabled)] mx-auto mb-1.5" />
            <p className="text-xs text-[var(--text-disabled)]">No experience added yet</p>
          </div>
        )}

        <div className="space-y-3">
          {experience.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14, delay: idx * 0.03 }}
              className="rounded-lg border border-[var(--border-subtle)] overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)]">
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                  placeholder="Role"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  placeholder="Company"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeExperience(exp.id)}
                  className="p-1 rounded-md text-[var(--text-faint)] hover:text-red-400/70 hover:bg-red-500/[0.06] transition-colors duration-100 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-input)] border-t border-[var(--border-default)]">
                <input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  className="flex-1 h-8 bg-transparent border border-[var(--border-subtle)] rounded-md px-2 text-xs text-[var(--text-secondary)] outline-none"
                />
                <span className="text-[10px] text-[var(--text-disabled)]">to</span>
                <input
                  type="month"
                  value={exp.endDate}
                  disabled={exp.current}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  className="flex-1 h-8 bg-transparent border border-[var(--border-subtle)] rounded-md px-2 text-xs text-[var(--text-secondary)] outline-none disabled:opacity-40"
                />
                <label className="flex items-center gap-1.5 text-[10px] text-[var(--text-disabled)] shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: "" })}
                  />
                  Current
                </label>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Public Profile Display</Label>
        <button
          type="button"
          onClick={() => setShowStats((v) => !v)}
          className="w-full flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] px-3 py-2.5 transition-colors duration-100"
        >
          <div className="flex items-center gap-2.5 text-left">
            {showStats ? (
              <Eye className="w-3.5 h-3.5 text-[#3A5EFF] shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
            )}
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Show ScriptValley stats</p>
              <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">
                Streak, problems solved, and badges on your public profile
              </p>
            </div>
          </div>
          <div
            className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-150 ${
              showStats ? "bg-[#3A5EFF]" : "bg-[var(--bg-active)]"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-150 ${
                showStats ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>
        <p className="text-[10px] text-[var(--text-disabled)] px-1">
          Turn this off if you want your portfolio to look like a standalone resume rather than a ScriptValley profile card.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-sm font-medium transition-colors duration-100 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
        <p className="text-xs text-[var(--text-disabled)]">Bio, skills, projects & experience</p>
      </div>
    </motion.div>
  );
}
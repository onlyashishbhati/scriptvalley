"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";

interface NotesData {
  [key: string]: string;
}

interface UseNotesReturn {
  notes: NotesData;
  getNotes: (questionTitle: string) => string;
  updateNotes: (questionTitle: string, notes: string) => Promise<void>;
  deleteNotes: (questionTitle: string) => Promise<void>;
  exportNotes: () => string;
  importNotes: (notesJson: string) => boolean;
  getTotalNotesCount: () => number;
  isLoading: boolean;
  isSaving: boolean;
}

// keep STORAGE_KEY stable across renders by declaring at module scope
const STORAGE_KEY = `thecodeone_question_notes_global`;

export function useNotes(): UseNotesReturn {
  const { user } = useUser();
  const [notes, setNotes] = useState<NotesData>({});
  const [isSaving, setIsSaving] = useState(false);

  const upsertNoteMutation = useMutation(api.notes.upsertNote);
  const deleteNoteMutation = useMutation(api.notes.deleteNote);

  // cast query result into our expected shape (undefined when loading)
  const allUserNotes = useQuery(
    api.notes.getAllNotes,
    user ? { userId: user.id } : "skip"
  ) as NotesData | undefined;
  const isLoading = user ? allUserNotes === undefined : false;

  useEffect(() => {
    if (allUserNotes) {
      setNotes(allUserNotes);
    }
  }, [allUserNotes]);

  useEffect(() => {
    // load local notes for unauthenticated user
    if (!user && !isLoading) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed === "object" && parsed !== null) {
            setNotes(parsed);
          }
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  }, [user, isLoading]); // STORAGE_KEY is stable (module-scope), no need to include

  useEffect(() => {
    // persist local notes when user is not signed in
    if (!user && Object.keys(notes).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch {
        // ignore storage errors
      }
    }
  }, [notes, user]); // STORAGE_KEY stable, no need to include

  const getNotes = (questionTitle: string): string => {
    return notes[questionTitle] || "";
  };

  const updateNotes = async (
    questionTitle: string,
    newNotes: string
  ): Promise<void> => {
    setNotes((prev) => {
      const updated = { ...prev };
      if (newNotes.trim() === "") delete updated[questionTitle];
      else updated[questionTitle] = newNotes;
      return updated;
    });

    if (user) {
      setIsSaving(true);
      try {
        await upsertNoteMutation({
          userId: user.id,
          questionTitle,
          notes: newNotes,
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const deleteNotes = async (questionTitle: string): Promise<void> => {
    setNotes((prev) => {
      const updated = { ...prev };
      delete updated[questionTitle];
      return updated;
    });

    if (user) {
      setIsSaving(true);
      try {
        await deleteNoteMutation({
          userId: user.id,
          questionTitle,
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const exportNotes = (): string => JSON.stringify(notes, null, 2);

  const importNotes = (notesJson: string): boolean => {
    try {
      const parsed = JSON.parse(notesJson);
      if (typeof parsed === "object" && parsed !== null) {
        setNotes(parsed);
        if (!user) {
          try {
            localStorage.setItem(STORAGE_KEY, notesJson);
          } catch {
            // ignore storage errors
          }
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const getTotalNotesCount = (): number => Object.keys(notes).length;

  return {
    notes,
    getNotes,
    updateNotes,
    deleteNotes,
    exportNotes,
    importNotes,
    getTotalNotesCount,
    isLoading,
    isSaving,
  };
}
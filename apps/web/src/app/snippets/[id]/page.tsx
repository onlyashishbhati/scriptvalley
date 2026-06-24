"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { Id } from "../../../../../../packages/convex/convex/_generated/dataModel";
import SnippetLoadingSkeleton from "./_components/SnippetLoadingSkeleton";
import { Clock, Code, MessageSquare, User } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import {
  defineMonacoThemes,
  LANGUAGE_CONFIG,
} from "@/app/playground/_constants";
import CopyButton from "./_components/CopyButton";
import Comments from "./_components/Comments";
import Image from "next/image";
import ShareButton from "./_components/ShareButton";

function SnippetDetailPage() {
  const snippetId = useParams().id;

  const snippet = useQuery(api.snippets.getSnippetById, {
    snippetId: snippetId as Id<"snippets">,
  });
  const comments = useQuery(api.snippets.getComments, {
    snippetId: snippetId as Id<"snippets">,
  });

  if (snippet === undefined) return <SnippetLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <main className="max-w-4xl mx-auto mt-20 px-4 sm:px-6 pb-16">
        <div className="space-y-4">
          <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-md bg-[var(--bg-hover)] flex items-center justify-center shrink-0 p-2">
                  <Image
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] leading-snug">
                    {snippet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--text-faint)]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span>{snippet.userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(snippet._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      <span>{comments?.length ?? 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-hover)] text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  <Code className="w-3 h-3" />
                  {snippet.language}
                </div>
                <ShareButton snippetId={snippet._id} />
              </div>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-base)]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-input)]">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-faint)]">
                <Code className="w-3.5 h-3.5" />
                Source Code
              </div>
              <CopyButton code={snippet.code} />
            </div>
            <Editor
              height="520px"
              language={LANGUAGE_CONFIG[snippet.language].monacoLanguage}
              value={snippet.code}
              theme="vs-dark"
              beforeMount={defineMonacoThemes}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
              }}
            />
          </div>

          <Comments snippetId={snippet._id} />
        </div>
      </main>
    </div>
  );
}

export default SnippetDetailPage;

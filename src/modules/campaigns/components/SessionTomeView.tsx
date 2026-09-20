"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export type NotebookTheme = "parchment" | "demonic" | "shadow" | "sylvan" | "royal";

export type RsvpStatus = "ATTENDING" | "ABSENT" | "MAYBE" | "PENDING";

export type SessionAttendance = {
  id: string;
  userId: string;
  userName: string;
  characterName?: string | null;
  status: RsvpStatus;
};

export type SessionNote = {
  id: string;
  title: string;
  content: string;
  isShared: boolean; // true = Journal de bord public, false = Parchemin privé
  authorName?: string;
  createdAt?: string;
};

type ActionResponse = { ok: boolean; message: string };

type SessionTomeViewProps = {
  campaignId: string;
  campaignTitle: string;
  session: {
    id: string;
    title: string;
    description?: string | null;
    dateTime: string;
    location?: string | null;
  };
  initialTheme?: NotebookTheme;
  attendances: SessionAttendance[];
  notes: SessionNote[];
  currentUserId: string;
  onSaveNote?: (noteId: string | null, data: { title: string; content: string; isShared: boolean }) => Promise<ActionResponse>;
  onDeleteNote?: (noteId: string) => Promise<ActionResponse>;
  onSaveTheme?: (theme: NotebookTheme) => Promise<ActionResponse>;
};

const THEMES: Record<
  NotebookTheme,
  {
    name: string;
    description: string;
    seal: string;
    sealColor: string;
    coverBg: string;
    coverBorder: string;
    pageBg: string;
    pageTexture: string;
    sidebarBg: string;
    textColor: string;
    accentColor: string;
    highlightBorder: string;
    inkButtonBg: string;
    inkButtonText: string;
    runes: string;
  }
> = {
  parchment: {
    name: "Parchemin Ancien",
    description: "Cuir tanné de voyage, pages patinées par le temps.",
    seal: "📜",
    sealColor: "#c4a47c",
    coverBg: "#2c1810",
    coverBorder: "#4a2618",
    pageBg: "#faf4e5",
    pageTexture: "radial-gradient(circle at 10% 20%, rgba(219, 194, 150, 0.35) 0%, transparent 40%), " + "radial-gradient(circle at 90% 80%, rgba(199, 168, 120, 0.45) 0%, transparent 45%)",
    sidebarBg: "#f4eedb",
    textColor: "#2e1d13",
    accentColor: "#8b5a2b",
    highlightBorder: "#c4a47c",
    inkButtonBg: "#5c2e17",
    inkButtonText: "#faeed9",
    runes: "❖ ❖ ❖",
  },
  demonic: {
    name: "Grimoire Démoniaque",
    description: "Peau noircie par les braises et encre rouge sang.",
    seal: "⛧",
    sealColor: "#ef4444",
    coverBg: "#0d0404",
    coverBorder: "#450a0a",
    pageBg: "#120808",
    pageTexture: "radial-gradient(circle at 15% 15%, rgba(185, 28, 28, 0.25) 0%, transparent 50%), " + "radial-gradient(circle at 85% 85%, rgba(127, 29, 29, 0.3) 0%, transparent 40%)",
    sidebarBg: "#180c0c",
    textColor: "#fca5a5",
    accentColor: "#ef4444",
    highlightBorder: "#7f1d1d",
    inkButtonBg: "#7f1d1d",
    inkButtonText: "#fef2f2",
    runes: "⛧ ☠ ⛧",
  },
  shadow: {
    name: "Pacte des Ombres",
    description: "Ténèbres occultes et lueurs arcaniques spectrales.",
    seal: "☾",
    sealColor: "#a855f7",
    coverBg: "#09090b",
    coverBorder: "#27272a",
    pageBg: "#18181b",
    pageTexture: "radial-gradient(circle at 20% 20%, rgba(88, 28, 135, 0.25) 0%, transparent 45%), " + "radial-gradient(circle at 80% 80%, rgba(67, 56, 202, 0.2) 0%, transparent 50%)",
    sidebarBg: "#121215",
    textColor: "#e4e4e7",
    accentColor: "#a855f7",
    highlightBorder: "#52525b",
    inkButtonBg: "#581c87",
    inkButtonText: "#faf5ff",
    runes: "☾ 🜏 ☽",
  },
  sylvan: {
    name: "Tome Sylvestre",
    description: "Écorce protectrice des bosquets et feuilles séchées.",
    seal: "𐇲",
    sealColor: "#74a880",
    coverBg: "#0f2310",
    coverBorder: "#1e3a1e",
    pageBg: "#f2f7ef",
    pageTexture: "radial-gradient(circle at 10% 20%, rgba(167, 201, 160, 0.35) 0%, transparent 40%), " + "radial-gradient(circle at 90% 80%, rgba(143, 185, 137, 0.4) 0%, transparent 45%)",
    sidebarBg: "#e3ede0",
    textColor: "#132314",
    accentColor: "#2d6a4f",
    highlightBorder: "#74a880",
    inkButtonBg: "#1b4332",
    inkButtonText: "#ebf5ed",
    runes: "𐇲 𐇵 𐇲",
  },
  royal: {
    name: "Archives Royales",
    description: "Cuir saphir, sceaux d'or impérial et parchemins d'État.",
    seal: "⚜",
    sealColor: "#d97706",
    coverBg: "#0f172a",
    coverBorder: "#1e293b",
    pageBg: "#f8fafc",
    pageTexture: "radial-gradient(circle at 10% 10%, rgba(203, 213, 225, 0.4) 0%, transparent 40%), " + "radial-gradient(circle at 90% 90%, rgba(217, 119, 6, 0.15) 0%, transparent 50%)",
    sidebarBg: "#edf2f7",
    textColor: "#0f172a",
    accentColor: "#b45309",
    highlightBorder: "#94a3b8",
    inkButtonBg: "#1e3a8a",
    inkButtonText: "#f8fafc",
    runes: "⚜ ♕ ⚜",
  },
};

export function SessionTomeView({ campaignId, campaignTitle, session, initialTheme = "parchment", attendances, notes, onSaveNote, onDeleteNote, onSaveTheme }: SessionTomeViewProps) {
  const [theme, setTheme] = useState<NotebookTheme>(initialTheme);
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "SHARED" | "PRIVATE">("ALL");

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES[theme];

  // Notes filtrées selon l'onglet (Toutes, Partagées, Secrètes)
  const filteredNotes = notes.filter((n) => {
    if (activeTabFilter === "SHARED") return n.isShared;
    if (activeTabFilter === "PRIVATE") return !n.isShared;
    return true;
  });

  const activeNote = notes.find((n) => n.id === selectedNoteId) ?? null;
  const currentIndex = filteredNotes.findIndex((n) => n.id === selectedNoteId);

  const [draft, setDraft] = useState({
    title: activeNote?.title ?? "",
    content: activeNote?.content ?? "",
    isShared: Boolean(activeNote?.isShared),
  });

  // Fermer la pop-up de thème
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const selectPage = (note: SessionNote) => {
    setSelectedNoteId(note.id);
    setIsEditing(false);
    setDraft({
      title: note.title,
      content: note.content,
      isShared: Boolean(note.isShared),
    });
  };

  const handleStartNew = (isSharedDefault = true) => {
    setSelectedNoteId(null);
    setIsEditing(true);
    setDraft({
      title: "",
      content: "",
      isShared: isSharedDefault,
    });
  };

  const handleSelectTheme = (newTheme: NotebookTheme) => {
    setTheme(newTheme);
    setMenuOpen(false);
    if (!onSaveTheme) return;
    startTransition(async () => {
      const res = await onSaveTheme(newTheme);
      if (res.ok) {
        toast.success(`Reliure appliquée : ${THEMES[newTheme].name}`);
      }
    });
  };

  const handleSaveNote = () => {
    if (!draft.title.trim()) {
      toast.error("Veuillez inscrire un titre pour ce feuillet.");
      return;
    }
    if (!onSaveNote) return;

    startTransition(async () => {
      const res = await onSaveNote(selectedNoteId, draft);
      if (res.ok) {
        toast.success("Feuillet consigné dans les annales !");
        setIsEditing(false);
      } else {
        toast.error(res.message || "Impossible de sauvegarder la note.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Navigation fil d'Ariane corrigée pointant vers la campagne */}
      <div className="flex items-center justify-between text-xs font-serif">
        <Link href={`/campaigns/${campaignId}/sessions/${session.id}`} className="flex items-center gap-1.5 font-bold hover:underline" style={{ color: activeTheme.accentColor }}>
          <span>← Retour à la session</span>
          
        </Link>
        <span className="opacity-60">{session.location || "Lieu non spécifié"}</span>
      </div>

      {/* Reliure extérieure du Grimoire */}
      <div
        className="relative mx-auto rounded-2xl p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] border-4 transition-colors duration-500"
        style={{
          backgroundColor: activeTheme.coverBg,
          borderColor: activeTheme.coverBorder,
        }}
      >
        {/* Menu Pop-up Sélecteur de Reliure */}
        <div className="absolute -top-4 right-6 z-30" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-xl transition-transform hover:scale-105 border backdrop-blur-md"
            style={{
              backgroundColor: `${activeTheme.coverBg}ee`,
              borderColor: activeTheme.accentColor,
            }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
              style={{
                backgroundColor: activeTheme.inkButtonBg,
                color: activeTheme.inkButtonText,
              }}
            >
              {activeTheme.seal}
            </span>
            <span className="font-serif text-xs font-bold tracking-wider uppercase" style={{ color: activeTheme.sealColor }}>
              Reliure ▾
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl border p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: `${activeTheme.coverBg}fa`,
                borderColor: activeTheme.accentColor,
              }}
            >
              <div className="px-3 py-2 text-center border-b font-serif" style={{ borderColor: `${activeTheme.accentColor}30` }}>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Reliure du registre</p>
                <h4 className="text-xs font-bold mt-0.5" style={{ color: activeTheme.sealColor }}>
                  Choisir un grimoire
                </h4>
              </div>

              <div className="mt-1 space-y-1">
                {(Object.keys(THEMES) as NotebookTheme[]).map((key) => {
                  const t = THEMES[key];
                  const isSelected = theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTheme(key)}
                      className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? `${t.accentColor}25` : "transparent",
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm"
                        style={{
                          backgroundColor: t.coverBg,
                          borderColor: t.sealColor,
                          color: t.sealColor,
                        }}
                      >
                        {t.seal}
                      </span>
                      <div className="flex-1 font-serif">
                        <p className="text-xs font-bold" style={{ color: t.sealColor }}>
                          {t.name}
                        </p>
                        <p className="text-[10px] text-stone-400 leading-tight mt-0.5">{t.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bannière de Session */}
        <div
          className="mb-4 rounded-xl border p-4 font-serif backdrop-blur-xs transition-colors duration-500"
          style={{
            borderColor: activeTheme.highlightBorder,
            backgroundColor: `${activeTheme.sidebarBg}bb`,
            color: activeTheme.textColor,
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-widest opacity-70">
                  {new Date(session.dateTime).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs opacity-50">·</span>
                <span className="text-sm font-bold" style={{ color: activeTheme.accentColor }}>
                  {new Date(session.dateTime).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-wide">{session.title}</h1>
              {session.description && <p className="mt-1 max-w-2xl text-xs italic opacity-85">« {session.description} »</p>}
            </div>
          </div>
        </div>

        {/* Double-page intérieure : Feuillets de Notes */}
        <div className="grid min-h-[580px] grid-cols-1 overflow-hidden rounded-lg border shadow-2xl transition-colors duration-500 md:grid-cols-[280px_1fr]" style={{ borderColor: activeTheme.highlightBorder }}>
          {/* Sommaire & Filtres */}
          <aside
            className="relative flex flex-col justify-between border-r p-5 font-serif select-none transition-colors duration-500"
            style={{
              backgroundColor: activeTheme.sidebarBg,
              borderColor: activeTheme.highlightBorder,
              color: activeTheme.textColor,
            }}
          >
            <div>
              <div className="mb-4 text-center border-b pb-3" style={{ borderColor: `${activeTheme.accentColor}40` }}>
                <span className="text-base tracking-[0.25em]" style={{ color: activeTheme.accentColor }}>
                  {activeTheme.runes}
                </span>
                <h3 className="mt-1 text-sm font-bold tracking-[0.15em] uppercase">Registres de Session</h3>
              </div>

              {/* Onglets Filtres (Public / Privé) */}
              <div
                className="mb-3 flex rounded-lg border p-0.5 text-xs"
                style={{
                  borderColor: `${activeTheme.accentColor}50`,
                  backgroundColor: activeTheme.pageBg,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("ALL")}
                  className={`flex-1 rounded py-1 font-semibold transition-colors ${activeTabFilter === "ALL" ? "shadow-xs" : "opacity-60 hover:opacity-100"}`}
                  style={{
                    backgroundColor: activeTabFilter === "ALL" ? activeTheme.accentColor : "transparent",
                    color: activeTabFilter === "ALL" ? "#ffffff" : activeTheme.textColor,
                  }}
                >
                  Tous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("SHARED")}
                  className={`flex-1 rounded py-1 font-semibold transition-colors ${activeTabFilter === "SHARED" ? "shadow-xs" : "opacity-60 hover:opacity-100"}`}
                  style={{
                    backgroundColor: activeTabFilter === "SHARED" ? activeTheme.accentColor : "transparent",
                    color: activeTabFilter === "SHARED" ? "#ffffff" : activeTheme.textColor,
                  }}
                >
                  Partagés
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabFilter("PRIVATE")}
                  className={`flex-1 rounded py-1 font-semibold transition-colors ${activeTabFilter === "PRIVATE" ? "shadow-xs" : "opacity-60 hover:opacity-100"}`}
                  style={{
                    backgroundColor: activeTabFilter === "PRIVATE" ? activeTheme.accentColor : "transparent",
                    color: activeTabFilter === "PRIVATE" ? "#ffffff" : activeTheme.textColor,
                  }}
                >
                  Secrets
                </button>
              </div>

              {/* Liste des Feuillets */}
              <ul className="space-y-1.5 text-sm max-h-[360px] overflow-y-auto pr-1">
                {filteredNotes.length === 0 ? (
                  <li className="py-6 text-center text-xs italic opacity-60">Aucun parchemin dans ce registre.</li>
                ) : (
                  filteredNotes.map((note, index) => {
                    const isSelected = note.id === selectedNoteId;
                    return (
                      <li key={note.id}>
                        <button
                          type="button"
                          onClick={() => selectPage(note)}
                          className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-all"
                          style={{
                            backgroundColor: isSelected ? `${activeTheme.accentColor}25` : "transparent",
                            borderLeft: isSelected ? `3px solid ${activeTheme.accentColor}` : "3px solid transparent",
                            fontWeight: isSelected ? "bold" : "normal",
                            color: activeTheme.textColor,
                          }}
                        >
                          <span className="truncate pr-2">
                            <span className="mr-2 font-mono text-xs font-normal" style={{ color: activeTheme.accentColor }}>
                              §{index + 1}
                            </span>
                            {note.title || "Feuillet sans titre"}
                          </span>
                          <span className="text-xs" title={note.isShared ? "Chronique partagée" : "Notes secrètes de PJ"}>
                            {note.isShared ? "✦" : "🔒"}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* Actions de création en bas de sommaire */}
            <div className="border-t pt-4 text-xs flex flex-col gap-2" style={{ borderColor: `${activeTheme.accentColor}30` }}>
              <div className="flex items-center justify-between opacity-80">
                <span>
                  {filteredNotes.length} feuillet{filteredNotes.length > 1 ? "s" : ""}
                </span>
                <span className="text-[10px] italic">✦ Partagé · 🔒 Privé</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStartNew(true)}
                  className="flex-1 rounded py-1.5 font-bold shadow-xs hover:opacity-90 flex items-center justify-center gap-1 border"
                  style={{
                    borderColor: activeTheme.accentColor,
                    color: activeTheme.textColor,
                    backgroundColor: `${activeTheme.accentColor}15`,
                  }}
                >
                  <span>✦</span>
                  <span>Chronique</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartNew(false)}
                  className="flex-1 rounded py-1.5 font-bold shadow-xs hover:opacity-90 flex items-center justify-center gap-1 border"
                  style={{
                    borderColor: activeTheme.accentColor,
                    color: activeTheme.textColor,
                    backgroundColor: `${activeTheme.accentColor}15`,
                  }}
                >
                  <span>🔒</span>
                  <span>Secret</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Volet Droit : Lecture / Rédaction sur Parchemin */}
          <main
            className="relative flex flex-col justify-between p-6 sm:p-8 font-serif transition-colors duration-500"
            style={{
              backgroundColor: activeTheme.pageBg,
              backgroundImage: activeTheme.pageTexture,
              color: activeTheme.textColor,
            }}
          >
            <div className="absolute top-2 left-2 text-xs select-none opacity-40">╔══</div>
            <div className="absolute top-2 right-2 text-xs select-none opacity-40">══╗</div>
            <div className="absolute bottom-2 left-2 text-xs select-none opacity-40">╚══</div>
            <div className="absolute bottom-2 right-2 text-xs select-none opacity-40">══╝</div>

            {activeNote || isEditing ? (
              <div className="relative z-10">
                <div className="mb-5 flex flex-wrap items-center justify-between border-b pb-3" style={{ borderColor: `${activeTheme.accentColor}40` }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider rounded font-bold"
                      style={{
                        borderColor: `${activeTheme.accentColor}60`,
                        backgroundColor: `${activeTheme.accentColor}20`,
                        color: activeTheme.accentColor,
                      }}
                    >
                      {draft.isShared ? "✦ Récit Commun (Public)" : "🔒 Secret de Personnage (Privé)"}
                    </span>
                    {activeNote?.authorName && <span className="text-xs italic opacity-75">Inscrit par {activeNote.authorName}</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing((v) => !v)}
                      className="flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-bold shadow-xs hover:opacity-90"
                      style={{
                        backgroundColor: `${activeTheme.accentColor}20`,
                        borderColor: activeTheme.accentColor,
                        color: activeTheme.textColor,
                      }}
                    >
                      <span>{isEditing ? "📖" : "✍️"}</span>
                      <span>{isEditing ? "Lire" : "Prendre la plume"}</span>
                    </button>

                    {activeNote && onDeleteNote && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Voulez-vous déchirer ce feuillet des registres ?")) {
                            onDeleteNote(activeNote.id);
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-700 underline decoration-dotted"
                      >
                        Déchirer
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="grid gap-4">
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="Titre du récit ou secret de session..."
                      className="border-b-2 bg-transparent text-xl font-bold focus:outline-hidden"
                      style={{
                        borderColor: activeTheme.accentColor,
                        color: activeTheme.textColor,
                      }}
                    />

                    <textarea rows={14} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="Contez le combat contre la liche, les trésors découverts, ou un serment secret..." className="resize-none border-0 bg-transparent text-base leading-relaxed placeholder:italic focus:ring-0 focus:outline-hidden" style={{ color: activeTheme.textColor }} />

                    <div className="flex flex-wrap items-center justify-between border-t pt-3" style={{ borderColor: `${activeTheme.accentColor}30` }}>
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                        <input type="checkbox" checked={draft.isShared} onChange={(e) => setDraft({ ...draft, isShared: e.target.checked })} style={{ accentColor: activeTheme.accentColor }} />
                        <span className="font-semibold">Partager ce récit avec toute la table (Public)</span>
                      </label>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={handleSaveNote}
                        className="rounded px-4 py-1.5 text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                        style={{
                          backgroundColor: activeTheme.inkButtonBg,
                          color: activeTheme.inkButtonText,
                        }}
                      >
                        {isPending ? "Sceau en cours..." : "Apposer le sceau"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold tracking-wide">{activeNote?.title}</h2>
                    <div className="mb-5 flex items-center gap-2 text-xs select-none opacity-40" style={{ color: activeTheme.accentColor }}>
                      <span className="h-px flex-1" style={{ backgroundColor: activeTheme.accentColor }} />
                      <span>{activeTheme.runes}</span>
                      <span className="h-px flex-1" style={{ backgroundColor: activeTheme.accentColor }} />
                    </div>
                    <p className="whitespace-pre-wrap text-base leading-relaxed opacity-95">{activeNote?.content}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center italic py-20 opacity-60">
                <span className="text-4xl mb-3">📜</span>
                <p className="text-lg">Ce parchemin n'attend que votre encre.</p>
                <p className="text-xs mt-1">Sélectionnez un feuillet ou rédigez une nouvelle chronique.</p>
              </div>
            )}

            {/* Pagination inférieure */}
            <footer
              className="relative z-10 mt-8 flex items-center justify-between border-t-2 pt-4 text-xs font-bold"
              style={{
                borderColor: `${activeTheme.accentColor}30`,
                color: activeTheme.textColor,
              }}
            >
              <button type="button" disabled={currentIndex <= 0} onClick={() => selectPage(filteredNotes[currentIndex - 1])} className="group flex items-center gap-2 rounded px-2 py-1 transition-all disabled:opacity-20 hover:bg-black/10">
                <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">« ❮</span>
                <span>Feuillet précédent</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-normal opacity-70">
                <span>❦</span>
                <span className="italic truncate max-w-[200px]">{activeNote?.title ?? "Fin"}</span>
                <span>❦</span>
              </div>

              <button type="button" disabled={currentIndex >= filteredNotes.length - 1 || currentIndex === -1} onClick={() => selectPage(filteredNotes[currentIndex + 1])} className="group flex items-center gap-2 rounded px-2 py-1 transition-all disabled:opacity-20 hover:bg-black/10">
                <span>Feuillet suivant</span>
                <span className="text-lg leading-none transition-transform group-hover:translate-x-1">❯ »</span>
              </button>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
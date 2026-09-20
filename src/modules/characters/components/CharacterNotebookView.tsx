"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import type { Prisma } from "@prisma/client";
import { toast } from "sonner";

type Notebook = Prisma.CharacterNotebookGetPayload<{ include: { attachments: true } }> & {
  isShared?: boolean;
};

type ActionResponse = { ok: boolean; message: string };

export type NotebookTheme = "parchment" | "demonic" | "shadow" | "sylvan" | "royal";

type CharacterNotebookViewProps = {
  characterId: string;
  initialTheme?: string | null;
  notebooks: Notebook[];
  createNoteAction?: (prev: ActionResponse, formData: FormData) => Promise<ActionResponse>;
  updateNoteAction?: (noteId: string, formData: FormData) => Promise<ActionResponse>;
  deleteNoteAction?: (noteId: string) => Promise<ActionResponse>;
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
    pageTexture:
      "radial-gradient(circle at 10% 20%, rgba(219, 194, 150, 0.35) 0%, transparent 40%), " +
      "radial-gradient(circle at 90% 80%, rgba(199, 168, 120, 0.45) 0%, transparent 45%)",
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
    pageTexture:
      "radial-gradient(circle at 15% 15%, rgba(185, 28, 28, 0.25) 0%, transparent 50%), " +
      "radial-gradient(circle at 85% 85%, rgba(127, 29, 29, 0.3) 0%, transparent 40%)",
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
    pageTexture:
      "radial-gradient(circle at 20% 20%, rgba(88, 28, 135, 0.25) 0%, transparent 45%), " +
      "radial-gradient(circle at 80% 80%, rgba(67, 56, 202, 0.2) 0%, transparent 50%)",
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
    pageTexture:
      "radial-gradient(circle at 10% 20%, rgba(167, 201, 160, 0.35) 0%, transparent 40%), " +
      "radial-gradient(circle at 90% 80%, rgba(143, 185, 137, 0.4) 0%, transparent 45%)",
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
    pageTexture:
      "radial-gradient(circle at 10% 10%, rgba(203, 213, 225, 0.4) 0%, transparent 40%), " +
      "radial-gradient(circle at 90% 90%, rgba(217, 119, 6, 0.15) 0%, transparent 50%)",
    sidebarBg: "#edf2f7",
    textColor: "#0f172a",
    accentColor: "#b45309",
    highlightBorder: "#94a3b8",
    inkButtonBg: "#1e3a8a",
    inkButtonText: "#f8fafc",
    runes: "⚜ ♕ ⚜",
  },
};

export function CharacterNotebookView({
  initialTheme,
  notebooks,
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  onSaveTheme,
}: CharacterNotebookViewProps) {
  const [theme, setTheme] = useState<NotebookTheme>(
    (initialTheme && initialTheme in THEMES ? initialTheme : "parchment") as NotebookTheme
  );
  const [selectedId, setSelectedId] = useState<string | null>(notebooks[0]?.id ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES[theme];
  const activeNote = notebooks.find((n) => n.id === selectedId) ?? null;
  const currentIndex = notebooks.findIndex((n) => n.id === selectedId);

  const [draft, setDraft] = useState({
    title: activeNote?.title ?? "",
    subject: activeNote?.subject ?? "Général",
    content: activeNote?.content ?? "",
    isShared: Boolean(activeNote?.isShared),
  });

  // Ferme la pop-up au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const selectPage = (note: Notebook) => {
    setSelectedId(note.id);
    setIsEditing(false);
    setDraft({
      title: note.title,
      subject: note.subject,
      content: note.content,
      isShared: Boolean(note.isShared),
    });
  };

  const handleStartNew = () => {
    setSelectedId(null);
    setIsEditing(true);
    setDraft({
      title: "",
      subject: "Général",
      content: "",
      isShared: false,
    });
  };

  const handleSelectTheme = (newTheme: NotebookTheme) => {
    setTheme(newTheme);
    setMenuOpen(false);
    if (!onSaveTheme) return;
    startTransition(async () => {
      const res = await onSaveTheme(newTheme);
      if (!res.ok) {
        toast.error("Impossible de conserver la reliure.");
      } else {
        toast.success(`Reliure changée : ${THEMES[newTheme].name}`);
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const data = new FormData();
      data.append("title", draft.title);
      data.append("subject", draft.subject);
      data.append("content", draft.content);
      if (draft.isShared) data.append("isShared", "on");

      if (selectedId && updateNoteAction) {
        const res = await updateNoteAction(selectedId, data);
        if (res.ok) {
          toast.success("Feuillet consigné !");
          setIsEditing(false);
        } else {
          toast.error(res.message);
        }
      } else if (!selectedId && createNoteAction) {
        const res = await createNoteAction({ ok: false, message: "" }, data);
        if (res.ok) {
          toast.success("Nouveau feuillet scellé !");
          setIsEditing(false);
        } else {
          toast.error(res.message);
        }
      }
    });
  };

  return (
    <section className="mt-8">
      {/* Reliure extérieure du Grimoire */}
      <div
        className="relative mx-auto max-w-5xl rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 transition-colors duration-500"
        style={{
          backgroundColor: activeTheme.coverBg,
          borderColor: activeTheme.coverBorder,
        }}
      >
        {/* Sceau / Bouton Pop-up de Reliure */}
        <div className="absolute -top-4 right-6 z-30" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            title="Changer la reliure du grimoire"
            className="group flex items-center gap-2 rounded-full px-3 py-1.5 shadow-xl transition-all hover:scale-105 border backdrop-blur-md"
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
            <span
              className="font-serif text-xs font-semibold tracking-wider uppercase"
              style={{ color: activeTheme.sealColor }}
            >
              Reliure ▾
            </span>
          </button>

          {/* Pop-up médiévale */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl border p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: `${activeTheme.coverBg}fa`,
                borderColor: activeTheme.accentColor,
              }}
            >
              <div
                className="px-3 py-2 text-center border-b font-serif"
                style={{ borderColor: `${activeTheme.accentColor}30` }}
              >
                <p className="text-[11px] uppercase tracking-widest text-stone-400">
                  Envoûtement de reliure
                </p>
                <h4 className="text-sm font-bold mt-0.5" style={{ color: activeTheme.sealColor }}>
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
                      className="group flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors"
                      style={{
                        backgroundColor: isSelected ? `${t.accentColor}25` : "transparent",
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm shadow-xs"
                        style={{
                          backgroundColor: t.coverBg,
                          borderColor: t.sealColor,
                          color: t.sealColor,
                        }}
                      >
                        {t.seal}
                      </span>
                      <div className="flex-1 font-serif">
                        <p
                          className={`text-xs font-bold ${
                            isSelected ? "underline decoration-dotted" : ""
                          }`}
                          style={{ color: t.sealColor }}
                        >
                          {t.name}
                        </p>
                        <p className="text-[11px] text-stone-400 leading-tight mt-0.5">
                          {t.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Double-page intérieure */}
        <div
          className="grid min-h-[580px] grid-cols-1 overflow-hidden rounded-lg border shadow-2xl transition-colors duration-500 md:grid-cols-[270px_1fr]"
          style={{ borderColor: activeTheme.highlightBorder }}
        >
          {/* Sommaire */}
          <aside
            className="relative flex flex-col justify-between border-r p-5 font-serif select-none transition-colors duration-500"
            style={{
              backgroundColor: activeTheme.sidebarBg,
              borderColor: activeTheme.highlightBorder,
              color: activeTheme.textColor,
            }}
          >
            <div>
              <div
                className="mb-4 text-center border-b pb-3"
                style={{ borderColor: `${activeTheme.accentColor}40` }}
              >
                <span className="text-base tracking-[0.25em]" style={{ color: activeTheme.accentColor }}>
                  {activeTheme.runes}
                </span>
                <h3
                  className="mt-1 text-sm font-bold tracking-[0.15em] uppercase"
                  style={{ color: activeTheme.textColor }}
                >
                  Index des Feuillets
                </h3>
              </div>

              <ul className="space-y-1.5 text-sm">
                {notebooks.map((note, index) => {
                  const isSelected = note.id === selectedId;
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
                          <span
                            className="mr-2 font-mono text-xs font-normal"
                            style={{ color: activeTheme.accentColor }}
                          >
                            §{index + 1}
                          </span>
                          {note.title || "Feuillet sans nom"}
                        </span>
                        {note.isShared && (
                          <span
                            className="text-[11px] font-sans font-semibold"
                            style={{ color: activeTheme.accentColor }}
                            title="Partagé"
                          >
                            ✦
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div
              className="border-t pt-4 text-xs flex items-center justify-between"
              style={{ borderColor: `${activeTheme.accentColor}30` }}
            >
              <span className="italic opacity-80">
                {notebooks.length} feuillet{notebooks.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={handleStartNew}
                className="flex items-center gap-1 font-bold hover:underline"
                style={{ color: activeTheme.accentColor }}
              >
                <span>🖋️</span>
                <span>Nouvelle entrée</span>
              </button>
            </div>
          </aside>

          {/* Volet Droit : Page de lecture / écriture */}
          <main
            className="relative flex flex-col justify-between p-6 sm:p-8 font-serif transition-colors duration-500"
            style={{
              backgroundColor: activeTheme.pageBg,
              backgroundImage: activeTheme.pageTexture,
              color: activeTheme.textColor,
            }}
          >
            {/* Coins ouvragés */}
            <div className="absolute top-2 left-2 text-xs select-none opacity-40">╔══</div>
            <div className="absolute top-2 right-2 text-xs select-none opacity-40">══╗</div>
            <div className="absolute bottom-2 left-2 text-xs select-none opacity-40">╚══</div>
            <div className="absolute bottom-2 right-2 text-xs select-none opacity-40">══╝</div>

            {activeNote || isEditing ? (
              <div className="relative z-10">
                {/* En-tête */}
                <div
                  className="mb-5 flex flex-wrap items-center justify-between border-b pb-3"
                  style={{ borderColor: `${activeTheme.accentColor}40` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider rounded"
                      style={{
                        borderColor: `${activeTheme.accentColor}60`,
                        backgroundColor: `${activeTheme.accentColor}20`,
                        color: activeTheme.accentColor,
                      }}
                    >
                      {draft.subject || "Chronique"}
                    </span>
                    {activeNote && (
                      <span className="text-xs italic opacity-75">
                        Feuillet {currentIndex + 1} de {notebooks.length}
                      </span>
                    )}
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
                    {activeNote && deleteNoteAction && (
                      <button
                        type="button"
                        onClick={() => deleteNoteAction(activeNote.id)}
                        className="text-xs text-red-500 hover:text-red-700 underline decoration-dotted"
                      >
                        Déchirer
                      </button>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                {isEditing ? (
                  <div className="grid gap-4">
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      placeholder="Titre du récit ou de la missive..."
                      className="border-b-2 bg-transparent text-xl font-bold focus:outline-hidden"
                      style={{
                        borderColor: activeTheme.accentColor,
                        color: activeTheme.textColor,
                      }}
                    />
                    <textarea
                      rows={14}
                      value={draft.content}
                      onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      placeholder="Inscrivez les faits d'armes, malédictions ou serments..."
                      className="resize-none border-0 bg-transparent text-base leading-relaxed placeholder:italic focus:ring-0 focus:outline-hidden"
                      style={{
                        color: activeTheme.textColor,
                      }}
                    />
                    <div
                      className="flex flex-wrap items-center justify-between border-t pt-3"
                      style={{ borderColor: `${activeTheme.accentColor}30` }}
                    >
                      <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={draft.isShared}
                          onChange={(e) => setDraft({ ...draft, isShared: e.target.checked })}
                          style={{ accentColor: activeTheme.accentColor }}
                        />
                        <span>Partager avec la confrérie (visible du groupe)</span>
                      </label>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={handleSave}
                        className="rounded px-4 py-1.5 text-xs font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                        style={{
                          backgroundColor: activeTheme.inkButtonBg,
                          color: activeTheme.inkButtonText,
                        }}
                      >
                        {isPending ? "Apposition..." : "Apposer le sceau"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-4 text-2xl font-bold tracking-wide">{activeNote?.title}</h2>

                    {/* Séparateur runique */}
                    <div
                      className="mb-5 flex items-center gap-2 text-xs select-none opacity-40"
                      style={{ color: activeTheme.accentColor }}
                    >
                      <span className="h-px flex-1" style={{ backgroundColor: activeTheme.accentColor }} />
                      <span>{activeTheme.runes}</span>
                      <span className="h-px flex-1" style={{ backgroundColor: activeTheme.accentColor }} />
                    </div>

                    <p className="whitespace-pre-wrap text-base leading-relaxed opacity-90">
                      {activeNote?.content}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center italic py-16 opacity-60">
                <span className="text-3xl mb-2">📜</span>
                <p>Ce feuillet est vierge.</p>
                <p className="text-xs mt-1">Tournez une page ou commencez à écrire.</p>
              </div>
            )}

            {/* Navigation inférieure */}
            <footer
              className="relative z-10 mt-8 flex items-center justify-between border-t-2 pt-4 text-xs font-bold"
              style={{
                borderColor: `${activeTheme.accentColor}30`,
                color: activeTheme.textColor,
              }}
            >
              <button
                type="button"
                disabled={currentIndex <= 0}
                onClick={() => selectPage(notebooks[currentIndex - 1])}
                className="group flex items-center gap-2 rounded px-2 py-1 transition-all disabled:opacity-20 hover:bg-black/10"
              >
                <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">« ❮</span>
                <span>Feuillet précédent</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-normal opacity-70">
                <span>❦</span>
                <span className="italic truncate max-w-[200px]">{activeNote?.title ?? "Fin"}</span>
                <span>❦</span>
              </div>

              <button
                type="button"
                disabled={currentIndex >= notebooks.length - 1}
                onClick={() => selectPage(notebooks[currentIndex + 1])}
                className="group flex items-center gap-2 rounded px-2 py-1 transition-all disabled:opacity-20 hover:bg-black/10"
              >
                <span>Feuillet suivant</span>
                <span className="text-lg leading-none transition-transform group-hover:translate-x-1">❯ »</span>
              </button>
            </footer>
          </main>
        </div>
      </div>
    </section>
  );
}
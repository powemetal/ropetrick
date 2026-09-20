"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type CalendarEventItem = {
  id: string;
  title: string;
  dateTime: string;
  status?: string;
  campaignId: string;
  campaignTitle: string;
  campaignColor: string;
};

type DashboardCalendarProps = {
  events: CalendarEventItem[];
};

const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DashboardCalendar({ events }: DashboardCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());

  // Découpage en semaines de 7 jours pour un affichage en grille tabulaire propre
  const { weeks, monthLabel, scheduleMap } = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const startDayOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - startDayOffset);

    const endDay = monthEnd.getDay();
    const endDayOffset = endDay === 0 ? 0 : 7 - endDay;
    const gridEnd = new Date(monthEnd);
    gridEnd.setDate(gridEnd.getDate() + endDayOffset);

    const allDays: Date[] = [];
    const cur = new Date(gridStart);
    while (cur <= gridEnd) {
      allDays.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    const calculatedWeeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      calculatedWeeks.push(allDays.slice(i, i + 7));
    }

    const map: Record<string, CalendarEventItem[]> = {};
    for (const event of events) {
      const d = new Date(event.dateTime);
      const key = toDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(event);
    }

    const label = monthStart.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    return { weeks: calculatedWeeks, monthLabel: label, scheduleMap: map };
  }, [currentYear, currentMonth, events]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <section className="space-y-4">
      {/* Barre de navigation mois/année */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--dnd-ink)" }}>
            Calendrier des parties
          </h2>
          <p className="text-xs font-semibold capitalize" style={{ color: "var(--dnd-accent)" }}>
            {monthLabel}
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-xs"
          style={{
            borderColor: "var(--dnd-accent-soft, #44403c)",
            background: "var(--dnd-surface)",
          }}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded border px-2.5 py-1.5 font-semibold transition-opacity hover:opacity-80"
            style={{
              borderColor: "var(--dnd-accent-soft, #44403c)",
              background: "var(--dnd-background)",
              color: "var(--dnd-ink)",
            }}
          >
            ← Mois précédent
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded border px-2.5 py-1.5 font-semibold transition-opacity hover:opacity-80"
            style={{
              borderColor: "var(--dnd-accent-soft, #44403c)",
              background: "var(--dnd-background)",
              color: "var(--dnd-ink)",
            }}
          >
            Mois suivant →
          </button>

          <div className="flex items-center gap-1.5">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              aria-label="Sélectionner le mois"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--dnd-accent-soft, #44403c)",
                background: "var(--dnd-background)",
                color: "var(--dnd-ink)",
              }}
            >
              {monthNames.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              aria-label="Sélectionner l'année"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--dnd-accent-soft, #44403c)",
                background: "var(--dnd-background)",
                color: "var(--dnd-ink)",
              }}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau structuré du calendrier */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table
          className="w-full table-fixed border-collapse"
          style={{
            border: "1px solid var(--dnd-accent-soft, #44403c)",
            backgroundColor: "var(--dnd-surface)",
          }}
        >
          <thead>
            <tr>
              {dayNames.map((day) => (
                <th
                  key={day}
                  className="py-2.5 px-2 text-center text-xs font-bold uppercase tracking-wider"
                  style={{
                    border: "1px solid var(--dnd-accent-soft, #44403c)",
                    color: "var(--dnd-ink)",
                    backgroundColor: "var(--dnd-surface)",
                  }}
                >
                  <span className="hidden md:inline">{day}</span>
                  <span className="md:hidden">{day.slice(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day) => {
                  const key = toDateKey(day);
                  const dayEvents = scheduleMap[key] ?? [];
                  const isCurrentMonth = day.getMonth() === currentMonth;
                  const isToday = key === toDateKey(today);

                  return (
                    <td
                      key={key}
                      className="h-28 p-2 align-top transition-colors"
                      style={{
                        border: "1px solid var(--dnd-accent-soft, #44403c)",
                        backgroundColor: isCurrentMonth ? "var(--dnd-surface)" : "var(--dnd-background)",
                        opacity: isCurrentMonth ? 1 : 0.45,
                      }}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: isToday ? "var(--dnd-accent)" : "transparent",
                            color: isToday ? "#ffffff" : "var(--dnd-ink)",
                          }}
                        >
                          {day.getDate()}
                        </span>

                        {dayEvents.length > 0 && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                            style={{
                              border: "1px solid var(--dnd-accent-soft, #44403c)",
                              color: "var(--dnd-ink)",
                            }}
                          >
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Événements du jour */}
                      <div className="space-y-1.5">
                        {dayEvents.slice(0, 3).map((game) => {
                          const isCancelled = game.status === "CANCELLED";

                          return (
                            <div
                              key={game.id}
                              className="group/card relative flex flex-col overflow-hidden rounded-md border text-left transition-all hover:brightness-110"
                              style={{
                                borderLeft: `3px solid ${isCancelled ? "#dc2626" : game.campaignColor}`,
                                borderTop: "1px solid var(--dnd-accent-soft, #44403c)",
                                borderRight: "1px solid var(--dnd-accent-soft, #44403c)",
                                borderBottom: "1px solid var(--dnd-accent-soft, #44403c)",
                                backgroundColor: isCancelled ? "rgba(220, 38, 38, 0.12)" : "var(--dnd-surface)",
                              }}
                            >
                              {/* 1. LIEN DU HAUT : Vers la fenêtre de session */}
                              <Link
                                href={`/campaigns/${game.campaignId}/sessions/${game.id}`}
                                title={`Ouvrir la session : ${game.title}`}
                                className="p-1.5 transition-colors hover:bg-white/5"
                              >
                                <div className="flex items-center gap-1.5">
                                  {isCancelled ? (
                                    <span
                                      title="Session annulée"
                                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-600 text-xs font-black text-white shadow-xs"
                                    >
                                      ❌
                                    </span>
                                  ) : (
                                    <span
                                      className="rounded px-1 py-0.5 text-[9px] font-bold"
                                      style={{
                                        backgroundColor: "var(--dnd-background)",
                                        color: "var(--dnd-accent)",
                                      }}
                                    >
                                      {new Date(game.dateTime).toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}

                                  <span
                                    className={`truncate text-[11px] font-bold leading-tight hover:underline ${
                                      isCancelled ? "text-red-400 line-through decoration-red-500 decoration-2" : ""
                                    }`}
                                    style={{ color: isCancelled ? undefined : "var(--dnd-ink)" }}
                                  >
                                    {game.title.replace(/Session de campagne/gi, "Session")}
                                  </span>
                                </div>
                              </Link>

                              {/* Séparateur fin */}
                              <div
                                className="h-px w-full"
                                style={{ backgroundColor: "var(--dnd-accent-soft, #44403c)" }}
                              />

                              {/* 2. LIEN DU BAS : Vers la campagne */}
                              <Link
                                href={`/campaigns/${game.campaignId}`}
                                title={`Accéder à la campagne : ${game.campaignTitle}`}
                                className="flex items-center justify-between px-1.5 py-1 text-[9px] font-medium transition-colors hover:bg-white/5"
                                style={{
                                  backgroundColor: isCancelled ? "rgba(153, 27, 27, 0.25)" : "var(--dnd-background)",
                                  color: isCancelled ? "#fca5a5" : "var(--dnd-muted)",
                                }}
                              >
                                <span className="truncate hover:underline">
                                  {game.campaignTitle}
                                </span>
                                <span className="opacity-80 text-[8px] uppercase tracking-wider font-bold">
                                  {isCancelled ? "✕ Annulée" : "Campagne"}
                                </span>
                              </Link>
                            </div>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <p
                            className="text-[10px] font-semibold text-center"
                            style={{ color: "var(--dnd-muted)" }}
                          >
                            +{dayEvents.length - 3} autre{dayEvents.length - 3 > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
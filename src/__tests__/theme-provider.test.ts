/** @vitest-environment jsdom */

import { describe, expect, it, beforeEach } from "vitest";
import { applyThemeToDocument } from "@/styles/theme-provider";

describe("theme bootstrap", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.className = "";
    window.localStorage.clear();
  });

  it("applies a global theme to the root element and keeps it in sync", () => {
    applyThemeToDocument("light-parchment");

    expect(document.documentElement.dataset.theme).toBe("light-parchment");
    expect(document.documentElement.classList.contains("light-parchment")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--theme-accent")).toBe("#8b5a2b");
  });
});

"use client";

import { createContext, useContext } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

interface I18nContext {
  locale: Locale;
  dict: Dictionary;
}

const Ctx = createContext<I18nContext | null>(null);

/** Threads the server-loaded dictionary into the client component tree. */
export default function I18nProvider({
  locale,
  dict,
  children,
}: I18nContext & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, dict }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

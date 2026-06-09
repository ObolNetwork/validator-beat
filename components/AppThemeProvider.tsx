"use client";

import {
  ThemeProvider,
  type ThemeProviderProps,
} from "next-themes";

export function AppThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}

"use client"

import { store } from "@/store";
import { Provider } from "react-redux";
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <Provider store={store}>
        {children}
      </Provider>
    </NextThemesProvider>
  )
}

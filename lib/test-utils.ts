import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import type { ReactElement } from "react"

// Create a custom render function that includes providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider defaultTheme="light" storageKey="masterin-theme">
        {children}
      </ThemeProvider>
    ),
    ...options,
  })
}

// Re-export everything from testing-library
export * from "@testing-library/react"

// Override the render method
export { customRender as render }

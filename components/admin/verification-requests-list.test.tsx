import { render, screen, fireEvent } from "@testing-library/react"
import { VerificationRequestsList } from "./verification-requests-list"
import { supabase } from "@/lib/auth"

// Mock the supabase client and its methods
jest.mock("@/lib/auth", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}))

describe("VerificationRequestsList Component", () => {
  it("renders without crashing", () => {
    ;(supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    }))

    render(<VerificationRequestsList status="pending" />)
    expect(screen.getByText("No pending requests")).toBeInTheDocument()
  })

  it("displays loading state when fetching data", () => {
    ;(supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => new Promise(() => {})), // Never resolves
          })),
        })),
      })),
    }))

    render(<VerificationRequestsList status="pending" />)
    expect(screen.getByText("Loading verification requests...")).toBeInTheDocument()
  })

  it("displays requests when data is loaded", async () => {
    const mockData = [
      {
        id: "1",
        institution: "Test University",
        credentials: "Test Credentials",
        created_at: new Date().toISOString(),
        profiles: { full_name: "Test User", email: "test@example.com" },
      },
    ]
    ;(supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    }))

    render(<VerificationRequestsList status="pending" />)
    await screen.findByText("Test University")
    expect(screen.getByText("Test User")).toBeInTheDocument()
  })

  it("displays an error message when fetching data fails", async () => {
    ;(supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: null, error: new Error("Failed to fetch") })),
          })),
        })),
      })),
    }))

    render(<VerificationRequestsList status="pending" />)
    await screen.findByText("Failed to load verification requests")
  })

  it("calls handleBatchAction when Approve Selected button is clicked", async () => {
    const mockData = [
      {
        id: "1",
        institution: "Test University",
        credentials: "Test Credentials",
        created_at: new Date().toISOString(),
        profiles: { full_name: "Test User", email: "test@example.com" },
      },
    ]
    ;(supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    }))

    render(<VerificationRequestsList status="pending" />)
    await screen.findByText("Test University")

    const approveButton = screen.getByText("Approve Selected")
    fireEvent.click(approveButton)
  })
})

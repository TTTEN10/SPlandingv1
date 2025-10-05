import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import JoinOurWaitlist from '../JoinOurWaitlist'

// Mock fetch
;(globalThis as any).fetch = vi.fn()

// Mock the Header and Footer components since they're not the focus of this test
vi.mock('../Header', () => ({
  default: ({ showBackButton }: { showBackButton?: boolean }) => (
    <header data-testid="header">
      Header {showBackButton && '(with back button)'}
    </header>
  )
}))

vi.mock('../Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}))

// Wrapper component to provide Router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('JoinOurWaitlist Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the waitlist form correctly', () => {
    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    // Check main heading (text is split across spans)
    expect(screen.getByText(/join our/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/waitlist/i)
    expect(screen.getByText(/be the first to experience/i)).toBeInTheDocument()
    
    // Check form elements
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/consent/i)).toBeInTheDocument()
    
    // Check submit button
    expect(screen.getByRole('button', { name: /join waitlist/i })).toBeInTheDocument()
    
    // Check privacy policy link
    expect(screen.getByRole('link', { name: /security and privacy policy/i })).toBeInTheDocument()
  })

  it('handles input changes correctly', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    const fullNameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const roleSelect = screen.getByLabelText(/i am a/i)
    const consentCheckbox = screen.getByLabelText(/consent/i)
    
    // Test text input
    await user.type(fullNameInput, 'John Doe')
    expect(fullNameInput).toHaveValue('John Doe')
    
    // Test email input
    await user.type(emailInput, 'john@example.com')
    expect(emailInput).toHaveValue('john@example.com')
    
    // Test select
    await user.selectOptions(roleSelect, 'therapist')
    expect(roleSelect).toHaveValue('therapist')
    
    // Test checkbox
    await user.click(consentCheckbox)
    expect(consentCheckbox).toBeChecked()
  })

  it('submits valid form successfully', async () => {
    const user = userEvent.setup()
    const mockResponse = { success: true, message: 'Successfully joined waitlist!' }
    
    ;((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'client')
    await user.click(screen.getByLabelText(/consent/i))
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /join waitlist/i }))
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Successfully joined waitlist!')).toBeInTheDocument()
    })
    
    // Check API call
    expect((globalThis as any).fetch).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        consentGiven: true
      }),
    })
    
    // Check form is reset
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue('')
      expect(screen.getByLabelText(/email address/i)).toHaveValue('')
      expect(screen.getByLabelText(/i am a/i)).toHaveValue('')
      expect(screen.getByLabelText(/consent/i)).not.toBeChecked()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    const mockResponse = { success: false, message: 'Email already exists' }
    
    ;((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com')
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'client')
    await user.click(screen.getByLabelText(/consent/i))
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /join waitlist/i }))
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    const user = userEvent.setup()
    
    ;((globalThis as any).fetch as any).mockRejectedValueOnce(new Error('Network error'))

    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'client')
    await user.click(screen.getByLabelText(/consent/i))
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /join waitlist/i }))
    
    // Check network error message
    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock fetch that never resolves to test loading state
    ;((globalThis as any).fetch as any).mockImplementationOnce(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'client')
    await user.click(screen.getByLabelText(/consent/i))
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /join waitlist/i }))
    
    // Check loading state
    expect(screen.getByText('Joining...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /joining/i })).toBeDisabled()
    
    // Check all form inputs are disabled
    expect(screen.getByLabelText(/full name/i)).toBeDisabled()
    expect(screen.getByLabelText(/email address/i)).toBeDisabled()
    expect(screen.getByLabelText(/i am a/i)).toBeDisabled()
    expect(screen.getByLabelText(/consent/i)).toBeDisabled()
  })

  it('trims whitespace from inputs', async () => {
    const user = userEvent.setup()
    const mockResponse = { success: true, message: 'Successfully joined waitlist!' }
    
    ;((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    // Fill out the form with whitespace
    await user.type(screen.getByLabelText(/full name/i), '  John Doe  ')
    await user.type(screen.getByLabelText(/email address/i), '  JOHN@EXAMPLE.COM  ')
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'client')
    await user.click(screen.getByLabelText(/consent/i))
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /join waitlist/i }))
    
    // Check that whitespace was trimmed and email was lowercased
    expect((globalThis as any).fetch).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        consentGiven: true
      }),
    })
  })

  it('validates required fields with HTML5 validation', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    const submitButton = screen.getByRole('button', { name: /join waitlist/i })
    const fullNameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const roleSelect = screen.getByLabelText(/i am a/i)
    const consentCheckbox = screen.getByLabelText(/consent/i)
    
    // Test empty form - HTML5 validation should prevent submission
    await user.click(submitButton)
    expect(fullNameInput).toBeInvalid()
    
    // Fill in full name, test missing email
    await user.type(fullNameInput, 'John Doe')
    await user.click(submitButton)
    expect(emailInput).toBeInvalid()
    
    // Fill in email, test missing role
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    expect(roleSelect).toBeInvalid()
    
    // Select role, test missing consent
    await user.selectOptions(roleSelect, 'client')
    await user.click(submitButton)
    expect(consentCheckbox).toBeInvalid()
  })

  it('shows custom validation for whitespace-only input', async () => {
    const user = userEvent.setup()
    
    // Mock fetch to simulate successful API call
    ;((globalThis as any).fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Success' }),
    })

    render(
      <TestWrapper>
        <JoinOurWaitlist />
      </TestWrapper>
    )
    
    const submitButton = screen.getByRole('button', { name: /join waitlist/i })
    
    // Fill in fields but use whitespace-only name to trigger custom validation
    const fullNameInput = screen.getByLabelText(/full name/i)
    await user.type(fullNameInput, '   ') // Only whitespace
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/i am a/i), 'client')
    await user.click(screen.getByLabelText(/consent/i))
    
    // Submit the form
    await user.click(submitButton)
    
    // Should show custom validation message for whitespace-only name
    await waitFor(() => {
      expect(screen.getByText('Please enter your full name')).toBeInTheDocument()
    })
  })
})
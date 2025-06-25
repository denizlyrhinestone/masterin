import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner'; // Path relative to this test file

describe('LoadingSpinner Component', () => {
  it('renders the spinner with default props', () => {
    render(<LoadingSpinner />);
    const spinnerContainer = screen.getByRole('status');
    expect(spinnerContainer).toBeInTheDocument();

    const spinnerElement = spinnerContainer.firstChild;
    expect(spinnerElement).toHaveClass('animate-spin rounded-full border-dashed');
    expect(spinnerElement).toHaveClass('h-8 w-8 border-4'); // Default size 'md'
    expect(spinnerElement).toHaveClass('border-sky-600 dark:border-sky-400'); // Default color
    expect(spinnerElement).toHaveClass('border-t-transparent');

    // Check for screen reader text
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('applies correct classes for "sm" size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinnerElement = screen.getByRole('status').firstChild;
    expect(spinnerElement).toHaveClass('h-4 w-4 border-2');
  });

  it('applies correct classes for "lg" size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinnerElement = screen.getByRole('status').firstChild;
    expect(spinnerElement).toHaveClass('h-16 w-16 border-4');
  });

  it('applies correct classes for "xl" size', () => {
    render(<LoadingSpinner size="xl" />);
    const spinnerElement = screen.getByRole('status').firstChild;
    expect(spinnerElement).toHaveClass('h-24 w-24 border-[5px]');
  });

  it('applies custom color class', () => {
    render(<LoadingSpinner color="border-red-500" />);
    const spinnerElement = screen.getByRole('status').firstChild;
    expect(spinnerElement).toHaveClass('border-red-500');
    expect(spinnerElement).not.toHaveClass('border-sky-600'); // Ensure default is overridden
  });

  it('applies additional className to the container', () => {
    render(<LoadingSpinner className="my-custom-class" />);
    const spinnerContainer = screen.getByRole('status');
    expect(spinnerContainer).toHaveClass('my-custom-class');
  });

  it('displays custom screen reader text', () => {
    render(<LoadingSpinner screenReaderText="Processing data..." />);
    expect(screen.getByText('Processing data...')).toHaveClass('sr-only');
  });
});

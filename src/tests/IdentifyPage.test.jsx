import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import IdentifyPage from '../pages/IdentifyPage';

describe('IdentifyPage', () => {

  // ✅ TC-I01: Page renders header and dropzone
  test('renders AI Waste Identification Hub heading', () => {
    render(<IdentifyPage />);
    expect(screen.getByText('AI Waste Identification Hub')).toBeInTheDocument();
  });

  // ✅ TC-I02: Guidelines section is visible
  test('renders image capture guidelines', () => {
    render(<IdentifyPage />);
    expect(screen.getByText('Image Capture Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/plain background/i)).toBeInTheDocument();
    expect(screen.getByText(/good lighting/i)).toBeInTheDocument();
  });

  // ✅ TC-I03: Dropzone is visible before upload
  test('shows dropzone before any file is selected', () => {
    render(<IdentifyPage />);
    expect(screen.getByText('Drag and Drop Waste Image Here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument();
  });

  // ✅ TC-I04: File input accepts image types
  test('file input accepts image/* files', () => {
    render(<IdentifyPage />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  // ✅ TC-I05: After file selected, preview and Analyze button appear
  test('shows image preview and Analyze Waste button after file upload', async () => {
    render(<IdentifyPage />);
    const file = new File(['dummy'], 'waste.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /analyze waste/i })).toBeInTheDocument();
      expect(screen.getByAltText('preview')).toBeInTheDocument();
    });
  });

  // ✅ TC-I06: Remove button clears preview and goes back to dropzone
  test('clicking Remove goes back to dropzone', async () => {
    render(<IdentifyPage />);
    const file = new File(['dummy'], 'waste.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => screen.getByRole('button', { name: /remove/i }));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.getByText('Drag and Drop Waste Image Here')).toBeInTheDocument();
  });

  // ✅ TC-I07: Analyze shows loading state then result
  test('shows analyzing state and then result after clicking Analyze', async () => {
    vi.useFakeTimers();
    render(<IdentifyPage />);
    const file = new File(['dummy'], 'bottle.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => screen.getByRole('button', { name: /analyze waste/i }));
    fireEvent.click(screen.getByRole('button', { name: /analyze waste/i }));
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    await waitFor(() => {
      expect(screen.getByText('PET Plastic Bottle')).toBeInTheDocument();
      expect(screen.getByText(/94/)).toBeInTheDocument();
      expect(screen.getByText(/10 points earned/i)).toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  // ✅ TC-I08: Analyze button is disabled while analyzing
  test('Analyze button is disabled during analysis', async () => {
    vi.useFakeTimers();
    render(<IdentifyPage />);
    const file = new File(['dummy'], 'item.jpg', { type: 'image/jpeg' });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    await waitFor(() => screen.getByRole('button', { name: /analyze waste/i }));
    fireEvent.click(screen.getByRole('button', { name: /analyze waste/i }));
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
    act(() => vi.advanceTimersByTime(2000));
    vi.useRealTimers();
  });

  // ✅ TC-I09: Result card shows disposal instructions
  test('result card shows disposal instructions', async () => {
    vi.useFakeTimers();
    render(<IdentifyPage />);
    const file = new File(['dummy'], 'item.jpg', { type: 'image/jpeg' });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    await waitFor(() => screen.getByRole('button', { name: /analyze waste/i }));
    fireEvent.click(screen.getByRole('button', { name: /analyze waste/i }));
    act(() => vi.advanceTimersByTime(2000));
    await waitFor(() => {
      expect(screen.getByText(/disposal instructions/i)).toBeInTheDocument();
      expect(screen.getByText(/recycling bin/i)).toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  // ✅ TC-I10: AI-powered badge is visible
  test('renders AI-powered badge', () => {
    render(<IdentifyPage />);
    expect(screen.getByText(/ai-powered/i)).toBeInTheDocument();
  });
});
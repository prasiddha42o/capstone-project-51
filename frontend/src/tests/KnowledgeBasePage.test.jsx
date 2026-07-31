import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';

const MOCK_CATEGORIES = [
  {
    id: 'plastic',
    name: 'Plastic Waste',
    emoji: '🧴',
    type: 'plastic',
    instructions: 'Rinse, remove cap/label, place in recycling.',
    steps: ['Empty out any leftover liquid.', 'Rinse the item with water.'],
    points: 10,
    weight: '~0.2kg',
    color: '#4F46E5',
  },
  {
    id: 'glass',
    name: 'Glass Waste',
    emoji: '🍾',
    type: 'glass',
    instructions: "Rinse and place in glass recycling, don't break.",
    steps: ['Rinse out any remaining liquid.', 'Leave labels on.'],
    points: 12,
    weight: '~0.3kg',
    color: '#10B981',
  },
];

describe('KnowledgeBasePage', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_CATEGORIES),
      })
    );
  });

  test('renders the knowledge base heading', async () => {
    render(<KnowledgeBasePage />);
    expect(screen.getByText('Disposal Guidance Knowledge Base')).toBeInTheDocument();
  });

  test('fetches and lists every category with its summary', async () => {
    render(<KnowledgeBasePage />);
    await waitFor(() => {
      expect(screen.getByText('Plastic Waste')).toBeInTheDocument();
      expect(screen.getByText('Glass Waste')).toBeInTheDocument();
    });
    expect(screen.getByText('Rinse, remove cap/label, place in recycling.')).toBeInTheDocument();
  });

  test('expands a category to show its full disposal steps on click', async () => {
    render(<KnowledgeBasePage />);
    await waitFor(() => screen.getByText('Plastic Waste'));

    expect(screen.queryByText('Empty out any leftover liquid.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Plastic Waste'));

    await waitFor(() => {
      expect(screen.getByText('Empty out any leftover liquid.')).toBeInTheDocument();
      expect(screen.getByText('Rinse the item with water.')).toBeInTheDocument();
    });

    // Glass's steps stay collapsed
    expect(screen.queryByText('Leave labels on.')).not.toBeInTheDocument();
  });

  test('collapses an expanded category on second click', async () => {
    render(<KnowledgeBasePage />);
    await waitFor(() => screen.getByText('Plastic Waste'));

    fireEvent.click(screen.getByText('Plastic Waste'));
    await waitFor(() => screen.getByText('Empty out any leftover liquid.'));

    fireEvent.click(screen.getByText('Plastic Waste'));
    await waitFor(() => {
      expect(screen.queryByText('Empty out any leftover liquid.')).not.toBeInTheDocument();
    });
  });

  test('shows an error message when the fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }));
    render(<KnowledgeBasePage />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load the knowledge base/i)).toBeInTheDocument();
    });
  });
});

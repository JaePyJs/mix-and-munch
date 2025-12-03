/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeRating } from '@/components/recipes/RecipeRating';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RecipeRating Component', () => {
  const mockProps = {
    recipeSlug: 'adobong-baboy',
    recipeName: 'Adobong Baboy',
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders the rating component with empty state', () => {
    render(<RecipeRating {...mockProps} />);

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('out of 5')).toBeInTheDocument();
    expect(screen.getByText('0 reviews')).toBeInTheDocument();
    expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    expect(
      screen.getByText('No reviews yet. Be the first to rate this recipe!')
    ).toBeInTheDocument();
  });

  it('shows the rating form when button is clicked', () => {
    render(<RecipeRating {...mockProps} />);

    const rateButton = screen.getByText('Rate this recipe');
    fireEvent.click(rateButton);

    expect(screen.getByText(`Rate "${mockProps.recipeName}"`)).toBeInTheDocument();
    expect(screen.getByText('Your Rating *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Anonymous Cook')).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('closes the form when Cancel is clicked', () => {
    render(<RecipeRating {...mockProps} />);

    // Open form
    fireEvent.click(screen.getByText('Rate this recipe'));
    expect(screen.getByText(`Rate "${mockProps.recipeName}"`)).toBeInTheDocument();

    // Cancel form
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(`Rate "${mockProps.recipeName}"`)).not.toBeInTheDocument();
  });

  it('disables submit button when no rating is selected', () => {
    render(<RecipeRating {...mockProps} />);

    fireEvent.click(screen.getByText('Rate this recipe'));

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('submits a review and displays it', async () => {
    render(<RecipeRating {...mockProps} />);

    // Open form
    fireEvent.click(screen.getByText('Rate this recipe'));

    // Click on the 4th star (using button role)
    const stars = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    // Stars are in the rating summary and in the form, find the form ones
    fireEvent.click(stars[8]); // 4th star in the form (after the 5 summary stars)

    // Fill in comment
    const commentTextarea = screen.getByPlaceholderText(/share your cooking experience/i);
    fireEvent.change(commentTextarea, { target: { value: 'Delicious recipe!' } });

    // Fill in name
    const nameInput = screen.getByPlaceholderText('Anonymous Cook');
    fireEvent.change(nameInput, { target: { value: 'Test Chef' } });

    // Submit
    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);

    // Wait for the review to appear
    await waitFor(() => {
      expect(screen.getByText('Test Chef')).toBeInTheDocument();
    });

    expect(screen.getByText('Delicious recipe!')).toBeInTheDocument();
    expect(screen.getByText('Reviews (1)')).toBeInTheDocument();
  });

  it('displays existing reviews from localStorage', () => {
    const existingReviews = [
      {
        id: 'test-review-1',
        recipeSlug: 'adobong-baboy',
        rating: 5,
        comment: 'Best adobo ever!',
        author: 'Lola Maria',
        createdAt: new Date().toISOString(),
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingReviews));

    render(<RecipeRating {...mockProps} />);

    expect(screen.getByText('Lola Maria')).toBeInTheDocument();
    expect(screen.getByText('Best adobo ever!')).toBeInTheDocument();
    expect(screen.getByText('Reviews (1)')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('calculates average rating correctly', () => {
    const existingReviews = [
      {
        id: 'test-review-1',
        recipeSlug: 'adobong-baboy',
        rating: 4,
        comment: 'Good',
        author: 'Chef A',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'test-review-2',
        recipeSlug: 'adobong-baboy',
        rating: 5,
        comment: 'Great',
        author: 'Chef B',
        createdAt: new Date().toISOString(),
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingReviews));

    render(<RecipeRating {...mockProps} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('2 reviews')).toBeInTheDocument();
  });

  it('only shows reviews for the current recipe', () => {
    const mixedReviews = [
      {
        id: 'review-1',
        recipeSlug: 'adobong-baboy',
        rating: 5,
        comment: 'Love this adobo!',
        author: 'Chef A',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'review-2',
        recipeSlug: 'sinigang',
        rating: 4,
        comment: 'Great sinigang',
        author: 'Chef B',
        createdAt: new Date().toISOString(),
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedReviews));

    render(<RecipeRating {...mockProps} />);

    expect(screen.getByText('Chef A')).toBeInTheDocument();
    expect(screen.getByText('Love this adobo!')).toBeInTheDocument();
    expect(screen.queryByText('Chef B')).not.toBeInTheDocument();
    expect(screen.queryByText('Great sinigang')).not.toBeInTheDocument();
    expect(screen.getByText('1 review')).toBeInTheDocument();
  });

  it('shows rating text feedback when hovering/selecting stars', () => {
    render(<RecipeRating {...mockProps} />);

    fireEvent.click(screen.getByText('Rate this recipe'));

    // Find interactive star buttons (cursor-pointer class indicates they're clickable)
    const allButtons = screen.getAllByRole('button');
    const interactiveStars = allButtons.filter((btn) =>
      btn.className.includes('cursor-pointer')
    );

    // Click on 1st star
    fireEvent.click(interactiveStars[0]);
    expect(screen.getByText('Poor')).toBeInTheDocument();

    // Click on 5th star
    fireEvent.click(interactiveStars[4]);
    expect(screen.getByText('Excellent!')).toBeInTheDocument();
  });

  it('uses Anonymous Cook as default author name', async () => {
    render(<RecipeRating {...mockProps} />);

    // Open form
    fireEvent.click(screen.getByText('Rate this recipe'));

    // Select a rating
    const stars = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
    fireEvent.click(stars[8]); // 4th star

    // Submit without filling in name
    fireEvent.click(screen.getByText('Submit Review'));

    // Wait for the review to appear
    await waitFor(() => {
      expect(screen.getByText('Anonymous Cook')).toBeInTheDocument();
    });
  });
});

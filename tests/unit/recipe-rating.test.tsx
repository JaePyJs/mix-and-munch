/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeRating } from '@/components/recipes/RecipeRating';

// Mock the supabase module
const mockReviews: Array<{
  id: string;
  recipe_slug: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}> = [];

jest.mock('@/lib/supabase', () => ({
  reviewsApi: {
    getByRecipe: jest.fn((recipeSlug: string) => {
      return Promise.resolve(mockReviews.filter((r) => r.recipe_slug === recipeSlug));
    }),
    create: jest.fn(
      (review: {
        recipe_slug: string;
        rating: number;
        comment: string;
        author_name: string;
      }) => {
        const newReview = {
          id: `review-${Date.now()}`,
          ...review,
          created_at: new Date().toISOString(),
        };
        mockReviews.push(newReview);
        return Promise.resolve(newReview);
      }
    ),
  },
}));

describe('RecipeRating Component', () => {
  const mockProps = {
    recipeSlug: 'adobong-baboy',
    recipeName: 'Adobong Baboy',
  };

  beforeEach(() => {
    mockReviews.length = 0; // Clear mock reviews
    jest.clearAllMocks();
  });

  it('renders the rating component with empty state', async () => {
    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('—')).toBeInTheDocument();
    });
    expect(screen.getByText('out of 5')).toBeInTheDocument();
    expect(screen.getByText('0 reviews')).toBeInTheDocument();
    expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    expect(
      screen.getByText('No reviews yet. Be the first to rate this recipe!')
    ).toBeInTheDocument();
  });

  it('shows the rating form when button is clicked', async () => {
    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    });

    const rateButton = screen.getByText('Rate this recipe');
    fireEvent.click(rateButton);

    expect(screen.getByText(`Rate "${mockProps.recipeName}"`)).toBeInTheDocument();
    expect(screen.getByText('Your Rating *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Anonymous Cook')).toBeInTheDocument();
    expect(screen.getByText('Submit Review')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('closes the form when Cancel is clicked', async () => {
    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText('Rate this recipe'));
    expect(screen.getByText(`Rate "${mockProps.recipeName}"`)).toBeInTheDocument();

    // Cancel form
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText(`Rate "${mockProps.recipeName}"`)).not.toBeInTheDocument();
  });

  it('disables submit button when no rating is selected', async () => {
    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Rate this recipe'));

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    expect(submitButton).toBeDisabled();
  });

  it('submits a review and displays it', async () => {
    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(screen.getByText('Rate this recipe'));

    // Click on the 4th star (using button role)
    const stars = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg'));
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

  it('displays existing reviews from API', async () => {
    // Pre-populate mock reviews
    mockReviews.push({
      id: 'test-review-1',
      recipe_slug: 'adobong-baboy',
      rating: 5,
      comment: 'Best adobo ever!',
      author_name: 'Lola Maria',
      created_at: new Date().toISOString(),
    });

    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Lola Maria')).toBeInTheDocument();
    });
    expect(screen.getByText('Best adobo ever!')).toBeInTheDocument();
    expect(screen.getByText('Reviews (1)')).toBeInTheDocument();
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('calculates average rating correctly', async () => {
    mockReviews.push(
      {
        id: 'test-review-1',
        recipe_slug: 'adobong-baboy',
        rating: 4,
        comment: 'Good',
        author_name: 'Chef A',
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-review-2',
        recipe_slug: 'adobong-baboy',
        rating: 5,
        comment: 'Great',
        author_name: 'Chef B',
        created_at: new Date().toISOString(),
      }
    );

    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
    expect(screen.getByText('2 reviews')).toBeInTheDocument();
  });

  it('only shows reviews for the current recipe', async () => {
    mockReviews.push(
      {
        id: 'review-1',
        recipe_slug: 'adobong-baboy',
        rating: 5,
        comment: 'Love this adobo!',
        author_name: 'Chef A',
        created_at: new Date().toISOString(),
      },
      {
        id: 'review-2',
        recipe_slug: 'sinigang',
        rating: 4,
        comment: 'Great sinigang',
        author_name: 'Chef B',
        created_at: new Date().toISOString(),
      }
    );

    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Chef A')).toBeInTheDocument();
    });
    expect(screen.getByText('Love this adobo!')).toBeInTheDocument();
    expect(screen.queryByText('Chef B')).not.toBeInTheDocument();
    expect(screen.queryByText('Great sinigang')).not.toBeInTheDocument();
    expect(screen.getByText('1 review')).toBeInTheDocument();
  });

  it('shows rating text feedback when hovering/selecting stars', async () => {
    render(<RecipeRating {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(screen.getByText('Rate this recipe')).toBeInTheDocument();
    });

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

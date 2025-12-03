'use client';

import { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { reviewsApi, RecipeReview } from '@/lib/supabase';
import clsx from 'clsx';

interface RecipeRatingProps {
  recipeSlug: string;
  recipeName: string;
}

export function RecipeRating({ recipeSlug, recipeName }: RecipeRatingProps) {
  const [reviews, setReviews] = useState<RecipeReview[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      const data = await reviewsApi.getByRecipe(recipeSlug);
      setReviews(data);
      setIsLoading(false);
    }
    fetchReviews();
  }, [recipeSlug]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) return;

    setIsSubmitting(true);

    const newReview = await reviewsApi.create({
      recipe_slug: recipeSlug,
      rating: userRating,
      comment: comment.trim(),
      author_name: author.trim() || 'Anonymous Cook',
    });

    if (newReview) {
      setReviews((prev) => [newReview, ...prev]);
    }

    setUserRating(0);
    setComment('');
    setAuthor('');
    setShowForm(false);
    setIsSubmitting(false);
  };

  const renderStars = (
    rating: number,
    interactive = false,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-7 h-7',
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setUserRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={clsx(
              'transition-colors',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
          >
            <Star
              className={clsx(
                sizeClasses[size],
                'transition-colors',
                (interactive ? hoverRating || userRating : rating) >= star
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-brand-gray-700 text-brand-gray-600'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="card-surface rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-lime">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-brand-gray-400">out of 5</div>
            </div>
            <div>
              {renderStars(averageRating)}
              <div className="text-sm text-brand-gray-400 mt-1">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>

          {!showForm && (
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Rate this recipe
            </Button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card-surface rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rate "{recipeName}"</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-brand-gray-300 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                {renderStars(userRating, true, 'lg')}
                {userRating > 0 && (
                  <span className="text-brand-gray-400 text-sm ml-2">
                    {userRating === 1 && 'Poor'}
                    {userRating === 2 && 'Fair'}
                    {userRating === 3 && 'Good'}
                    {userRating === 4 && 'Very Good'}
                    {userRating === 5 && 'Excellent!'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-brand-gray-300 mb-2">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Anonymous Cook"
                className="w-full bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-4 py-2 text-white placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm text-brand-gray-300 mb-2">
                Your Review (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your cooking experience, tips, or modifications..."
                rows={3}
                className="w-full bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-4 py-2 text-white placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-xs text-brand-gray-500 text-right mt-1">
                {comment.length}/500
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={userRating === 0 || isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setUserRating(0);
                  setComment('');
                  setAuthor('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Reviews ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card-surface rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-gray-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{review.author_name}</div>
                      <div className="text-xs text-brand-gray-500">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating, false, 'sm')}
                </div>
                {review.comment && (
                  <p className="mt-3 text-brand-gray-300 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && reviews.length === 0 && !showForm && (
        <div className="text-center py-8 text-brand-gray-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No reviews yet. Be the first to rate this recipe!</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-brand-gray-400">
          <div className="animate-pulse">Loading reviews...</div>
        </div>
      )}
    </div>
  );
}

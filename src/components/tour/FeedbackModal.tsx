'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const canSubmit = rating > 0 || message.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message: message.trim(), name: name.trim() }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full md:max-w-sm bg-background rounded-t-2xl md:rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Share Your Thoughts</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🙏</div>
            <h4 className="font-semibold text-lg mb-1">Thank you!</h4>
            <p className="text-sm text-muted-foreground">
              Your feedback helps us improve the tour experience for everyone.
            </p>
            <Button className="mt-5 w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Star rating */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">How was your experience?</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 p-1"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={cn(
                        'w-8 h-8 transition-colors',
                        (hovered || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground/40'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-3">
              <p className="text-sm font-medium mb-2">Suggestions or comments</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did you enjoy? What could be improved?"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Name (optional) */}
            <div className="mb-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-destructive mb-3">
                Something went wrong. Please try again.
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={status === 'submitting' || !canSubmit}
            >
              {status === 'submitting' ? 'Sending…' : 'Submit Feedback'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Step1OrgSetup } from '@/components/onboarding/Step1OrgSetup';
import { Step2AddSites } from '@/components/onboarding/Step2AddSites';
import { Step3FunFacts } from '@/components/onboarding/Step3FunFacts';
import { Step4StampCard } from '@/components/onboarding/Step4StampCard';
import { Step5Preview } from '@/components/onboarding/Step5Preview';
import type { Organization } from '@/types';

const STEP_LABELS = [
  'Organization',
  'Add Sites',
  'Fun Facts',
  'Stamp Card',
  'Preview & Publish',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [org, setOrg] = useState<Organization | null>(null);
  const [tourId, setTourId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load existing org if user already started onboarding
  useEffect(() => {
    async function loadExistingOrg() {
      try {
        const res = await fetch('/api/organizations');
        if (res.ok) {
          const orgs = await res.json();
          if (orgs.length > 0) {
            const existingOrg = orgs[0];
            setOrg(existingOrg);
            setCurrentStep(existingOrg.onboarding_step || 1);

            // Check if they have a tour already
            const toursRes = await fetch(`/api/tours?orgId=${existingOrg.id}`);
            if (toursRes.ok) {
              const tours = await toursRes.json();
              if (tours.length > 0) {
                setTourId(tours[0].id);
                if (tours[0].cover_image_url) {
                  setCoverImageUrl(tours[0].cover_image_url);
                }
              }
            }
          }
        }
      } catch {
        // First-time user, start fresh
      } finally {
        setLoading(false);
      }
    }
    loadExistingOrg();
  }, []);

  // Persist cover image directly to the tour record (if tour exists)
  const saveCoverImageToTour = async (newCoverImageUrl: string) => {
    if (!tourId || !newCoverImageUrl) return;
    try {
      await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_image_url: newCoverImageUrl }),
      });
    } catch {
      // Best-effort; Step 2 will also save it
    }
  };

  const handleStepComplete = (step: number, data?: { org?: Organization; tourId?: string; coverImageUrl?: string }) => {
    if (data?.org) setOrg(data.org);
    if (data?.tourId) setTourId(data.tourId);
    if (data?.coverImageUrl !== undefined) {
      setCoverImageUrl(data.coverImageUrl);
      // Save cover image to tour immediately so it's in the DB for preview
      saveCoverImageToTour(data.coverImageUrl);
    }

    if (step < 5) {
      setCurrentStep(step + 1);
    }
  };

  const handlePublish = () => {
    if (org) {
      router.push(`/t/${org.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Walking Tour</h1>
        <p className="text-muted-foreground">
          Follow these steps to create your branded walking tour app.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;
          return (
            <button
              key={label}
              onClick={() => {
                // Allow going back to completed steps
                if (stepNum < currentStep) setCurrentStep(stepNum);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isComplete
                    ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive
                  ? 'bg-primary-foreground text-primary'
                  : isComplete
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {isComplete ? '✓' : stepNum}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-lg border p-6">
        {currentStep === 1 && (
          <Step1OrgSetup
            existingOrg={org}
            existingCoverImageUrl={coverImageUrl}
            existingTourId={tourId}
            onComplete={(newOrg, newCoverImageUrl) => handleStepComplete(1, { org: newOrg, coverImageUrl: newCoverImageUrl })}
            onSave={(newOrg, newCoverImageUrl) => {
              setOrg(newOrg);
              setCoverImageUrl(newCoverImageUrl);
              saveCoverImageToTour(newCoverImageUrl);
            }}
          />
        )}
        {currentStep === 2 && org && (
          <Step2AddSites
            org={org}
            existingTourId={tourId}
            coverImageUrl={coverImageUrl}
            onComplete={(newTourId) => handleStepComplete(2, { tourId: newTourId })}
            onSave={(newTourId) => {
              setTourId(newTourId);
            }}
          />
        )}
        {currentStep === 3 && org && tourId && (
          <Step3FunFacts
            orgId={org.id}
            tourId={tourId}
            onComplete={() => handleStepComplete(3)}
            onSkip={() => handleStepComplete(3)}
            onSave={() => {}}
          />
        )}
        {currentStep === 4 && org && tourId && (
          <Step4StampCard
            org={org}
            tourId={tourId}
            onComplete={() => handleStepComplete(4)}
          />
        )}
        {currentStep === 5 && org && tourId && (
          <Step5Preview
            org={org}
            tourId={tourId}
            onPublish={handlePublish}
          />
        )}
      </div>
    </div>
  );
}

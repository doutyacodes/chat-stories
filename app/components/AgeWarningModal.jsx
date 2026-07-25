import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import jwt from 'jsonwebtoken';

export default function AgeWarningModal({
  isOpen,
  onClose,
  onConfirm,
  story,
}) {
  const [step, setStep] = useState(1); // 1 = Age Verification, 2 = Content Advisory
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (isOpen && story) {
      setStep(1);
      const initialTags = story.tags || story.genres || [];
      setTags(initialTags);

      if (initialTags.length === 0) {
        const targetId = story.story_id || story.id || story.storyId;
        if (targetId) {
          fetch(`/api/stories/${targetId}/tags`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && Array.isArray(data.tags)) {
                setTags(data.tags);
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [isOpen, story]);

  if (!story || !isOpen) return null;

  const handleAgeConfirm = () => {
    setStep(2);
  };

  const handleContentConfirm = () => {
    onClose();
    if (onConfirm) onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#141419] border border-white/10 text-white max-w-md rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        {step === 1 ? (
          // STEP 1: AGE VERIFICATION
          <>
            <AlertDialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded border border-white/20 bg-white/5 text-white/90 text-xs font-mono font-medium">
                  18+
                </span>
                <AlertDialogTitle className="text-lg font-semibold text-white tracking-tight">
                  Age Verification Required
                </AlertDialogTitle>
              </div>

              <AlertDialogDescription className="text-neutral-400 text-sm leading-relaxed text-justify">
                This title <span className="font-medium text-neutral-200">&quot;{story.title}&quot;</span> is rated 18+ for mature audiences. Please confirm that you are at least 18 years old to access this content.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="m-0 h-10 px-4 rounded-xl bg-[#22222a] hover:bg-[#2c2c36] text-neutral-300 hover:text-white border-0 font-medium text-xs transition-all"
              >
                Under 18
              </button>
              <button
                type="button"
                onClick={handleAgeConfirm}
                className="m-0 h-10 px-5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-md"
              >
                I am 18 or older
              </button>
            </AlertDialogFooter>
          </>
        ) : (
          // STEP 2: CONTENT ADVISORY
          <>
            <AlertDialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded border border-white/20 bg-white/5 text-white/90 text-xs font-mono font-medium">
                  18+
                </span>
                <AlertDialogTitle className="text-lg font-semibold text-white tracking-tight">
                  Content Advisory
                </AlertDialogTitle>
              </div>

              <div className="space-y-3">
                <p className="text-neutral-400 text-sm leading-relaxed text-justify">
                  <span className="font-medium text-neutral-200">&quot;{story.title}&quot;</span> contains themes intended for adult audiences.
                </p>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="m-0 h-10 px-4 rounded-xl bg-[#22222a] hover:bg-[#2c2c36] text-neutral-300 hover:text-white border-0 font-medium text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContentConfirm}
                className="m-0 h-10 px-5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-md"
              >
                Continue
              </button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

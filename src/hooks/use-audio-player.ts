'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { useAudioStore } from '@/stores/audio-store';

export function useAudioPlayer() {
  const howlRef = useRef<Howl | null>(null);
  const {
    isPlaying,
    currentSiteId,
    progress,
    duration,
    isLoading,
    error,
    setIsPlaying,
    setProgress,
    setDuration,
    setIsLoading,
    setError,
    setCurrentSiteId,
  } = useAudioStore();

  const load = useCallback(
    (url: string, siteId: string) => {
      // Stop and unload previous audio
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
      }

      setIsLoading(true);
      setError(null);
      setCurrentSiteId(siteId);
      setProgress(0);

      howlRef.current = new Howl({
        src: [url],
        html5: true,
        preload: true,
        onload: () => {
          setIsLoading(false);
          setDuration(howlRef.current?.duration() || 0);
        },
        onloaderror: (_id, errorCode) => {
          setIsLoading(false);
          setError(`Failed to load audio (${errorCode})`);
        },
        onplay: () => {
          setIsPlaying(true);
        },
        onpause: () => {
          setIsPlaying(false);
        },
        onstop: () => {
          setIsPlaying(false);
          setProgress(0);
        },
        onend: () => {
          setIsPlaying(false);
          setProgress(duration);
        },
        onplayerror: () => {
          setIsPlaying(false);
          setError('Playback failed');
        },
      });
    },
    [setIsLoading, setError, setCurrentSiteId, setProgress, setDuration, setIsPlaying, duration]
  );

  const play = useCallback(() => {
    if (howlRef.current && !isPlaying) {
      howlRef.current.play();
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (howlRef.current && isPlaying) {
      howlRef.current.pause();
    }
  }, [isPlaying]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setProgress(time);
    }
  }, [setProgress]);

  const seekPercent = useCallback(
    (percent: number) => {
      const time = (percent / 100) * duration;
      seek(time);
    },
    [duration, seek]
  );

  // Update progress periodically
  useEffect(() => {
    let animationFrame: number;

    const updateProgress = () => {
      if (howlRef.current && isPlaying) {
        const currentTime = howlRef.current.seek() as number;
        setProgress(currentTime);
      }
      animationFrame = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, setProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentSiteId,
    progress,
    duration,
    isLoading,
    error,
    progressPercent: duration > 0 ? (progress / duration) * 100 : 0,

    // Actions
    load,
    play,
    pause,
    toggle,
    stop,
    seek,
    seekPercent,
  };
}

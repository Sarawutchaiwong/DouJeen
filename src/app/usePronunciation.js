'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function usePronunciation() {
  const audioRef = useRef(null);
  const [playingCharacter, setPlayingCharacter] = useState(null);
  const [pronunciationError, setPronunciationError] = useState('');

  const stopPronunciation = useCallback(() => {
    const currentAudio = audioRef.current;
    if (currentAudio) {
      audioRef.current = null;
      currentAudio.pause();
      currentAudio.removeAttribute('src');
      currentAudio.load();
    }
    setPlayingCharacter(null);
  }, []);

  const playPronunciation = useCallback(
    async (character) => {
      stopPronunciation();
      setPronunciationError('');

      const audio = new Audio(`/api/tts?text=${encodeURIComponent(character)}`);
      audio.preload = 'none';
      audioRef.current = audio;
      setPlayingCharacter(character);

      const finish = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          setPlayingCharacter(null);
        }
      };
      const fail = () => {
        if (audioRef.current !== audio) return;
        audioRef.current = null;
        setPlayingCharacter(null);
        setPronunciationError('Could not play this pronunciation. Please try again.');
      };

      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', fail, { once: true });

      try {
        await audio.play();
      } catch {
        fail();
      }
    },
    [stopPronunciation]
  );

  useEffect(() => stopPronunciation, [stopPronunciation]);

  return {
    playingCharacter,
    playPronunciation,
    pronunciationError,
    stopPronunciation,
  };
}

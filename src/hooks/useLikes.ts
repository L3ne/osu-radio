'use client';

import { useState, useEffect } from 'react';

export function useLikes() {
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('osu-radio-likes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLikedSongs(new Set(parsed));
      } catch (error) {
        console.error('Failed to parse liked songs:', error);
      }
    }
  }, []);

  const toggleLike = (songId: string): void => {
    setLikedSongs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      localStorage.setItem('osu-radio-likes', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const isLiked = (songId: string): boolean => {
    return likedSongs.has(songId);
  };

  return { likedSongs, toggleLike, isLiked };
}

'use client';

import { Song } from '@/types';
import { RefObject, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoPlaySharp, IoPauseSharp, IoPlaySkipBackSharp, IoPlaySkipForwardSharp, IoHeart, IoHeartOutline } from 'react-icons/io5';
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi';

interface MediaPlayerProps {
  currentSong: Song | undefined;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioRef: RefObject<HTMLAudioElement>;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

function MediaPlayerComponent({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  audioRef,
  onTogglePlay,
  onPrevious,
  onNext,
  onVolumeChange,
  onSeek,
  isLiked,
  onToggleLike,
}: MediaPlayerProps): JSX.Element | null {
  if (!currentSong) return null;
  const [showLikeEffect, setShowLikeEffect] = useState(false);

  const handleLike = useCallback((): void => {
    onToggleLike();
    if (!isLiked) {
      setShowLikeEffect(true);
      setTimeout(() => setShowLikeEffect(false), 1000);
    }
  }, [onToggleLike, isLiked]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.footer 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex-shrink-0 h-24 bg-black/50 backdrop-blur-xl border-t border-white/10 px-6"
    >
      <audio ref={audioRef} src={`/api/audio?path=${encodeURIComponent(currentSong.audioPath)}`} />
      
      <div className="w-full h-full flex items-center gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 w-72"
        >
          <img
            src={`https://assets.ppy.sh/beatmaps/${currentSong.beatmapSetID}/covers/list.jpg`}
            alt={currentSong.title}
            className="w-16 h-16 rounded-md object-cover shadow-lg"
            onError={(e) => {
              e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/240px-Osu%21_Logo_2016.svg.png';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-sm">{currentSong.title}</div>
            <div className="text-xs text-white/60 truncate">{currentSong.artist}</div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrevious}
              className="p-2.5 hover:bg-white/10 rounded-2xl transition"
              aria-label="Previous"
            >
              <IoPlaySkipBackSharp className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTogglePlay}
              className="p-4 bg-primary hover:bg-primary/90 rounded-3xl transition shadow-lg relative overflow-hidden"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IoPauseSharp className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IoPlaySharp className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="p-2.5 hover:bg-white/10 rounded-2xl transition"
              aria-label="Next"
            >
              <IoPlaySkipForwardSharp className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="w-full max-w-2xl flex items-center gap-3">
            <span className="text-xs text-white/60 w-12 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 relative group">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>
            <span className="text-xs text-white/60 w-12">{formatTime(duration)}</span>
          </div>
        </div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 w-60"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`p-2 rounded-2xl transition relative ${
              isLiked ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10'
            }`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <AnimatePresence mode="wait">
              {isLiked ? (
                <motion.div
                  key="liked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <IoHeart className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="unliked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <IoHeartOutline className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
            {showLikeEffect && (
              <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                className="absolute inset-0 rounded-2xl bg-red-500"
              />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
            className="p-2 hover:bg-white/10 rounded-2xl transition"
            aria-label={volume === 0 ? 'Unmute' : 'Mute'}
          >
            <AnimatePresence mode="wait">
              {volume === 0 ? (
                <motion.div
                  key="muted"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <HiVolumeOff className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="unmuted"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <HiVolumeUp className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <div className="flex-1 relative group">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-white/60 w-10 text-right">{Math.round(volume * 100)}%</span>
        </motion.div>
      </div>
    </motion.footer>
  );
}

export const MediaPlayer = memo(MediaPlayerComponent);

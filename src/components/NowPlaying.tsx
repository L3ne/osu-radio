'use client';

import { Song } from '@/types';
import { motion } from 'framer-motion';
import { BiMusic } from 'react-icons/bi';

interface NowPlayingProps {
  currentSong: Song | undefined;
}

export function NowPlaying({ currentSong }: NowPlayingProps): JSX.Element {
  if (!currentSong) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="text-center text-white/60">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <BiMusic className="w-24 h-24 mx-auto mb-4 opacity-30" />
          </motion.div>
          <p className="text-xl font-medium">No song playing</p>
          <p className="text-sm mt-2">Select a song from the library</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key={currentSong.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col relative"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url(https://assets.ppy.sh/beatmaps/${currentSong.beatmapSetID}/covers/cover.jpg)`,
          filter: 'blur(15px)',
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3 max-w-4xl px-8">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="text-5xl font-bold text-white drop-shadow-2xl"
            >
              {currentSong.title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="text-3xl text-white/90 drop-shadow-lg"
            >
              {currentSong.artist}
            </motion.p>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="text-base text-white/70"
            >
              Mapped by {currentSong.creator}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

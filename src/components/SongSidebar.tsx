'use client';

import { Song } from '@/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch, BiMusic } from 'react-icons/bi';
import { IoHeart, IoMusicalNotes, IoShuffle } from 'react-icons/io5';

interface SongSidebarProps {
  songs: Song[];
  currentIndex: number;
  onSongSelect: (index: number) => void;
  isLoading: boolean;
  onScan: () => void;
  likedSongs: Set<string>;
  onShuffle: () => void;
}

export function SongSidebar({ songs, currentIndex, onSongSelect, isLoading, onScan, likedSongs, onShuffle }: SongSidebarProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const likedSongsList = songs.filter((song) => likedSongs.has(song.id));
  
  const baseSongs = activeTab === 'liked' ? likedSongsList : songs;
  const displaySongs = searchQuery ? baseSongs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.creator.toLowerCase().includes(searchQuery.toLowerCase())
  ) : baseSongs;

  return (
    <motion.aside 
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-80 h-full bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col"
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold"
          >
            Song Library
          </motion.h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShuffle}
              className="p-2 bg-white/5 hover:bg-primary/20 rounded-xl transition"
              aria-label="Shuffle"
            >
              <IoShuffle className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onScan}
              disabled={isLoading}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50"
            >
              {isLoading ? 'Scanning...' : 'Scan'}
            </motion.button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <IoMusicalNotes className="w-4 h-4" />
            <span className="text-sm font-medium">All</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'liked'
                ? 'bg-primary text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <IoHeart className="w-4 h-4" />
            <span className="text-sm font-medium">Liked ({likedSongs.size})</span>
          </motion.button>
        </div>

        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-primary transition"
          />
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {displaySongs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-muted-foreground px-4 text-center"
          >
            <BiMusic className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">
              {songs.length === 0 ? 'No songs loaded. Click Scan to load your osu! beatmaps.' : 'No results found'}
            </p>
          </motion.div>
        ) : (
          <div className="p-2 space-y-1">
            {displaySongs.map((song, index) => {
              const actualIndex = songs.indexOf(song);
              const isActive = actualIndex === currentIndex;
              
              return (
                <motion.button
                  key={song.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSongSelect(actualIndex)}
                  className="w-full text-left p-2 rounded-md transition-all group hover:bg-white/5 border border-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list.jpg`}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/240px-Osu%21_Logo_2016.svg.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm text-white">
                        {song.title}
                      </div>
                      <div className="text-xs text-white/60 truncate">{song.artist}</div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Song } from '@/types';

export default function Home(): JSX.Element {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const updateTime = (): void => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
    };
  }, [volume]);

  useEffect(() => {
    const song = songs[currentIndex];
    if (!song) return;

    const timer = setTimeout(() => {
      const audio = audioRef.current;
      if (!audio || audio.duration === 0) return;

      const currentPos = audio.currentTime;
      const totalDuration = audio.duration;

      fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song, isPlaying, currentTime: currentPos, duration: totalDuration }),
      }).catch(console.error);
    }, 500);

    return () => clearTimeout(timer);
  }, [songs, currentIndex, isPlaying]);

  const handleScan = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSongs(data.songs);
        console.warn(`[App] Loaded ${data.songs.length} songs`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = (): void => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const playSong = (index: number): void => {
    setCurrentIndex(index);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play().catch(console.error);
    }, 100);
  };

  const currentSong = songs[currentIndex];
  const audioSrc = currentSong ? `/api/audio?path=${encodeURIComponent(currentSong.audioPath)}` : '';
  const backgroundImage = currentSong ? `https://assets.ppy.sh/beatmaps/${currentSong.beatmapSetID}/covers/raw.jpg` : '';

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displaySongs = searchQuery ? filteredSongs : songs;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'blur(50px) brightness(0.3)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen backdrop-blur-sm">
        <header className="border-b border-white/10 p-4 bg-black/20">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">osu! Radio</h1>
              <button
                onClick={handleScan}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition"
              >
                {isLoading ? 'Scanning...' : 'Scan osu! Folder'}
              </button>
            </div>
            
            {songs.length > 0 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-primary"
                />
                {showSearch && searchQuery && filteredSongs.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-card border border-border rounded shadow-lg max-h-96 overflow-auto z-20">
                    {filteredSongs.slice(0, 10).map((song) => (
                      <button
                        key={song.id}
                        onClick={() => {
                          playSong(songs.indexOf(song));
                          setSearchQuery('');
                          setShowSearch(false);
                        }}
                        className="w-full text-left p-3 hover:bg-accent border-b border-border last:border-0 flex items-center gap-3"
                      >
                        <img
                          src={`https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list.jpg`}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/240px-Osu%21_Logo_2016.svg.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{song.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{song.artist}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="h-full max-w-7xl mx-auto">
            {displaySongs.length === 0 ? (
              <p className="text-muted-foreground text-center mt-20">
                {songs.length === 0 ? 'No songs loaded' : 'No results found'}
              </p>
            ) : (
              <div className="space-y-2">
                {displaySongs.map((song) => {
                  const actualIndex = songs.indexOf(song);
                  return (
                    <button
                      key={song.id}
                      onClick={() => playSong(actualIndex)}
                      className={`w-full text-left p-3 rounded transition flex items-center gap-3 ${
                        actualIndex === currentIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-white/5 hover:bg-white/10 backdrop-blur'
                      }`}
                    >
                      <img
                        src={`https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list.jpg`}
                        alt={song.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/240px-Osu%21_Logo_2016.svg.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{song.title}</div>
                        <div className="text-sm opacity-75 truncate">{song.artist}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {currentSong && (
          <footer className="border-t border-white/10 p-4 bg-black/30 backdrop-blur-md">
            <audio ref={audioRef} src={audioSrc} />
            <div className="max-w-7xl mx-auto space-y-3">
              <div className="mb-2">
                <div className="font-semibold text-lg">{currentSong.title}</div>
                <div className="text-sm text-muted-foreground">{currentSong.artist}</div>
              </div>
              
              <div className="flex items-center gap-6">
                <button
                  onClick={togglePlay}
                  className="px-8 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </div>
                  
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 min-w-[200px]">
                  <svg
                    className="w-6 h-6 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                  </svg>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-12 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface AudioPlayerProps {
  audioUrl?: string;
  durationSec?: number;
  title?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  durationSec = 180,
  title = 'Call Recording Audio',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  // Mock waveform bars
  const waveformBars = [
    25, 40, 60, 80, 45, 90, 70, 30, 55, 85, 100, 65, 40, 75, 95, 80, 50, 35, 60, 90,
    75, 40, 85, 60, 30, 70, 90, 100, 80, 45, 60, 75, 90, 65, 40, 80, 95, 70, 50, 30,
  ];

  return (
    <div className="bg-[#161722] border border-zinc-800 rounded-2xl p-4 text-white space-y-3 shadow-xl">
      <audio ref={audioRef} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        <button
          onClick={cycleSpeed}
          className="text-xs font-bold px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-indigo-400 rounded-md transition-colors cursor-pointer"
        >
          {playbackRate}x Speed
        </button>
      </div>

      {/* Visual Waveform */}
      <div className="flex items-center gap-1 h-10 py-1 px-2 bg-[#0e0f14] rounded-xl overflow-hidden">
        {waveformBars.map((height, idx) => {
          const progressPercent = (currentTime / durationSec) * 100;
          const barPercent = (idx / waveformBars.length) * 100;
          const isPassed = barPercent <= progressPercent;

          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-all ${
                isPassed ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-zinc-800'
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => setCurrentTime(0)}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Reset to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Scrub Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 w-12 text-right">{formatDuration(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={durationSec}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-xs font-mono text-zinc-400 w-12">{formatDuration(durationSec)}</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

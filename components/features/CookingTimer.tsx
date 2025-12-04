'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface Timer {
  id: string;
  label: string;
  duration: number; // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
  isComplete: boolean;
}

const PRESET_TIMERS = [
  { label: 'Soft Boiled Eggs', duration: 6 * 60, icon: '🥚' },
  { label: 'Hard Boiled Eggs', duration: 12 * 60, icon: '🥚' },
  { label: 'Rice (Kaldero)', duration: 20 * 60, icon: '🍚' },
  { label: 'Pasta al Dente', duration: 8 * 60, icon: '🍝' },
  { label: 'Marinate Meat', duration: 30 * 60, icon: '🥩' },
  { label: 'Rest Meat', duration: 5 * 60, icon: '🍖' },
  { label: 'Boil Water', duration: 10 * 60, icon: '💧' },
  { label: 'Simmer Adobo', duration: 45 * 60, icon: '🍲' },
  { label: 'Fry Chicken', duration: 15 * 60, icon: '🍗' },
  { label: 'Grill Liempo', duration: 25 * 60, icon: '🔥' },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function parseTimeInput(value: string): number {
  const parts = value.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    return mins * 60 + secs;
  }
  return parseInt(value) * 60 || 0;
}

export function CookingTimer() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create audio context for alarm
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = new Audio();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Play alarm sound
  const playAlarm = useCallback(() => {
    // Create audio context and oscillator for beep
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Repeat beep 3 times
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 880;
        osc2.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 600);

      setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        osc3.connect(gainNode);
        osc3.frequency.value = 880;
        osc3.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc3.start(audioContext.currentTime);
        osc3.stop(audioContext.currentTime + 0.5);
      }, 1200);
    } catch {
      // Fallback: just show notification
      console.log('Audio not available');
    }

    // Also try to show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Timer Complete!', {
        body: 'Your cooking timer has finished!',
        icon: '/images/logo.png',
      });
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    const hasRunning = timers.some((t) => t.isRunning && !t.isComplete);

    if (hasRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimers((prev) =>
          prev.map((timer) => {
            if (!timer.isRunning || timer.isComplete) return timer;

            const newRemaining = timer.remaining - 1;

            if (newRemaining <= 0) {
              playAlarm();
              return { ...timer, remaining: 0, isRunning: false, isComplete: true };
            }

            return { ...timer, remaining: newRemaining };
          })
        );
      }, 1000);
    } else if (!hasRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current && !hasRunning) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timers, playAlarm]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Add a new timer
  const addTimer = useCallback((label: string, duration: number) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      label,
      duration,
      remaining: duration,
      isRunning: true,
      isComplete: false,
    };
    setTimers((prev) => [...prev, newTimer]);
  }, []);

  // Add custom timer
  const addCustomTimer = useCallback(() => {
    const duration = parseTimeInput(customMinutes);
    if (duration <= 0) return;

    const label = customLabel.trim() || `Timer ${timers.length + 1}`;
    addTimer(label, duration);
    setCustomMinutes('');
    setCustomLabel('');
  }, [customMinutes, customLabel, timers.length, addTimer]);

  // Toggle timer pause/play
  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
      )
    );
  }, []);

  // Reset a timer
  const resetTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, remaining: timer.duration, isRunning: false, isComplete: false }
          : timer
      )
    );
  }, []);

  // Remove a timer
  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  }, []);

  // Calculate progress percentage
  const getProgress = (timer: Timer): number => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-brand-lime flex items-center gap-2">
          <span>⏱️</span> Cooking Timer
        </h2>
        <p className="text-brand-gray-300 text-sm mt-1">
          Multiple timers for perfect cooking every time
        </p>
      </div>

      {/* Quick Preset Timers */}
      <div className="card-surface p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-brand-gray-300 mb-3">Quick Timers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRESET_TIMERS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => addTimer(preset.label, preset.duration)}
              className="flex flex-col items-center gap-1 p-3 bg-brand-gray-700 hover:bg-brand-lime/20 rounded-lg transition-colors"
            >
              <span className="text-2xl">{preset.icon}</span>
              <span className="text-xs text-white text-center">{preset.label}</span>
              <span className="text-xs text-brand-gray-400">
                {formatTime(preset.duration)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Timer */}
      <div className="card-surface p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-brand-gray-300 mb-3">Custom Timer</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Timer name (optional)"
            className="flex-1 bg-brand-gray-700 border border-brand-gray-600 rounded-lg px-4 py-2 text-white placeholder-brand-gray-400 focus:outline-none focus:border-brand-lime"
          />
          <input
            type="text"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTimer()}
            placeholder="Minutes (or MM:SS)"
            className="w-32 bg-brand-gray-700 border border-brand-gray-600 rounded-lg px-4 py-2 text-white placeholder-brand-gray-400 focus:outline-none focus:border-brand-lime text-center"
          />
          <Button variant="primary" onClick={addCustomTimer}>
            Start
          </Button>
        </div>
      </div>

      {/* Active Timers */}
      {timers.length === 0 ? (
        <div className="card-surface p-8 rounded-xl text-center">
          <span className="text-4xl mb-4 block">🍳</span>
          <p className="text-brand-gray-300 mb-2">No active timers</p>
          <p className="text-brand-gray-400 text-sm">
            Start a timer from the presets above or create a custom one
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className={`card-surface p-4 rounded-xl relative overflow-hidden ${
                timer.isComplete ? 'ring-2 ring-brand-lime animate-pulse' : ''
              }`}
            >
              {/* Progress background */}
              <div
                className="absolute inset-0 bg-brand-lime/10 transition-all duration-1000"
                style={{ width: `${getProgress(timer)}%` }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{timer.label}</h4>
                  <button
                    onClick={() => removeTimer(timer.id)}
                    className="text-brand-gray-500 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center py-4">
                  <span
                    className={`text-5xl font-mono font-bold ${
                      timer.isComplete
                        ? 'text-brand-lime'
                        : timer.remaining <= 60
                          ? 'text-red-400'
                          : 'text-white'
                    }`}
                  >
                    {formatTime(timer.remaining)}
                  </span>
                  {timer.isComplete && (
                    <p className="text-brand-lime mt-2 text-sm font-semibold">
                      ✓ Complete!
                    </p>
                  )}
                </div>

                <div className="flex gap-2 justify-center">
                  {!timer.isComplete && (
                    <Button
                      variant={timer.isRunning ? 'secondary' : 'primary'}
                      onClick={() => toggleTimer(timer.id)}
                    >
                      {timer.isRunning ? '⏸ Pause' : '▶ Resume'}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => resetTimer(timer.id)}>
                    🔄 Reset
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="card-surface p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-brand-gray-300 mb-2">
          💡 Cooking Tips
        </h3>
        <ul className="text-sm text-brand-gray-400 space-y-1">
          <li>• Let meat rest after cooking - it makes it more juicy!</li>
          <li>
            • Start rice timer when water starts boiling, not when you turn on the stove
          </li>
          <li>• Marinating overnight gives the best flavor for adobo and BBQ</li>
          <li>• For crispy lechon kawali, dry the pork well before frying</li>
        </ul>
      </div>
    </div>
  );
}

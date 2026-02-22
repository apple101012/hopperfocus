// ElevenLabs Voice Service for HopperFocus
// Harry Potter themed voice narration

const ELEVENLABS_API_KEY = 'sk_3b9f380c7596d9430f9728f5b98c794c538e0616f103be07';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Harry Potter themed voice IDs from ElevenLabs
// Updated with better quality voices
export const VOICE_PROFILES = {
  // Bill - Wise and calm, perfect for mentor Dumbledore
  dumbledore: 'pNInz6obpgDQGcFmaJgB',
  // Rachel - Clear and intelligent, perfect for Hermione
  hermione: '21m00Tcm4TlvDq8ikWAM',
  // Charlotte - Stern but supportive, perfect for McGonagall
  mcgonagall: 'XB0fDUnXU5powFXDhCwa',
  // Clyde - Warm and encouraging, perfect for Hagrid
  hagrid: '2EiwWnXFnvU5JabPnv8n',
};

export type VoiceType = keyof typeof VOICE_PROFILES;

interface VoiceOptions {
  voice?: VoiceType;
  stability?: number;
  similarityBoost?: number;
}

class ElevenLabsService {
  private enabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;

  // Check if voice is enabled in user preferences
  constructor() {
    const saved = localStorage.getItem('voiceEnabled');
    this.enabled = saved !== 'false';
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('voiceEnabled', enabled.toString());
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Stop any currently playing audio
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  // Speak text using ElevenLabs API
  async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    if (!this.enabled) return;

    // Stop any currently playing audio
    this.stop();

    const voice = options.voice || 'dumbledore';
    const voiceId = VOICE_PROFILES[voice];

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: options.stability || 0.65,
            similarity_boost: options.similarityBoost || 0.85,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      await this.currentAudio.play();

      // Clean up after playing
      this.currentAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      });

    } catch (error) {
      console.error('ElevenLabs voice error:', error);
      // Silently fail - don't interrupt user experience
    }
  }

  // Preset voice lines for common scenarios
  async speakTaskStart(taskTitle: string, estimatedTime: string) {
    const messages = [
      `Very well. Let us begin: ${taskTitle}. You have ${estimatedTime} to complete this quest.`,
      `Excellent choice. ${taskTitle} awaits. Time allotted: ${estimatedTime}. Focus now.`,
      `Ah, ${taskTitle}. A worthy challenge. Your timer begins now: ${estimatedTime}.`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { voice: 'dumbledore' });
  }

  async speakEncouragement(timeRemaining: number) {
    const messages = [
      "Keep going. Magic flows through those who persevere.",
      "Well done. Your focus is admirable.",
      "Excellent progress. Continue with confidence.",
      "Splendid work. The end is near.",
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { voice: 'dumbledore' });
  }

  async speakVictory(bounty: number) {
    const messages = [
      `Splendid! You have earned ${bounty} Mana. Well done indeed.`,
      `Remarkable! ${bounty} Mana is yours. Your discipline serves you well.`,
      `Bravo! ${bounty} Mana awarded. You've proven yourself worthy.`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { voice: 'dumbledore' });
  }

  async speakDefeat(stake: number) {
    const messages = [
      `Time has escaped you. ${stake} Mana lost. Learn from this, and try again.`,
      `Alas, the timer runs out. ${stake} Mana forfeited. Do not despair—persevere.`,
      `The sands have fallen. ${stake} Mana gone. Yet failure is but a lesson in disguise.`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { voice: 'dumbledore' });
  }

  async speakBreakdownComplete(taskCount: number) {
    const messages = [
      `Your quest has been divided into ${taskCount} manageable tasks. Each step brings you closer to victory.`,
      `Observe: ${taskCount} tasks laid before you. Conquer them one by one.`,
      `The path is clear. ${taskCount} challenges await. Begin when ready.`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    await this.speak(message, { voice: 'hermione' });
  }

  async speakWarning() {
    await this.speak("Time grows short. Maintain your focus.", { voice: 'mcgonagall' });
  }
}

// Export singleton instance
export const voiceService = new ElevenLabsService();

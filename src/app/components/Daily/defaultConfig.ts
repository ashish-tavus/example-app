import { DailyConfig } from './DailyConfig';

export const defaultDailyConfig: DailyConfig = {
  disableVideo: false,
  disableAudio: false,
  enableScreenShare: false,
  enableChat: false,
  enableRecording: false,
  enableClosedCaptions: false,
  enableBackgroundBlur: false,
  enableNoiseSuppression: false,
  enableEchoCancellation: false,
  enableLowBandwidthMode: false,
  maxParticipants: 10,
  videoQuality: 'medium',
};

// Configuration presets for different use cases
export const dailyConfigPresets = {
  basic: {
    name: 'Basic Meeting',
    config: {
      ...defaultDailyConfig,
      enableScreenShare: false,
      enableChat: false,
      enableRecording: false,
      enableClosedCaptions: false,
      maxParticipants: 5,
    },
  },
  presentation: {
    name: 'Presentation Mode',
    config: {
      ...defaultDailyConfig,
      enableScreenShare: false,
      enableRecording: false,
      enableClosedCaptions: false,
      videoQuality: 'high',
      maxParticipants: 20,
    },
  },
  lowBandwidth: {
    name: 'Low Bandwidth',
    config: {
      ...defaultDailyConfig,
      enableLowBandwidthMode: false,
      videoQuality: 'low',
      enableBackgroundBlur: false,
      maxParticipants: 8,
    },
  },
  interview: {
    name: 'Interview Mode',
    config: {
      ...defaultDailyConfig,
      enableBackgroundBlur: false,
      enableNoiseSuppression: false,
      enableEchoCancellation: false,
      videoQuality: 'high',
      maxParticipants: 2,
    },
  },
}; 
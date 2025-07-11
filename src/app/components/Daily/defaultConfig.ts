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
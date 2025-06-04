# import numpy as np
# import librosa
#
# def process_signal_realtime(signal, n_fft=512, sr=48000, hop_length=256, alpha=2.0, beta=0.02):
#     noise_duration = min(sr // 4, int(len(signal) * 0.1))
#     noise_profile = signal[:noise_duration]
#     if len(signal) <= n_fft:
#         n_fft = max(64, 2**(int(np.log2(len(signal))) - 1))
#         hop_length = max(32, n_fft // 4)
#
#     stft = librosa.stft(signal, n_fft=n_fft, hop_length=hop_length)
#     magnitude = np.abs(stft)
#     phase = np.angle(stft)
#
#     noise_stft = librosa.stft(noise_profile, n_fft=n_fft, hop_length=hop_length)
#     noise_magnitude = np.abs(noise_stft)
#     noise_power = np.mean(noise_magnitude**2, axis=1).reshape(-1, 1)
#
#     power_spec = magnitude**2
#     subtracted_power = np.maximum(power_spec - alpha * noise_power, beta * power_spec)
#     enhanced_magnitude = np.sqrt(subtracted_power)
#     enhanced_stft = enhanced_magnitude * np.exp(1j * phase)
#
#     enhanced_signal = librosa.istft(enhanced_stft, hop_length=hop_length, length=len(signal))
#     return enhanced_signal
#

import numpy as np
import librosa

def process_signal_realtime(signal, n_fft=512, sr=48000, hop_length=256, alpha=2.0, beta=0.02):
    if len(signal) < 10:
        return signal

    noise_duration = max(1, min(sr // 4, int(len(signal) * 0.1)))

    if noise_duration >= len(signal):
        noise_duration = max(1, len(signal) // 4)

    noise_profile = signal[:noise_duration]

    if len(signal) <= n_fft:
        n_fft = max(64, 2 ** (int(np.log2(len(signal) + 1)) - 1))
        hop_length = max(32, n_fft // 4)

    stft = librosa.stft(signal, n_fft=n_fft, hop_length=hop_length)
    magnitude = np.abs(stft)
    phase = np.angle(stft)

    noise_stft = librosa.stft(noise_profile, n_fft=n_fft, hop_length=hop_length)
    noise_magnitude = np.abs(noise_stft)

    if noise_magnitude.shape[1] == 0:
        noise_power = np.mean(magnitude ** 2, axis=1) * 0.1
    else:
        noise_power = np.mean(noise_magnitude ** 2, axis=1)

    noise_power = noise_power.reshape(-1, 1)

    power_spec = magnitude ** 2
    subtracted_power = np.maximum(power_spec - alpha * noise_power, beta * power_spec)
    enhanced_magnitude = np.sqrt(subtracted_power)
    enhanced_stft = enhanced_magnitude * np.exp(1j * phase)

    enhanced_signal = librosa.istft(enhanced_stft, hop_length=hop_length, length=len(signal))

    return enhanced_signal
import {RtpCodecCapability} from "mediasoup/node/lib/rtpParametersTypes";

export const mediaCodecs: RtpCodecCapability[] = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
        parameters: {
            useinbandfec: 1,
            stereo: 1
        }
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 1000,
            'x-google-min-bitrate': 100,
            'x-google-max-bitrate': 900000,
        }
    }
];
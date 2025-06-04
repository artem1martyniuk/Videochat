import socketio
from aiortc import RTCPeerConnection, RTCIceCandidate, RTCSessionDescription
from aiortc.contrib.media import MediaRelay
from fastapi import FastAPI
import uvicorn
import torch
from aiortc.mediastreams import MediaStreamTrack
from av import AudioFrame
import numpy as np
from rnnoise_wrapper import RNNoise

rnnoise = RNNoise()
relay = MediaRelay()
sio = socketio.AsyncServer(cors_allowed_origins="http://localhost:3000", async_mode="asgi")
app = FastAPI()

app.mount("/", socketio.ASGIApp(sio))

peer_connections = {}

class AudioTransformTrack(MediaStreamTrack):
    kind = "audio"

    def __init__(self, track):
        super().__init__()
        self.buffer = np.array([], dtype=np.float32)
        self.buffer_size = 1920
        self.track = track

    async def recv(self):
        frame = await self.track.recv()
        original_array = frame.to_ndarray()

        if original_array.shape[0] > 1:
            pcm_mono = np.mean(original_array, axis=0).astype(np.int16)
        else:
            pcm_mono = original_array[0].astype(np.int16)

        block_size = 480
        total_samples = len(pcm_mono)
        processed_blocks = []

        for i in range(0, total_samples, block_size):
            block = pcm_mono[i:i + block_size]

            if len(block) < block_size:
                block = np.pad(block, (0, block_size - len(block)), 'constant')

            block_bytes = block.tobytes()
            denoised = rnnoise.filter_frame(block_bytes)

            denoised_block = np.frombuffer(denoised[1], dtype=np.int16)
            processed_blocks.append(denoised_block)
        pcm_array = np.concatenate(processed_blocks)

        pcm_array = pcm_array[:total_samples]

        pcm_2d = pcm_array.reshape(1, -1)

        new_frame = AudioFrame.from_ndarray(pcm_2d, format='s16', layout='mono')
        new_frame.sample_rate = 96000
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame

@sio.event
async def create_offer(sid, data):
    try:
        print(f"Creating offer for client {sid}")
        offer_sdp = data.get('offer').get('sdp')
        offer_type = 'offer'

        pc = RTCPeerConnection()
        peer_connections[sid] = pc

        @pc.on("track")
        def on_track(track):
            print(f"Received {track.kind} track from {sid}")
            if track.kind == "audio":
                transformed_track = AudioTransformTrack(relay.subscribe(track))
                pc.addTrack(transformed_track)
                print(f"Added transformed audio track for client {sid}")

        @pc.on("connectionstatechange")
        async def on_connection_state_change():
            print(f"Connection state for client {sid} is {pc.connectionState}")
            if pc.connectionState == "failed" or pc.connectionState == "closed":
                if sid in peer_connections:
                    del peer_connections[sid]
                    print(f"Removed peer connection for client {sid}")

        @pc.on("icecandidate")
        async def on_ice_candidate(candidate):
            if candidate:
                print(f"Sending ICE candidate to client {sid}")
                await sio.emit('candidate', {
                    'candidate': candidate.sdp,
                    'sdpMid': candidate.sdpMid,
                    'sdpMLineIndex': candidate.sdpMLineIndex
                }, room=sid)

        offer = RTCSessionDescription(sdp=offer_sdp, type=offer_type)
        await pc.setRemoteDescription(offer)
        print(f"Remote description set for client {sid}")

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        print(f"Local description set for client {sid}")

        await sio.emit('create_answer', {
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type
        }, room=sid)
        print(f"Answer sent to client {sid}")

    except Exception as e:
        print(f"Error in create_offer for client {sid}: {e}")
        await sio.emit('error', {'message': str(e)}, room=sid)


@sio.event
async def add_ice_candidate(sid, data):
    try:
        pc = peer_connections.get(sid)
        if pc:
            candidate = RTCIceCandidate(
                sdpMid=data.get('sdpMid'),
                sdpMLineIndex=data.get('sdpMLineIndex'),
                sdp=data.get('candidate')
            )
            await pc.addIceCandidate(candidate)
            print(f"Added ICE candidate for client {sid}")
        else:
            print(f"No peer connection found for client {sid}")
    except Exception as e:
        print(f"Error adding ICE candidate for client {sid}: {e}")


@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    pc = peer_connections.pop(sid, None)
    if pc:
        await pc.close()
        print(f"Closed peer connection for client {sid}")


@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    await sio.emit('message', "Connected to audio processing server", room=sid)


if __name__ == "__main__":
    print("Starting audio processing server on 0.0.0.0:5002")
    uvicorn.run(app, host="0.0.0.0", port=5002)
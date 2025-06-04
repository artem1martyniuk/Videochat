import socketio
from aiortc import RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, RTCIceServer, RTCConfiguration
from aiortc.contrib.media import MediaRelay
import torch
from fastapi import FastAPI
import uvicorn
from aiortc.mediastreams import MediaStreamTrack
from av import VideoFrame
from PIL import Image, ImageFilter
import numpy as np
from model import UNet
import torchvision.transforms as transforms

relay = MediaRelay()
sio = socketio.AsyncServer(cors_allowed_origins="http://localhost:3000", async_mode="asgi")
app = FastAPI()

app.mount("/", socketio.ASGIApp(sio))

model = UNet()
model.load_state_dict(torch.load("mask.pth", map_location=torch.device("cpu")))
model.eval()

t = transforms.Compose([
    transforms.Resize((96, 96)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.491, 0.467, 0.445], std=[0.237, 0.228, 0.231])
])

device = "cuda" if torch.cuda.is_available() else "cpu"

ice_servers = [
    RTCIceServer(urls="stun:stun.l.google.com:19302"),
    RTCIceServer(urls="stun:stun1.l.google.com:19302"),
    RTCIceServer(urls="stun:stun2.l.google.com:19302"),
    RTCIceServer(urls="stun:stun.services.mozilla.com"),
    RTCIceServer(urls="stun:global.stun.twilio.com:3478"),
]

iceConfig = RTCConfiguration(iceServers=ice_servers)

pcs = {}

class VideoTransformTrack(MediaStreamTrack):
    """
    A video track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track):
        super().__init__()
        self.track = track

    async def recv(self):
        frame = await self.track.recv()
        img_array = frame.to_ndarray(format="bgr24")
        # Store original size before conversion
        original_height, original_width = img_array.shape[:2]
        # Convert to PIL Image for transformations
        img = Image.fromarray(img_array)

        input_tensor = t(img).unsqueeze(0)
        with torch.no_grad():
            output = model(input_tensor)

        output_image = torch.sigmoid(output)
        seg_mask = (output_image.squeeze() < 0.3).cpu().numpy().astype("uint8") * 255

        segmentation_pil = Image.fromarray(seg_mask).convert("L")
        # Use the stored dimensions, but note PIL uses (width, height) order
        segmentation_pil = segmentation_pil.resize((original_width, original_height))

        blurred_im = img.filter(ImageFilter.GaussianBlur(radius=20))
        composed = Image.composite(blurred_im, img, segmentation_pil)

        blurred_img = np.array(composed)

        new_frame = VideoFrame.from_ndarray(blurred_img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base

        return new_frame


@sio.event
async def create_offer(sid, data):
    pc = RTCPeerConnection(configuration=iceConfig)
    pcs[sid] = pc

    @pc.on("icecandidate")
    async def on_ice_candidate(candidate):
        print(f"\n[96] candidate : {candidate}\n")
        await sio.emit('candidate', {'candidate': candidate})

    offer_sdp = data.get('offer').get('sdp')
    offer_type = 'offer'

    @pc.on("track")
    def on_track(track):
        print("State:", track.readyState)
        print("\nReceived track:", track.kind)
        if track.kind == "video":
            transformed_track = VideoTransformTrack(relay.subscribe(track))
            print('[98] adding track')
            pc.addTrack(transformed_track)

    offer = RTCSessionDescription(sdp=offer_sdp, type=offer_type)
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await sio.emit('create_answer', {'sdp': pc.localDescription.sdp, "type": pc.localDescription.type})


@sio.event
async def new_ice_candidate(sid, data):
    pc = pcs[sid]
    print(f"\n[111] data_candidate: {data.get('candidate').get('candidate')}\n")
    candidate_data = data.get('candidate').get('candidate').split()
    ip = candidate_data[4]
    port = candidate_data[5]
    priority = candidate_data[3]
    protocol = candidate_data[2]
    candidate_type = candidate_data[7]
    foundation = candidate_data[0][11:]
    component = candidate_data[1]
    print(f"\n[120] foundation: {foundation}\n")
    sdpMid = data.get('candidate').get('sdpMid')
    candidate = RTCIceCandidate(component, foundation, ip, port, priority, protocol, candidate_type, sdpMid=sdpMid)
    await pc.addIceCandidate(candidate)


@sio.event
async def connect(sid, environ):
    print(f"\nClient {sid} connected\n")
    await sio.emit('message', "Hello, welcome!", room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    pc = pcs.pop(sid, None)
    if pc:
        await pc.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)

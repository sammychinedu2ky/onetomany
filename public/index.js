window.onload = () => {
    document.getElementById('my-button').onclick = async() => {
        
        document.getElementById('my-button').innerText = 'Clicked';
        // disable button 
        document.getElementById('my-button').disabled = true;
        // change value to clicked
        await init();
        // unhide the viewer id
        document.getElementById('viewer').style.display = 'block'; 
    }
}

async function init(){
   // const stream = await navigator.mediaDevices.getUserMedia({video: true});
    // get screen streaming stream
    const stream = await navigator.mediaDevices.getDisplayMedia({video: true});
   // document.getElementById("video").srcObject = stream;
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

}

function createPeer(){
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
    return peer;
}

async function handleNegotiationNeededEvent(peer){
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };
    const {data} = await axios.post("/broadcast", payload);
    const desc = new RTCSessionDescription(data.sdp);
    await peer.setRemoteDescription(desc).catch(e => console.log(e));
}

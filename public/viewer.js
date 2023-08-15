window.onload=()=>{
    document.getElementById('my-button').onclick =()=>{
        // disable button
        document.getElementById('my-button').disabled = true;
        // change value to clicked
        document.getElementById('my-button').innerText = 'clicked';
      init();
    }
}

async function init(){
    const peer = createPeer();
    peer.addTransceiver('video', {direction: 'recvonly'});
}

function createPeer(){
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.stunprotocol.org'
            }
        ]});
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
    }


async function handleNegotiationNeededEvent(peer){
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };
    const {data} = await axios.post('/consumer', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function handleTrackEvent(e){
    const stream = new MediaStream([e.track]);
    const video = document.getElementById('video');
    video.srcObject = stream;
}

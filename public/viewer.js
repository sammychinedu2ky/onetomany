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
    console.log(data)
    if(Object.keys(data).length === 0) {
        console.log('no tracks')
        return;
    }
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function handleTrackEvent(e){
    const stream = new MediaStream([e.track]);
    // check if there is a stream in e
    if (e.streams.length > 0){
        console.log('got stream');
        console.log(stream);
        // add stream to video
        const video = document.getElementById('video');
        video.srcObject = stream;
    }
    else {
        console.log('no stream');
    }
    
}

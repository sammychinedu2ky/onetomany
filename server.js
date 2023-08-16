const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const webrtc = require('wrtc');
const fs = require('fs')
const https = require('https')
const http = require('http')
var os = require( 'os' );
const QRCode = require('qrcode');
var networkInterfaces = os.networkInterfaces();
var arr = networkInterfaces['Wi-Fi'][1]
var viewer = `https://${arr.address}:3000/viewer.html`
var broadcaster = `https://localhost:3000`
console.log(`Viewer: ${viewer}`)
console.log(`Broadcaster: ${broadcaster}`)
QRCode.toFile('public/viewer.png', viewer, function (err) {
    if (err) throw err
})

let senderStream;

app.use(express.static("public"));
app. use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/broadcast', async({body},res) =>{
    senderStream = null;
    console.log('broadcast')
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack =(e) => handleTrackEvent(e,peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    };
    res.json(payload);
 
});

app.post('/consumer', async({body},res) =>{
    if(!senderStream) return res.json({});
    console.log('consume')
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track,senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer); 
    const payload = {
        sdp: peer.localDescription
    };
    res.json(payload);
});  

function handleTrackEvent(e,peer){
    senderStream = e.streams[0];
}
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
},app).listen(3000, () => console.log("Server started"));


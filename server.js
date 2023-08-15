const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const webrtc = require('wrtc');
const fs = require('fs')
const https = require('https')
const http = require('http')
let senderStream;

app.use(express.static("public"));
app. use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/broadcast', async({body},res) =>{
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
    console.log("hi")
    const payload = {
        sdp: peer.localDescription
    };

    res.json(payload);
 
});

app.post('/consumer', async({body},res) =>{
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
},app).listen(80, () => console.log("Server started on port 3000"));


app.get("*", function(req, res, next) {
    res.redirect("https://" + req.headers.host + req.path);
});

http.createServer(app).listen(3000, function() {
    console.log("Express TTP server listening on port 3000");
});

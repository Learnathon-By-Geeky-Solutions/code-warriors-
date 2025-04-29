import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./VideoCall.css"; // Import the CSS for styling

const VideoCall = () => {
  const [inCall, setInCall] = useState(false);
  const [appId, setAppId] = useState(""); // Your Agora App ID
  const [channel, setChannel] = useState("hello"); // Default Channel Name
  const [token, setToken] = useState(null); // Token (optional)
  const [uid, setUid] = useState(null); // User ID (optional)

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const remoteUsersRef = useRef([]);
  const remotePlayersRef = useRef({}); // To store remote player containers

  const localVideoRef = useRef(null); // Ref for local video element

  // Initialize Agora Client
  const initializeClient = () => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;
    setupEventListeners(client);
  };

  // Set up Agora Event Listeners
  const setupEventListeners = (client) => {
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);
  };

  // Handle when a remote user publishes a track
  const handleUserPublished = async (user, mediaType) => {
    await clientRef.current.subscribe(user, mediaType);
    console.log("Subscribed to user:", user.uid, "MediaType:", mediaType);

    if (mediaType === "video") {
      displayRemoteVideo(user);
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  };

  // Handle when a remote user unpublishes a track
  const handleUserUnpublished = (user) => {
    const playerContainer = document.getElementById(user.uid);
    if (playerContainer) {
      playerContainer.remove();
    }
    // Remove from remoteUsersRef
    remoteUsersRef.current = remoteUsersRef.current.filter(
      (u) => u.uid !== user.uid
    );
  };

  // Handle when a remote user leaves the channel
  const handleUserLeft = (user) => {
    const playerContainer = document.getElementById(user.uid);
    if (playerContainer) {
      playerContainer.remove();
    }
    // Remove from remoteUsersRef
    remoteUsersRef.current = remoteUsersRef.current.filter(
      (u) => u.uid !== user.uid
    );
  };

  // Display Remote Video
  const displayRemoteVideo = (user) => {
    const remoteVideoTrack = user.videoTrack;
    const remotePlayerContainer = document.createElement("div");
    remotePlayerContainer.id = user.uid.toString();
    remotePlayerContainer.className = "remote-player";
    remotePlayerContainer.innerHTML = `<p class="remote-username">User ${user.uid}</p>`;
    document
      .getElementById("remote-container")
      .appendChild(remotePlayerContainer);
    remoteVideoTrack.play(remotePlayerContainer);
    remoteUsersRef.current.push(user);
  };

  // Join the channel
  const joinVideo = async () => {
    if (!appId || !channel) {
      alert("Please enter both App ID and Channel Name.");
      return;
    }

    initializeClient();

    try {
      await clientRef.current.join(appId, channel, token, uid);
      console.log("Successfully joined the channel");

      // Ensure any existing tracks are closed before creating new ones
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }

      // List available cameras and select default
      const devices = await AgoraRTC.getCameras();
      let selectedCamera =
        devices.find((device) => device.isDefault) || devices[0];

      if (!selectedCamera) {
        console.warn("No camera devices found. Proceeding without video.");
      }

      // Create and publish local tracks with selected camera
      localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      if (selectedCamera) {
        localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack({
          cameraId: selectedCamera.deviceId,
        });
      }
      await clientRef.current.publish([
        localAudioTrackRef.current,
        localVideoTrackRef.current,
      ]);
      console.log("Published local audio and video tracks");

      // Display Local Video
      if (localVideoRef.current && localVideoTrackRef.current) {
        localVideoTrackRef.current.play(localVideoRef.current);
      }

      setInCall(true);
    } catch (error) {
      console.error("Failed to join the channel or publish tracks:", error);
    }
  };

  // Leave the channel and clean up
  const leaveVideo = async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.leave();
        console.log("Left the channel");
      }

      // Close and nullify local tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }

      // Stop local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      // Remove all remote video containers
      remoteUsersRef.current.forEach((user) => {
        const remotePlayerContainer = document.getElementById(user.uid);
        if (remotePlayerContainer) {
          remotePlayerContainer.remove();
        }
      });
      remoteUsersRef.current = [];

      setInCall(false);
    } catch (error) {
      console.error("Failed to leave the channel:", error);
    }
  };

  return (
    <div className="video-call-container">
      {!inCall ? (
        <div className="form-container">
          <h2>Join a Video Call</h2>
          <div className="form-group">
            <label htmlFor="app-id">Agora App ID:</label>
            <input
              type="text"
              id="app-id"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Enter your Agora App ID"
            />
          </div>
          <div className="form-group">
            <label htmlFor="channel-name">Channel Name:</label>
            <input
              type="text"
              id="channel-name"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Enter Channel Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="token">Token (Optional):</label>
            <input
              type="text"
              id="token"
              value={token || ""}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter Token if available"
            />
          </div>
          <button className="join-button" onClick={joinVideo}>
            Join Call
          </button>
        </div>
      ) : (
        <div className="call-container">
          <button className="leave-button" onClick={leaveVideo}>
            Leave Call
          </button>
          <div className="video-container" id="local-container">
            <div className="local-player">
              <video
                ref={localVideoRef}
                className="video"
                autoPlay
                muted
                playsInline
              />
              <p className="local-username">You</p>
            </div>
          </div>
          <div className="video-container" id="remote-container"></div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
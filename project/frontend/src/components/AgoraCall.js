// src/components/AgoraCall.js
import AgoraRTC from "agora-rtc-sdk-ng";

// Primary client for camera + mic
// Second (screen) client for screen share
let rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,

  screenClient: null,
  localScreenTrack: null,
};

let isCameraEnabled = true;
let isMicEnabled = true;
let isScreenSharing = false;

// Keep track of remote users
let activeUsers = new Set();

// We'll store these after .join() calls so we know which UIDs are ours
let mainClientUid = null;
let screenClientUid = null;

/**
 * Check if a given user.uid is actually "me" (main or screen).
 */
function isLocalUid(uid) {
  const uidStr = String(uid);
  return (
    uidStr === String(mainClientUid) ||
    (screenClientUid && uidStr === String(screenClientUid))
  );
}

// ---------- MAIN CLIENT ----------
export function initializeClient() {
  if (!rtc.client) {
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupMainClientListeners(rtc.client);
    console.log("AgoraRTC main client initialized");
  }
  return rtc.client;
}

function setupMainClientListeners(client) {
  client.on("user-published", async (user, mediaType) => {
    try {
      if (isLocalUid(user.uid)) return;
      await client.subscribe(user, mediaType);
      console.log("Subscribed to user:", user.uid, mediaType);
      activeUsers.add(user.uid);

      if (mediaType === "video" && user.videoTrack) {
        displayRemoteVideo(user);
      }
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error("[MainClient] user-published error:", error);
    }
  });

  client.on("user-unpublished", async (user, mediaType) => {
    if (!isLocalUid(user.uid)) {
      await client.unsubscribe(user, mediaType);
    }
    if (mediaType === "video") {
      removeRemoteVideo(user.uid);
    }
    activeUsers.delete(user.uid);
  });

  client.on("user-left", (user) => {
    if (!isLocalUid(user.uid)) {
      removeRemoteVideo(user.uid);
      activeUsers.delete(user.uid);
    }
  });
}

// ---------- SCREEN CLIENT ----------
function initializeScreenClient() {
  if (!rtc.screenClient) {
    rtc.screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setupScreenClientListeners(rtc.screenClient);
    console.log("AgoraRTC screen client initialized");
  }
  return rtc.screenClient;
}

function setupScreenClientListeners(client) {
  client.on("user-published", async (user, mediaType) => {
    if (isLocalUid(user.uid)) return;
    await client.subscribe(user, mediaType);
    activeUsers.add(user.uid);

    if (mediaType === "video" && user.videoTrack) {
      displayRemoteVideo(user);
    }
    if (mediaType === "audio" && user.audioTrack) {
      user.audioTrack.play();
    }
  });

  client.on("user-unpublished", async (user, mediaType) => {
    if (!isLocalUid(user.uid)) {
      await client.unsubscribe(user, mediaType);
    }
    if (mediaType === "video") {
      removeRemoteVideo(user.uid);
    }
    activeUsers.delete(user.uid);
  });

  client.on("user-left", (user) => {
    if (!isLocalUid(user.uid)) {
      removeRemoteVideo(user.uid);
      activeUsers.delete(user.uid);
    }
  });
}

// ---------- DISPLAY / REMOVE REMOTE VIDEO ----------
function displayRemoteVideo(user) {
  const remoteVideoTrack = user.videoTrack;
  if (!remoteVideoTrack) return;

  const remoteContainer = document.getElementById("remote-videos");
  if (!remoteContainer) return;

  let container = document.getElementById(`remote-${user.uid}`);
  if (!container) {
    container = document.createElement("div");
    container.id = `remote-${user.uid}`;
    container.className = "remote-video-container";
    container.style.width = "200px";
    container.style.height = "150px";
    container.style.position = "relative";
    container.style.overflow = "hidden";
    container.style.borderRadius = "8px";
    container.style.margin = "5px";

    // Label
    const label = document.createElement("div");
    label.className = "user-label";
    label.textContent = `User ${user.uid}`;
    label.style.position = "absolute";
    label.style.bottom = "5px";
    label.style.left = "5px";
    label.style.color = "white";
    label.style.background = "rgba(0, 0, 0, 0.5)";
    label.style.padding = "2px 5px";
    label.style.borderRadius = "4px";
    container.appendChild(label);

    remoteContainer.appendChild(container);
  }

  // Stop existing playback if any
  remoteVideoTrack.stop();
  remoteVideoTrack.play(container);
}

function removeRemoteVideo(uid) {
  const container = document.getElementById(`remote-${uid}`);
  if (container) {
    container.remove();
  }
}

// ---------- CLEANUP CONTAINERS ----------
function cleanupVideoContainers() {
  ["local-video", "remote-videos", "screen-video"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = "";
      el.style.display = "none";
    }
  });
}

// ---------- JOIN WITH CAMERA+MIC ----------
export async function joinVideo(appId, channel, token = null, uid = null) {
  try {
    if (!rtc.client) {
      initializeClient();
    }
    cleanupVideoContainers();

    const localDiv = document.getElementById("local-video");
    const remoteDiv = document.getElementById("remote-videos");
    if (localDiv) localDiv.style.display = "block";
    if (remoteDiv) remoteDiv.style.display = "block";

    mainClientUid = await rtc.client.join(appId, channel, token, uid);

    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 },
    });
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: {
        width: 640,
        height: 360,
        frameRate: 30,
        bitrateMin: 400,
        bitrateMax: 1000,
      },
      optimizationMode: "detail",
    });

    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
    console.log("Published camera + mic");

    if (localDiv && rtc.localVideoTrack) {
      rtc.localVideoTrack.play(localDiv);
    }
    return true;
  } catch (error) {
    console.error("Error joining video:", error);
    await cleanupTracks();
    throw error;
  }
}

// ---------- JOIN AUDIO-ONLY ----------
export async function joinChannelNoCamera(appId, channel, token = null, uid = null) {
  try {
    if (!rtc.client) {
      initializeClient();
    }
    cleanupVideoContainers();

    const remoteDiv = document.getElementById("remote-videos");
    if (remoteDiv) remoteDiv.style.display = "block";

    mainClientUid = await rtc.client.join(appId, channel, token, uid);
    console.log("Audio-only client joined");

    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 },
    });
    await rtc.client.publish(rtc.localAudioTrack);
    console.log("Published audio track only");

    return true;
  } catch (error) {
    console.error("Error joining audio-only:", error);
    await cleanupTracks();
    throw error;
  }
}

// ---------- LEAVE CHANNEL ----------
export async function leaveVideo() {
  try {
    if (isScreenSharing) {
      await stopScreenShare();
    }
    await cleanupTracks();

    if (rtc.client) {
      await rtc.client.leave();
    }
    mainClientUid = null;
    screenClientUid = null;
    isCameraEnabled = true;
    isMicEnabled = true;
    isScreenSharing = false;
    activeUsers.clear();

    cleanupVideoContainers();
  } catch (error) {
    console.error("Error leaving video:", error);
    throw error;
  }
}

// ---------- CLEAN UP TRACKS ----------
async function cleanupTracks() {
  try {
    if (rtc.localAudioTrack) {
      rtc.localAudioTrack.close();
      rtc.localAudioTrack = null;
    }
    if (rtc.localVideoTrack) {
      rtc.localVideoTrack.close();
      rtc.localVideoTrack = null;
    }
    if (rtc.localScreenTrack) {
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
    }
  } catch (err) {
    console.error("Error cleaning up tracks:", err);
  }
}

// ---------- TOGGLE CAMERA & MIC ----------
export async function toggleCamera() {
  try {
    if (!rtc.localVideoTrack) return { isOn: isCameraEnabled };
    await rtc.localVideoTrack.setEnabled(!isCameraEnabled);
    isCameraEnabled = !isCameraEnabled;
    return { isOn: isCameraEnabled };
  } catch {
    return { isOn: isCameraEnabled };
  }
}

export async function toggleMic() {
  try {
    if (!rtc.localAudioTrack) return { isOn: isMicEnabled };
    await rtc.localAudioTrack.setEnabled(!isMicEnabled);
    isMicEnabled = !isMicEnabled;
    return { isOn: isMicEnabled };
  } catch {
    return { isOn: isMicEnabled };
  }
}

// ---------- SCREEN SHARE (2ND CLIENT) ----------
async function startScreenShare(appId, channel, token = null, uid = null) {
  try {
    if (isScreenSharing) return;
    if (!rtc.screenClient) {
      initializeScreenClient();
    }

    screenClientUid = await rtc.screenClient.join(
      appId,
      channel,
      token,
      uid ? uid + "-screen" : null
    );

    rtc.localScreenTrack = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: {
        frameRate: 15,
        bitrateMax: 1200,
        optimizationMode: "detail",
      },
    });

    await rtc.screenClient.publish(rtc.localScreenTrack);
    console.log("Screen share published");

    isScreenSharing = true;

    const screenDiv = document.getElementById("screen-video");
    if (screenDiv) {
      screenDiv.innerHTML = "";
      rtc.localScreenTrack.play(screenDiv);
      screenDiv.style.display = "block";
    }

    rtc.localScreenTrack.on("track-ended", () => {
      stopScreenShare();
    });
  } catch (error) {
    throw error;
  }
}

async function stopScreenShare() {
  try {
    if (!isScreenSharing) return;
    if (rtc.localScreenTrack) {
      await rtc.screenClient.unpublish(rtc.localScreenTrack);
      rtc.localScreenTrack.close();
      rtc.localScreenTrack = null;
    }
    if (rtc.screenClient) {
      await rtc.screenClient.leave();
      rtc.screenClient = null;
    }
    screenClientUid = null;
    isScreenSharing = false;

    const screenDiv = document.getElementById("screen-video");
    if (screenDiv) {
      screenDiv.innerHTML = "";
      screenDiv.style.display = "none";
    }
  } catch (error) {
    throw error;
  }
}

// Toggle screen sharing on/off
export async function toggleScreenShare(appId, channel, token = null, uid = null) {
  try {
    if (isScreenSharing) {
      await stopScreenShare();
      return { isScreenSharing: false };
    } else {
      await startScreenShare(appId, channel, token, uid);
      return { isScreenSharing: true };
    }
  } catch (error) {
    console.error("Error toggling screen share:", error);
    return { isScreenSharing };
  }
}

// ---------- GETTERS ----------
export function getCameraStatus() {
  return isCameraEnabled;
}
export function getMicStatus() {
  return isMicEnabled;
}
export function getScreenShareStatus() {
  return isScreenSharing;
}
export function getActiveUsers() {
  return Array.from(activeUsers);
}
export function getClient() {
  return rtc.client;
}
/** If you want the local screen track for any reason: */
export function getLocalScreenTrack() {
  return rtc.localScreenTrack;
}

// src/services/AgoraService.ts

import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

let client: IAgoraRTCClient | null = null;
let localAudioTrack: ILocalAudioTrack | null = null;
let localVideoTrack: ILocalVideoTrack | null = null;

export const initializeAgora = () => {
  if (!client) {
    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  }
};

export const joinVideo = async (
  appId: string,
  channel: string,
  token: string | null,
  uid: number | null,
  onUserPublished: (user: any, mediaType: string) => void,
  onUserUnpublished: (user: any) => void,
  onUserLeft: (user: any) => void
) => {
  if (!client) {
    initializeAgora();
  }

  client!.on("user-published", onUserPublished);
  client!.on("user-unpublished", onUserUnpublished);
  client!.on("user-left", onUserLeft);

  try {
    await client!.join(appId, channel, token, uid);
    console.log("Joined channel:", channel);

    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    await client!.publish([localAudioTrack, localVideoTrack]);
    console.log("Published local tracks");
  } catch (error) {
    console.error("Error joining channel:", error);
  }
};

export const leaveVideo = async () => {
  if (!client) return;

  try {
    await client.leave();
    console.log("Left channel");

    if (localAudioTrack) {
      localAudioTrack.close();
      localAudioTrack = null;
    }

    if (localVideoTrack) {
      localVideoTrack.close();
      localVideoTrack = null;
    }

    // Remove all event listeners
    client!.removeAllListeners();
  } catch (error) {
    console.error("Error leaving channel:", error);
  }
};

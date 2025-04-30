// GameCanvas.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import WebSocketService from "../services/WebSocketService";
import Chatbox from "./Chatbox";
import DiscordDialog from "./DiscordDialog";
import {
  joinVideo,
  leaveVideo,
  toggleCamera,
  toggleMic,
  toggleScreenShare,
} from "./AgoraCall";
import {
  FaComments,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  
  FaDiscord,
  FaDoorOpen,
} from "react-icons/fa";
import styles from "./GameCanvas.module.css";

// Instead of "ScreenShareModal", we now import "RemoteVideoModal"
import RemoteVideoModal from "./RemoteVideoModal";

const AGORA_APP_ID = "aa57b40426c74add85bb5dcae4557ef6";

function GameCanvas({ playerName, roomId }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  // Local Player
  const playerRef = useRef(null);
  const playerNameTagRef = useRef(null);
  const didCreateLocalSpriteRef = useRef(false);

  // Remote Players
  const otherPlayers = useRef({});

  // Video Proximity
  const activeCallRef = useRef(false);

  // Chair Logic
  const nearChairRef = useRef(null);
  const isPlayerSittingRef = useRef(false);
  const CHAIR_PROXIMITY = 40;

  // UI States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  // Streams from other logic (not necessarily used)
  const [remoteStreams, setRemoteStreams] = useState([]);

  // Discord Dialog
  const [isDiscordOpen, setIsDiscordOpen] = useState(false);
  const [selectedDiscordChannel, setSelectedDiscordChannel] = useState(null);

  const openDiscord = () => setIsDiscordOpen(true);
  const closeDiscord = () => setIsDiscordOpen(false);

  // --------------- NEW: The UID of the remote feed we want to "zoom" ---------------
  const [zoomUid, setZoomUid] = useState(null);

  // Movement / Interpolation
  const PROXIMITY_THRESHOLD = 100;
  const PLAYER_SPEED = 3600;
  const UPDATE_INTERVAL = 1000 / 30;
  const INTERPOLATION_DELAY = 100;
  const CLEANUP_DELAY = 1000;

  const prevMovingRef = useRef(false);
  const prevDirectionRef = useRef("down");
  const lastUpdateRef = useRef(0);

  const cleanupTimeoutRef = useRef(null);

  // ---------- Kaboom Setup ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const k = kaboom({
      global: false,
      width: 800,
      height: 500,
      scale: 2,
      camScale: 2,
      debug: false,
      background: [0, 0, 0, 1],
      canvas: canvasRef.current,
      // stretch: true,
      letterbox: false,
    });
    gameRef.current = k;

    // Load Sprites
    k.loadSprite("player", "/ash.png", {
      sliceX: 52,
      sliceY: 1,
      anims: {
        "idle-right": { from: 0, to: 5, speed: 10, loop: true },
        "idle-up": { from: 6, to: 11, speed: 10, loop: true },
        "idle-left": { from: 12, to: 17, speed: 10, loop: true },
        "idle-down": { from: 18, to: 23, speed: 10, loop: true },
        "run-right": { from: 24, to: 29, speed: 15, loop: true },
        "run-up": { from: 30, to: 35, speed: 15, loop: true },
        "run-left": { from: 36, to: 41, speed: 15, loop: true },
        "run-down": { from: 42, to: 47, speed: 15, loop: true },
        "sit-down": { from: 48, to: 48, speed: 1, loop: false },
        "sit-up": { from: 49, to: 49, speed: 1, loop: false },
        "sit-left": { from: 50, to: 50, speed: 1, loop: false },
        "sit-right": { from: 51, to: 51, speed: 1, loop: false },
      },
    });
    k.loadSprite("map", "/mapfinal1.png");

    // Start Game (but do NOT spawn local sprite until we see server data)
    const startGame = async () => {
      try {
        const mapResp = await fetch("/mapfinal1.json");
        if (!mapResp.ok) {
          throw new Error(`Failed to load map.json: ${mapResp.statusText}`);
        }
        const mapData = await mapResp.json();

        const map = k.add([k.pos(0, 0), k.anchor("topleft")]);
        map.add([k.sprite("map"), k.anchor("topleft")]);

        // Boundaries
        const boundariesLayer = mapData.layers.find((l) => l.name === "boundaries");
        if (boundariesLayer?.objects) {
          boundariesLayer.objects.forEach((obj) => {
            k.add([
              k.rect(obj.width, obj.height),
              k.pos(obj.x, obj.y),
              k.area(),
              k.body({ isStatic: true }),
              k.opacity(0),
              "boundary",
            ]);
          });
        }

        // Chairs
        const chairDirections = ["up", "down", "left", "right"];
        chairDirections.forEach((direction) => {
          const chairLayer = mapData.layers.find((ly) => ly.name === `chair-${direction}`);
          if (chairLayer?.objects) {
            chairLayer.objects.forEach((chair) => {
              k.add([
                k.rect(chair.width, chair.height),
                k.pos(chair.x, chair.y),
                k.area(),
                k.opacity(0),
                `chair-${direction}`,
                "chair",
              ]);
            });
          }
        });

        // Prompt text for sitting
        k.add([
          k.text("Press E to sit", { size: 16, font: "sink", width: 200 }),
          k.pos(0, 0),
          k.anchor("center"),
          k.opacity(0),
          k.fixed(),
          "prompt",
        ]);

        // Kaboom onUpdate
        k.onUpdate(() => {
          if (!playerRef.current) return; // If no local sprite, skip

          // Video Proximity
          let inProximity = false;
          Object.values(otherPlayers.current).forEach((op) => {
            const dist = playerRef.current.pos.dist(op.sprite.pos);
            if (dist < PROXIMITY_THRESHOLD) {
              inProximity = true;
            }
          });
          if (inProximity && !activeCallRef.current) {
            try {
              joinVideo(AGORA_APP_ID, roomId);
              activeCallRef.current = true;
              const localVid = document.getElementById("local-video");
              if (localVid) localVid.style.display = "block";
            } catch (err) {
              console.error("Error starting video call:", err);
            }
          } else if (!inProximity && activeCallRef.current) {
            try {
              leaveVideo();
              activeCallRef.current = false;
              const localVid = document.getElementById("local-video");
              if (localVid) localVid.style.display = "none";
            } catch (err) {
              console.error("Error ending video call:", err);
            }
          }

          // Movement
          const currentTime = Date.now();
          let dx = 0;
          let dy = 0;
          let newDir = playerRef.current.direction;
          let moving = false;

          // Chair logic
          if (!isPlayerSittingRef.current) {
            const chairs = k.get("chair");
            let nearestChair = null;
            let shortestDist = Infinity;
            chairs.forEach((chair) => {
              const dist = playerRef.current.pos.dist(chair.pos);
              if (dist < CHAIR_PROXIMITY && dist < shortestDist) {
                shortestDist = dist;
                chairDirections.forEach((dir) => {
                  if (chair.is(`chair-${dir}`)) {
                    nearestChair = dir;
                  }
                });
              }
            });
            nearChairRef.current = nearestChair;
            const prompt = k.get("prompt")[0];
            if (nearestChair) {
              prompt.pos.x = playerRef.current.pos.x;
              prompt.pos.y = playerRef.current.pos.y - 40;
              prompt.opacity = 1;
            } else {
              prompt.opacity = 0;
            }
          }

          if (k.isKeyDown("left")) {
            dx = -1;
            newDir = "left";
            moving = true;
          }
          if (k.isKeyDown("right")) {
            dx = 1;
            newDir = "right";
            moving = true;
          }
          if (k.isKeyDown("up")) {
            dy = -1;
            newDir = "up";
            moving = true;
          }
          if (k.isKeyDown("down")) {
            dy = 1;
            newDir = "down";
            moving = true;
          }

          k.onKeyPress("e", () => {
            if (isPlayerSittingRef.current) {
              isPlayerSittingRef.current = false;
              playerRef.current.play(`idle-${playerRef.current.direction}`);
            } else if (nearChairRef.current) {
              isPlayerSittingRef.current = true;
              playerRef.current.play(`sit-${nearChairRef.current}`);
              playerRef.current.direction = nearChairRef.current;
            }
          });

          if (dx !== 0 && dy !== 0) {
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
          }

          if (moving) {
            playerRef.current.move(dx * PLAYER_SPEED * k.dt(), dy * PLAYER_SPEED * k.dt());
            if (!playerRef.current.isMoving || playerRef.current.direction !== newDir) {
              playerRef.current.play(`run-${newDir}`);
              playerRef.current.isMoving = true;
              playerRef.current.direction = newDir;
            }
          } else if (playerRef.current.isMoving) {
            playerRef.current.play(`idle-${playerRef.current.direction}`);
            playerRef.current.isMoving = false;
          }

          // Throttle movement updates
          const shouldSendUpdate =
            currentTime - lastUpdateRef.current >= UPDATE_INTERVAL ||
            playerRef.current.isMoving !== prevMovingRef.current ||
            playerRef.current.direction !== prevDirectionRef.current;

          if (shouldSendUpdate) {
            WebSocketService.sendMovementUpdate({
              x: playerRef.current.pos.x,
              y: playerRef.current.pos.y,
              direction: playerRef.current.direction,
              isMoving: playerRef.current.isMoving,
            });
            lastUpdateRef.current = currentTime;
            prevMovingRef.current = playerRef.current.isMoving;
            prevDirectionRef.current = playerRef.current.direction;
          }

          // Update local name tag
          if (playerNameTagRef.current) {
            playerNameTagRef.current.pos.x = playerRef.current.pos.x;
            playerNameTagRef.current.pos.y = playerRef.current.pos.y - 20;
          }

          // Interpolate remote players
          Object.values(otherPlayers.current).forEach((op) => {
            const sprite = op.sprite;
            const elapsed = currentTime - op.lastUpdate;
            const lerpFactor = Math.min(elapsed / INTERPOLATION_DELAY, 1);
            sprite.pos.x = k.lerp(op.previousX, sprite.targetX, lerpFactor);
            sprite.pos.y = k.lerp(op.previousY, sprite.targetY, lerpFactor);

            if (op.nameTag) {
              op.nameTag.pos.x = sprite.pos.x;
              op.nameTag.pos.y = sprite.pos.y - 20;
            }
          });

          // Smooth camera
          const currentCamPos = k.camPos();
          const targetCamPos = playerRef.current.pos;
          const smoothSpeed = 0.1;
          k.camPos(
            k.lerp(currentCamPos.x, targetCamPos.x, smoothSpeed),
            k.lerp(currentCamPos.y, targetCamPos.y, smoothSpeed)
          );
        });
      } catch (err) {
        console.error("Error loading map:", err);
      }
    };

    startGame();

    // ------------------- SERVER BROADCASTS -------------------
    WebSocketService.setOnPlayerUpdate((players) => {
      console.log("Received player updates:", players);
      const currentTime = Date.now();

      // Check if we need to create local sprite
      const myId = WebSocketService.getCurrentPlayerId();
      const me = players[myId];
      if (me && !didCreateLocalSpriteRef.current && gameRef.current) {
        console.log("Spawning local player from server coords:", me.x, me.y);

        // Local sprite
        const localSprite = k.add([
          k.sprite("player"),
          k.pos(me.x, me.y),
          k.area({ width: 32, height: 32 }),
          k.anchor("center"),
          k.body(),
          {
            speed: PLAYER_SPEED,
            isMoving: me.isMoving || false,
            direction: me.direction || "down",
          },
        ]);
        localSprite.play(
          me.isMoving ? `run-${me.direction || "down"}` : `idle-${me.direction || "down"}`
        );
        playerRef.current = localSprite;

        // Local name tag
        const localNameTag = k.add([
          k.text(playerName, {
            size: 16,
            color: k.rgb(255, 255, 255),
          }),
          k.pos(me.x, me.y - 20),
          k.anchor("center"),
        ]);
        playerNameTagRef.current = localNameTag;

        didCreateLocalSpriteRef.current = true;
      }

      // Handle remote players
      Object.entries(players).forEach(([id, pData]) => {
        if (id !== myId) {
          if (!otherPlayers.current[id]) {
            // New remote sprite
            const spr = k.add([
              k.sprite("player"),
              k.pos(pData.x, pData.y),
              k.area({ width: 32, height: 32 }),
              k.anchor("center"),
              {
                id,
                username: pData.username,
                isMoving: pData.isMoving,
                direction: pData.direction || "down",
                targetX: pData.x,
                targetY: pData.y,
                previousX: pData.x,
                previousY: pData.y,
                lastUpdate: currentTime,
                currentAnim: pData.isMoving
                  ? `run-${pData.direction || "down"}`
                  : `idle-${pData.direction || "down"}`,
              },
            ]);
            spr.play(
              pData.isMoving
                ? `run-${pData.direction || "down"}`
                : `idle-${pData.direction || "down"}`
            );

            const nameTag = k.add([
              k.text(pData.username || "Unknown", {
                size: 16,
                color: k.rgb(255, 255, 255),
              }),
              k.pos(pData.x, pData.y - 20),
              k.anchor("center"),
            ]);

            otherPlayers.current[id] = {
              sprite: spr,
              nameTag,
              lastUpdate: currentTime,
              previousX: pData.x,
              previousY: pData.y,
              currentAnim: pData.isMoving
                ? `run-${pData.direction || "down"}`
                : `idle-${pData.direction || "down"}`,
            };
          } else {
            // Update existing remote
            const op = otherPlayers.current[id];
            if (op && op.sprite) {
              op.previousX = op.sprite.pos.x;
              op.previousY = op.sprite.pos.y;
              op.sprite.targetX = pData.x;
              op.sprite.targetY = pData.y;
              op.lastUpdate = currentTime;

              const targetAnim = pData.isMoving
                ? `run-${pData.direction || "down"}`
                : `idle-${pData.direction || "down"}`;
              if (op.currentAnim !== targetAnim) {
                op.sprite.play(targetAnim);
                op.currentAnim = targetAnim;
              }
            }
          }
        }
      });

      // Cleanup disconnected
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      cleanupTimeoutRef.current = setTimeout(() => {
        Object.keys(otherPlayers.current).forEach((pid) => {
          if (!players[pid]) {
            console.log("Removing disconnected player:", pid);
            const pObj = otherPlayers.current[pid];
            if (pObj) {
              if (pObj.sprite && typeof pObj.sprite.destroy === "function") {
                pObj.sprite.destroy();
              }
              if (pObj.nameTag && typeof pObj.nameTag.destroy === "function") {
                pObj.nameTag.destroy();
              }
              delete otherPlayers.current[pid];
            }
          }
        });
        cleanupTimeoutRef.current = null;
      }, CLEANUP_DELAY);
    });

    // Connect WebSocket
    WebSocketService.connect(
      playerName,
      () => {
        console.log("Connected to game server");
        if (roomId) {
          WebSocketService.joinRoom(roomId)
            .then(() => {
              console.log("Joined room:", roomId);
            })
            .catch((err) => console.error("Failed to join room:", err));
        } else {
          WebSocketService.createRoom()
            .then((newRoomId) => {
              console.log("Created room:", newRoomId);
            })
            .catch((err) => console.error("Failed to create room:", err));
        }
      },
      (err) => console.error("Failed to connect:", err)
    );

    // Cleanup on unmount
    return () => {
      console.log("Unmounting GameCanvas");
      if (activeCallRef.current) {
        leaveVideo();
        activeCallRef.current = false;
      }
      if (WebSocketService.isConnected()) {
        WebSocketService.disconnect();
      }
      if (gameRef.current) {
        try {
          gameRef.current?.destroy();
        } catch (destroyErr) {
          console.error("Error destroying Kaboom:", destroyErr);
        }
      }
    };
  }, [playerName, roomId]);

  // ---------- Toggling Chat, Camera, Mic, Screen Share, Discord ----------
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const handleToggleCamera = async () => {
    const result = await toggleCamera();
    setIsCameraOn(result.isOn);
  };

  const handleToggleMic = async () => {
    const result = await toggleMic();
    setIsMicOn(result.isOn);
  };

  const handleToggleScreenShare = async () => {
    const result = await toggleScreenShare(AGORA_APP_ID, roomId);
    setIsScreenSharing(result.isScreenSharing);
  };

  // "Leave Room" => remove from server => redirect
  const handleLeaveRoom = () => {
    WebSocketService.leaveRoom();
    window.location.href = "/office";
  };

  // ---------- NEW: Listen for clicks on any remote feed => zoom ----------
  useEffect(() => {
    
    
    const remoteEl = document.getElementById("remote-videos");
    if (!remoteEl) return;

    const handleRemoteClick = (e) => {
      const container = e.target.closest(".remote-video-container");
      if (!container) return;

      const uid = container.id.replace("remote-", ""); // e.g. "remote-123" => "123"
      if (uid) {
        // This sets which user's feed we want to see in the "zoom" modal
        setZoomUid(uid);
      }
    };

    remoteEl.addEventListener("click", handleRemoteClick);
    return () => {
      remoteEl.removeEventListener("click", handleRemoteClick);
    };
  }, []);

  return (
    <div className={styles.gameCanvasContainer}>
      <canvas ref={canvasRef} id="game" className={styles.gameCanvas} />

      {/* Video Container */}
      <div className={styles.videoCallsContainer}>
        <div
          id="local-video"
          className={styles.localVideo}
          style={{ display: isVideoVisible ? "block" : "none" }}
        />

        <div id="remote-videos" className={styles.remoteVideos}>
          {remoteStreams.map((stream) => (
            <div
              key={stream.id}
              id={`remote-video-${stream.id}`}
              className={styles.remoteVideo}
            >
              <video
                ref={(video) => {
                  if (video) {
                    stream.play(video);
                  }
                }}
                autoPlay
                playsInline
                muted
              />
            </div>
          ))}
        </div>
      </div>

      {/* Screen share (LOCAL user sees) */}
      <div
        id="screen-video"
        className={styles.screenVideo}
        style={{ display: isScreenSharing ? "block" : "none" }}
      />

      {/* Chat or Toggle */}
      {isChatOpen ? (
        <div className={styles.chatBoxContainer}>
          <Chatbox roomId={roomId} playerName={playerName} onClose={closeChat} />
        </div>
      ) : (
        <button
          className={styles.chatToggleButton}
          onClick={openChat}
          aria-label="Open Chat"
        >
          <FaComments size={24} />
        </button>
      )}

      {/* Media controls */}
      <div className={styles.mediaControlsContainer}>
        <button
          className={styles.mediaButton}
          onClick={handleToggleCamera}
          aria-label={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {isCameraOn ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
        </button>

        <button
          className={styles.mediaButton}
          onClick={handleToggleMic}
          aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
        </button>

        <button
          className={styles.mediaButton}
          onClick={handleToggleScreenShare}
          aria-label={isScreenSharing ? "Stop Screen Sharing" : "Share Screen"}
        >
          {isScreenSharing ? <FaDesktop size={24} /> : <FaDesktop size={24} />}
        </button>

        <button
          className={styles.mediaButton}
          onClick={openDiscord}
          aria-label="Open Discord"
        >
          <FaDiscord size={24} />
        </button>

        <button
          className={styles.mediaButton}
          onClick={handleLeaveRoom}
          aria-label="Leave Room"
        >
          <FaDoorOpen size={24} />
        </button>
      </div>

      {/* Discord Dialog */}
      {isDiscordOpen && (
        <DiscordDialog
          selectedChannel={selectedDiscordChannel}
          onClose={closeDiscord}
        />
      )}

      {/* RemoteVideoModal => "zoom" the feed for user with uid=zoomUid */}
      {zoomUid && (
        <RemoteVideoModal
          uid={zoomUid}
          onClose={() => setZoomUid(null)}
        />
      )}
    </div>
  );
}

export default GameCanvas;

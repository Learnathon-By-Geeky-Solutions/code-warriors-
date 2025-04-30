"use client";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Utility to generate a random UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class WebSocketService {
  constructor() {
    this.client = null;
    this.connectionPromise = null;
    this.players = {};
    this.onPlayerUpdate = null;
    this.currentPlayer = null;
    this.currentRoom = null;

    // Preserve playerId across reloads
    const storedId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("playerId")
        : null;
    if (storedId) {
      this.playerId = storedId;
    } else {
      const newId = generateUUID();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("playerId", newId);
      }
      this.playerId = newId;
    }

    this.movementInterval = null;
    this.lastUpdate = Date.now();
    this.updateRate = 1000 / 60;
    this.maxRetries = 3;
    this.retryCount = 0;
    this.retryDelay = 2000;
    this.roomSubscription = null;
    this.username = null;
    this.debounceTimeout = null;
    this.lastMoveTime = 0;
    this.moveInterval = 1000 / 30;
  }

  async connect(username, onConnected, onError) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS("https://metahive-multiplayer-map-service-dufhajhkaebtfmbp.southindia-01.azurewebsites.net/ws"),
          debug: (str) => console.log("STOMP: " + str),
          reconnectDelay: this.retryDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: () => {
            console.log("WebSocket Connected Successfully");
            this.username = username;
            this.retryCount = 0;
            resolve();
            if (onConnected) onConnected();
          },

          onStompError: (frame) => {
            console.error("STOMP error:", frame);
            this.handleConnectionError(frame, reject, onError);
          },

          onWebSocketError: (event) => {
            console.error("WebSocket error:", event);
            this.handleConnectionError(event, reject, onError);
          },

          onDisconnect: () => {
            console.log("Disconnected from WebSocket");
            this.cleanup();
          },
        });

        this.client.activate();
      } catch (error) {
        this.handleConnectionError(error, reject, onError);
      }
    });

    return this.connectionPromise;
  }

  handleConnectionError(error, reject, onError) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(
        `Retrying connection (${this.retryCount}/${this.maxRetries})...`
      );
      setTimeout(() => {
        this.connectionPromise = null;
        this.connect(this.username, null, onError);
      }, this.retryDelay);
    } else {
      this.cleanup();
      reject(error);
      if (onError) onError(error);
    }
  }

  async createRoom() {
    if (!this.client || !this.client.connected) {
      throw new Error("WebSocket not connected");
    }

    return new Promise((resolve, reject) => {
      const subscription = this.client.subscribe(
        "/queue/roomCreated",
        (message) => {
          const response = JSON.parse(message.body);
          if (response.success) {
            this.currentRoom = response.roomId;
            this.subscribeToRoom(response.roomId)
              .then(() => {
                subscription.unsubscribe();
                resolve(response.roomId);
              })
              .catch(reject);
          } else {
            subscription.unsubscribe();
            reject(new Error("Failed to create room"));
          }
        }
      );

      this.client.publish({
        destination: "/app/createRoom",
        body: JSON.stringify({ username: this.username }),
      });
    });
  }

  async joinRoom(roomId) {
    if (!this.client || !this.client.connected) {
      throw new Error("WebSocket not connected");
    }

    return new Promise((resolve, reject) => {
      const subscription = this.client.subscribe(
        "/queue/joinResult",
        (message) => {
          const response = JSON.parse(message.body);
          subscription.unsubscribe();

          if (response.success) {
            this.currentRoom = roomId;
            this.subscribeToRoom(roomId)
              .then(() => resolve(true))
              .catch(reject);
          } else {
            reject(new Error("Invalid room ID"));
          }
        }
      );

      this.client.publish({
        destination: "/app/joinRoom",
        body: JSON.stringify({
          username: this.username,
          roomId: roomId,
        }),
      });
    });
  }

  subscribeToRoom(roomId) {
    if (this.client?.connected) {
      if (this.roomSubscription) {
        this.roomSubscription.unsubscribe();
      }

      return new Promise((resolve, reject) => {
        console.log("Subscribing to room:", roomId);

        this.roomSubscription = this.client.subscribe(
          `/topic/rooms/${roomId}/players`,
          (message) => {
            try {
              const players = JSON.parse(message.body);
              if (this.onPlayerUpdate) {
                this.onPlayerUpdate(players);
              }
            } catch (error) {
              console.error("Error handling player update:", error);
            }
          }
        );

        setTimeout(() => {
          this.registerInRoom(roomId).then(resolve).catch(reject);
        }, 500);
      });
    }
    return Promise.reject(new Error("WebSocket not connected"));
  }

  registerInRoom(roomId) {
    if (!this.currentPlayer) {
      this.currentPlayer = {
        id: this.playerId,
        username: this.username,
        x: 0,
        y: 0,
        direction: "down",
        isMoving: false,
        animation: "idle-down",
        timestamp: Date.now(),
        roomId: roomId,
      };

      console.log("Registering player in room:", roomId);
      return new Promise((resolve, reject) => {
        try {
          this.client.publish({
            destination: "/app/register",
            body: JSON.stringify(this.currentPlayer),
          });
          resolve();
        } catch (error) {
          console.error("Error registering player:", error);
          reject(error);
        }
      });
    }
    return Promise.resolve();
  }

  sendMovementUpdate(playerData) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.moveInterval) {
      return;
    }
    this.lastMoveTime = now;

    if (this.client?.connected && this.currentPlayer && this.currentRoom) {
      try {
        const newAnimation = playerData.isMoving
          ? `run-${playerData.direction}`
          : `idle-${playerData.direction}`;

        const changed =
          this.currentPlayer.x !== playerData.x ||
          this.currentPlayer.y !== playerData.y ||
          this.currentPlayer.direction !== playerData.direction ||
          this.currentPlayer.isMoving !== playerData.isMoving ||
          this.currentPlayer.animation !== newAnimation;

        if (!changed) return;

        const updatedPlayer = {
          ...this.currentPlayer,
          ...playerData,
          animation: newAnimation,
          timestamp: now,
          roomId: this.currentRoom,
        };

        this.currentPlayer = updatedPlayer;

        this.client.publish({
          destination: "/app/move",
          body: JSON.stringify(updatedPlayer),
        });
      } catch (error) {
        console.error("Error sending movement:", error);
      }
    }
  }

  movePlayer(playerData) {
    this.sendMovementUpdate(playerData);
    if (playerData.isMoving) {
      this.startMovementUpdates(playerData);
    } else {
      this.stopMovementUpdates();
      this.sendMovementUpdate(playerData);
    }
  }

  startMovementUpdates(playerData) {
    if (!this.movementInterval) {
      this.movementInterval = setInterval(() => {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateRate) {
          this.sendMovementUpdate(playerData);
          this.lastUpdate = now;
        }
      }, this.updateRate);
    }
  }

  stopMovementUpdates() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
  }

  leaveRoom() {
    console.log("Attempting to leave room:", this.currentRoom, this.currentPlayer);
    if (this.client?.connected && this.currentPlayer && this.currentRoom) {
      this.client.publish({
        destination: "/app/leaveRoom",
        body: JSON.stringify({
          playerId: this.currentPlayer.id,
          roomId: this.currentRoom,
        }),
      });
    } else {
      console.warn("No currentRoom/currentPlayer or not connected!");
    }
    this.disconnect();
  }

  disconnect() {
    this.stopMovementUpdates();
    if (this.roomSubscription) {
      try {
        this.roomSubscription.unsubscribe();
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    }
    if (this.client?.connected) {
      try {
        this.client.deactivate();
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
    this.cleanup();
  }

  cleanup() {
    this.players = {};
    this.currentPlayer = null;
    this.currentRoom = null;
    this.connectionPromise = null;
  }

  setOnPlayerUpdate(callback) {
    this.onPlayerUpdate = callback;
  }

  isConnected() {
    return this.client?.connected ?? false;
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getCurrentPlayerId() {
    return this.playerId;
  }
}

export default new WebSocketService();

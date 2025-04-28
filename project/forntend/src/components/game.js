import React, { useEffect, useRef, useState } from "react";
import kaboom from "kaboom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Game = ({ playerName }) => {
  const gameCanvasRef = useRef(null); // Reference for the canvas element
  const [playerData, setPlayerData] = useState(null); // Player data state
  const [webSocketClient, setWebSocketClient] = useState(null); // WebSocket client state

  // Setup WebSocket connection and handle player updates
  const setupWebSocket = (playerName, onPlayerUpdate) => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:9502/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket server");
        // Send player registration message
        client.send(
          "/app/register",
          {},
          JSON.stringify({ username: playerName, x: 0, y: 0, color: "blue" })
        );
      },
      onMessage: (message) => {
        // Handle incoming player update messages
        const player = JSON.parse(message.body);
        onPlayerUpdate(player); // Update player state with incoming data
      },
    });

    client.activate(); // Connect to the server

    // Send player movement data to the server
    function sendPlayerMovement(playerData) {
      client.send("/app/move", {}, JSON.stringify(playerData));
    }

    return { sendPlayerMovement };
  };

  // Update player position on WebSocket message
  const updatePlayerPosition = (playerData) => {
    setPlayerData(playerData); // Update the player data state
  };

  useEffect(() => {
    if (!playerName) return;

    // Initialize kaboom for the game
    const k = kaboom({
      global: false,
      width: 800,
      height: 600,
      scale: 2,
      debug: true,
      background: [0, 0, 0, 1],
      canvas: gameCanvasRef.current,
      stretch: true,
      letterbox: true,
    });

    // Setup WebSocket
    const { sendPlayerMovement } = setupWebSocket(
      playerName,
      updatePlayerPosition
    );

    // Load sprites
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
      },
    });

    k.loadSprite("map", "/mapfinal1.png");

    const PLAYER_SPEED = 150;

    // Main game logic
    const startGame = async () => {
      try {
        const mapData = await (await fetch("/map.json")).json();

        // Add map container and sprite
        const map = k.add([k.pos(0, 0), k.anchor("topleft")]);
        const mapSprite = map.add([k.sprite("map"), k.anchor("topleft")]);

        // Add collision boundaries
        const boundariesLayer = mapData.layers.find(
          (layer) => layer.name === "boundaries"
        );
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

        // Find spawn point
        let spawnX = mapSprite.width / 2;
        let spawnY = mapSprite.height / 2;

        const spawnLayer = mapData.layers.find(
          (layer) => layer.name === "spawnpoint"
        );
        if (spawnLayer?.objects?.[0]) {
          spawnX = spawnLayer.objects[0].x;
          spawnY = spawnLayer.objects[0].y;
        }

        // Create player
        const player = k.add([
          k.sprite("player"),
          k.pos(400, 300),
          k.area({ width: 32, height: 32 }),
          k.anchor("center"),
          k.body(),
          { speed: 120, isMoving: false, direction: "down" },
        ]);

        player.play("idle-down");

        // Player name tag above the character
        const nameTag = k.add([
          k.text(playerName, { size: 16, color: k.rgb(255, 255, 255) }),
          k.pos(player.pos.x, player.pos.y - 20),
          k.anchor("center"),
          { followsPlayer: true },
        ]);

        // Sync name tag position with player
        k.onUpdate(() => {
          let dx = 0,
            dy = 0;
          let newDirection = player.direction;
          let moving = false;

          if (k.isKeyDown("left")) {
            dx = -1;
            newDirection = "left";
            moving = true;
          } else if (k.isKeyDown("right")) {
            dx = 1;
            newDirection = "right";
            moving = true;
          }

          if (k.isKeyDown("up")) {
            dy = -1;
            newDirection = "up";
            moving = true;
          } else if (k.isKeyDown("down")) {
            dy = 1;
            newDirection = "down";
            moving = true;
          }

          if (moving) {
            if (dx !== 0 && dy !== 0) {
              dx *= 0.707;
              dy *= 0.707;
            }
            player.move(dx * player.speed, dy * player.speed);
            sendPlayerMovement({
              id: playerName,
              x: player.pos.x,
              y: player.pos.y,
              direction: newDirection,
            });
            player.play(`run-${newDirection}`);
          } else {
            player.play(`idle-${player.direction}`);
          }
        });

        // Handle sitting action
        k.onKeyPress("space", () => {
          if (!player.isMoving) {
            player.play(`sit-${player.direction}`);
          }
        });

        k.onKeyRelease("space", () => {
          if (player.curAnim()?.startsWith("sit-")) {
            player.play(`idle-${player.direction}`);
          }
        });
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    // Start the game
    startGame();
  }, [playerName]);

  return (
    <div>
      <canvas ref={gameCanvasRef} />
    </div>
  );
};

export default Game;

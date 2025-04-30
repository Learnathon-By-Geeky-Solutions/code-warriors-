import React, { useEffect, useRef } from "react";
import kaboom from "kaboom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Game = ({ playerName }) => {
  const gameCanvasRef = useRef(null);

  // Setup WebSocket connection and return a sendPlayerMovement helper
  const setupWebSocket = (username, onPlayerUpdate) => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:9502/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket server");
        client.send(
          "/app/register",
          {},
          JSON.stringify({ username, x: 0, y: 0, color: "blue" })
        );
      },
      onMessage: (message) => {
        const player = JSON.parse(message.body);
        onPlayerUpdate(player);
      },
    });
    client.activate();

    const sendPlayerMovement = (data) => {
      client.send("/app/move", {}, JSON.stringify(data));
    };

    return { sendPlayerMovement };
  };

  useEffect(() => {
    if (!playerName) return;

    // initialize Kaboom
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

    // we don't actually need to store remote updates yet—so just no-op
    const { sendPlayerMovement } = setupWebSocket(playerName, () => {});

    // load assets
    k.loadSprite("player", "/ash.png", {
      sliceX: 52,
      sliceY: 1,
      anims: {
        "idle-right": { from: 0, to: 5, speed: 10, loop: true },
        "idle-up":    { from: 6, to: 11, speed: 10, loop: true },
        "idle-left":  { from: 12, to: 17, speed: 10, loop: true },
        "idle-down":  { from: 18, to: 23, speed: 10, loop: true },
        "run-right":  { from: 24, to: 29, speed: 15, loop: true },
        "run-up":     { from: 30, to: 35, speed: 15, loop: true },
        "run-left":   { from: 36, to: 41, speed: 15, loop: true },
        "run-down":   { from: 42, to: 47, speed: 15, loop: true },
      },
    });
    k.loadSprite("map", "/mapfinal1.png");

    // constants now actually used
    const PLAYER_SPEED = 150;

    const startGame = async () => {
      try {
        const mapData = await (await fetch("/map.json")).json();

        // draw map
        const map = k.add([k.pos(0, 0), k.anchor("topleft")]);
        map.add([k.sprite("map"), k.anchor("topleft")]);

        // collisions
        const boundaries = mapData.layers.find(l => l.name === "boundaries");
        boundaries?.objects.forEach(obj => {
          k.add([
            k.rect(obj.width, obj.height),
            k.pos(obj.x, obj.y),
            k.area(),
            k.body({ isStatic: true }),
            k.opacity(0),
            "boundary",
          ]);
        });

        // spawn coords now actually used
        let spawnX = k.width() / 2;
        let spawnY = k.height() / 2;
        const spawnLayer = mapData.layers.find(l => l.name === "spawnpoint");
        if (spawnLayer?.objects?.[0]) {
          spawnX = spawnLayer.objects[0].x;
          spawnY = spawnLayer.objects[0].y;
        }

        // create player at spawn
        const player = k.add([
          k.sprite("player"),
          k.pos(spawnX, spawnY),
          k.area({ width: 32, height: 32 }),
          k.anchor("center"),
          k.body(),
          { speed: PLAYER_SPEED, isMoving: false, direction: "down" },
        ]);
        player.play("idle-down");

        // name tag (we don't need the var)
        k.add([
          k.text(playerName, { size: 16, color: k.rgb(255, 255, 255) }),
          k.pos(player.pos.x, player.pos.y - 20),
          k.anchor("center"),
          { followsPlayer: true },
        ]);

        // movement & network sync
        k.onUpdate(() => {
          let dx = 0, dy = 0;
          let moving = false;
          let dir = player.direction;

          if (k.isKeyDown("left"))  { dx = -1; dir = "left";  moving = true; }
          if (k.isKeyDown("right")) { dx = 1;  dir = "right"; moving = true; }
          if (k.isKeyDown("up"))    { dy = -1; dir = "up";    moving = true; }
          if (k.isKeyDown("down"))  { dy = 1;  dir = "down";  moving = true; }

          if (moving) {
            // normalize diagonal
            if (dx && dy) {
              dx *= 0.707; dy *= 0.707;
            }
            player.move(dx * player.speed, dy * player.speed);
            player.direction = dir;
            player.play(`run-${dir}`);
            sendPlayerMovement({
              id: playerName,
              x: player.pos.x,
              y: player.pos.y,
              direction: dir,
            });
          } else {
            player.play(`idle-${player.direction}`);
          }
        });

        // sitting animation (optional)
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
      } catch (err) {
        console.error("Error loading map:", err);
      }
    };

    startGame();
  }, [playerName]);

  return <canvas ref={gameCanvasRef} />;
};

export default Game;

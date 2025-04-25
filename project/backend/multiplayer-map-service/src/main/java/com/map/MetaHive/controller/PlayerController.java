package com.map.metahive.controller;

import com.map.metahive.dto.CreateRoomRequest;
import com.map.metahive.dto.JoinRoomRequest;
import com.map.metahive.dto.LeaveRoomRequest;
import com.map.metahive.model.Player;
import com.map.metahive.model.Room;
import com.map.metahive.service.GameSessionService;
import com.map.metahive.service.SpawnPointService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class PlayerController {

    private static final Logger logger = LoggerFactory.getLogger(PlayerController.class);
    private static final String KEY_SUCCESS = "success";

    private final GameSessionService gameSessionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SpawnPointService spawnPointService;

    @Autowired
    public PlayerController(GameSessionService gameSessionService,
                            SimpMessagingTemplate messagingTemplate,
                            SpawnPointService spawnPointService) {
        this.gameSessionService = gameSessionService;
        this.messagingTemplate = messagingTemplate;
        this.spawnPointService = spawnPointService;
    }

    @MessageMapping("/createRoom")
    public void createRoom(@Payload CreateRoomRequest request) {
        // Removed the unused assignment to "username"
        String roomId = request.getRoomId();

        if (roomId == null || roomId.isEmpty()) {
            logger.warn("Room creation attempt with invalid roomId.");
            Map<String, Object> response = new HashMap<>();
            response.put(KEY_SUCCESS, false);
            response.put("message", "Invalid roomId");
            messagingTemplate.convertAndSend("/queue/roomCreated", response);
            return;
        }

        // Create room if it doesn't exist
        if (!gameSessionService.roomExists(roomId)) {
            gameSessionService.createRoom(roomId);
            logger.info("Room created successfully.");
        } else {
            logger.info("Room already exists; no action taken.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put(KEY_SUCCESS, true);
        messagingTemplate.convertAndSend("/queue/roomCreated", response);
    }

    @MessageMapping("/joinRoom")
    public void joinRoom(SimpMessageHeaderAccessor headerAccessor, @Payload JoinRoomRequest request) {
        String username = request.getUsername();
        String roomId = request.getRoomId();

        // If room does not exist, create one
        if (!gameSessionService.roomExists(roomId)) {
            logger.info("Room not found; creating a new room.");
            Room newRoom = new Room(roomId);
            gameSessionService.addRoom(roomId, newRoom);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put(KEY_SUCCESS, true);
        logger.info("User joining room."); // Generic log; avoid showing username or roomId
        messagingTemplate.convertAndSend("/queue/joinResult", response);
    }

    @MessageMapping("/register")
    public void registerPlayer(@Payload Player incoming) {
        if (incoming.getId() == null || incoming.getId().isEmpty()) {
            logger.warn("Player registration attempt with invalid ID.");
            return;
        }
        if (!gameSessionService.roomExists(incoming.getRoomId())) {
            logger.warn("Player registration attempted for non-existent room.");
            return;
        }

        // Check if player already exists in the room
        Player existing = gameSessionService.getPlayerById(incoming.getRoomId(), incoming.getId());
        if (existing != null) {
            logger.info("Player already exists; updating username if needed.");
            existing.setUsername(incoming.getUsername());
            broadcastPlayerStates(incoming.getRoomId());
            return;
        }

        // Use SpawnPointService to retrieve spawn coordinates
        double[] spawnCoords = spawnPointService.getSpawnCoordinates();
        incoming.setX(spawnCoords[0]);
        incoming.setY(spawnCoords[1]);

        logger.info("New player registered in room; spawn coordinates set.");
        gameSessionService.addPlayer(incoming);
        broadcastPlayerStates(incoming.getRoomId());
    }

    @MessageMapping("/move")
    public void movePlayer(@Payload Player playerMovement) {
        logger.info("Processing movement for a player.");
        Player existingPlayer = gameSessionService.getPlayerById(playerMovement.getRoomId(), playerMovement.getId());

        if (existingPlayer != null) {
            existingPlayer.setX(playerMovement.getX());
            existingPlayer.setY(playerMovement.getY());
            existingPlayer.setDirection(playerMovement.getDirection());
            existingPlayer.setIsMoving(playerMovement.getIsMoving());
            existingPlayer.setAnimation(playerMovement.getAnimation());
            existingPlayer.setTimestamp(playerMovement.getTimestamp());
            broadcastPlayerStates(playerMovement.getRoomId());
        } else {
            logger.warn("Player movement received for non-existent player.");
        }
    }

    @MessageMapping("/leaveRoom")
    public void leaveRoom(@Payload LeaveRoomRequest request) {
        String roomId = request.getRoomId();
        String playerId = request.getPlayerId();

        if (roomId == null || playerId == null) {
            logger.warn("Invalid leaveRoom payload received.");
            return;
        }

        logger.info("Processing request to remove a player from a room.");
        gameSessionService.removePlayer(roomId, playerId);
        broadcastPlayerStates(roomId);
    }

    private void broadcastPlayerStates(String roomId) {
        Map<String, Player> players = gameSessionService.getPlayersInRoom(roomId);
        logger.info("Broadcasting updated player state for room.");
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/players", players);
    }
}

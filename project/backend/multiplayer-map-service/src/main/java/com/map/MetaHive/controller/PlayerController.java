package com.map.MetaHive.controller;

import com.map.MetaHive.dto.CreateRoomRequest;
import com.map.MetaHive.dto.JoinRoomRequest;
import com.map.MetaHive.dto.LeaveRoomRequest;
import com.map.MetaHive.model.Player;
import com.map.MetaHive.model.Room;
import com.map.MetaHive.service.GameSessionService;
import com.map.MetaHive.service.SpawnPointService;
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
        String username = request.getUsername();
        String roomId = request.getRoomId();

        if (roomId == null || roomId.isEmpty()) {
            logger.warn("Invalid roomId provided by user: {}", username);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid roomId");
            messagingTemplate.convertAndSend("/queue/roomCreated", response);
            return;
        }
        // Create room if it doesn't exist
        if (!gameSessionService.roomExists(roomId)) {
            gameSessionService.createRoom(roomId);
            logger.info("Room created: {}", roomId);
        } else {
            logger.info("Room {} already exists.", roomId);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("success", true);
        messagingTemplate.convertAndSend("/queue/roomCreated", response);
    }

    @MessageMapping("/joinRoom")
    public void joinRoom(SimpMessageHeaderAccessor headerAccessor, @Payload JoinRoomRequest request) {
        String username = request.getUsername();
        String roomId = request.getRoomId();

        // If room does not exist, create one
        if (!gameSessionService.roomExists(roomId)) {
            logger.info("Room {} doesn't exist. Creating new one.", roomId);
            Room newRoom = new Room(roomId);
            gameSessionService.addRoom(roomId, newRoom);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("success", true);
        logger.info("Player {} joining room: {}", username, roomId);
        messagingTemplate.convertAndSend("/queue/joinResult", response);
    }

    @MessageMapping("/register")
    public void registerPlayer(@Payload Player incoming) {
        if (incoming.getId() == null || incoming.getId().isEmpty()) {
            logger.warn("Invalid player ID received.");
            return;
        }
        if (!gameSessionService.roomExists(incoming.getRoomId())) {
            logger.warn("Room does not exist: {}", incoming.getRoomId());
            return;
        }
        // Check if player already exists in the room
        Player existing = gameSessionService.getPlayerById(incoming.getRoomId(), incoming.getId());
        if (existing != null) {
            logger.info("Player {} already exists at ({}, {})", existing.getUsername(), existing.getX(), existing.getY());
            // Optionally update username
            existing.setUsername(incoming.getUsername());
            broadcastPlayerStates(incoming.getRoomId());
            return;
        }
        // Use SpawnPointService to retrieve spawn coordinates
        double[] spawnCoords = spawnPointService.getSpawnCoordinates();
        incoming.setX(spawnCoords[0]);
        incoming.setY(spawnCoords[1]);
        logger.info("New player: {} in room: {} spawned at ({}, {})",
                incoming.getUsername(), incoming.getRoomId(), spawnCoords[0], spawnCoords[1]);
        gameSessionService.addPlayer(incoming);
        broadcastPlayerStates(incoming.getRoomId());
    }

    @MessageMapping("/move")
    public void movePlayer(@Payload Player playerMovement) {
        logger.info("Received movement from player ID: {} in room: {}", playerMovement.getId(), playerMovement.getRoomId());
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
            logger.warn("Player ID not found: {} in room: {}", playerMovement.getId(), playerMovement.getRoomId());
        }
    }

    @MessageMapping("/leaveRoom")
    public void leaveRoom(@Payload LeaveRoomRequest request) {
        String roomId = request.getRoomId();
        String playerId = request.getPlayerId();
        if (roomId == null || playerId == null) {
            logger.warn("Invalid leaveRoom payload.");
            return;
        }
        logger.info("Removing player {} from room {}", playerId, roomId);
        gameSessionService.removePlayer(roomId, playerId);
        broadcastPlayerStates(roomId);
    }

    private void broadcastPlayerStates(String roomId) {
        Map<String, Player> players = gameSessionService.getPlayersInRoom(roomId);
        logger.info("Broadcasting player states for room {}: {} players", roomId, players.size());
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/players", players);
    }
}

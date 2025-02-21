package com.map.MetaHive.controller;

import com.map.MetaHive.model.Player;
import com.map.MetaHive.model.Room;
import com.map.MetaHive.service.GameSessionService;
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

    @Autowired
    private GameSessionService gameSessionService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // For simplicity, define a default spawn inside the map
    private static final double DEFAULT_SPAWN_X = 400;
    private static final double DEFAULT_SPAWN_Y = 300;

    @MessageMapping("/createRoom")
    public void createRoom(@Payload Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String roomId = gameSessionService.createRoom();

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("success", true);

        System.out.println("Room created: " + roomId);
        messagingTemplate.convertAndSend("/queue/roomCreated", response);
    }

    @MessageMapping("/joinRoom")
    public void joinRoom(SimpMessageHeaderAccessor headerAccessor, @Payload Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String roomId = (String) payload.get("roomId");

        Map<String, Object> response = new HashMap<>();

        // Create if doesn't exist
        if (!gameSessionService.roomExists(roomId)) {
            System.out.println("Room " + roomId + " doesn't exist. Creating new one.");
            Room newRoom = new Room(roomId);
            gameSessionService.addRoom(roomId, newRoom);
        }

        response.put("success", true);
        response.put("roomId", roomId);

        System.out.println("Player " + username + " joining room: " + roomId);
        messagingTemplate.convertAndSend("/queue/joinResult", response);
    }

    // ---------------------- REGISTER PLAYER ----------------------
    @MessageMapping("/register")
    public void registerPlayer(@Payload Player incoming) {
        if (incoming.getId() == null || incoming.getId().isEmpty()) {
            System.out.println("Invalid player ID received.");
            return;
        }
        if (!gameSessionService.roomExists(incoming.getRoomId())) {
            System.out.println("Room does not exist: " + incoming.getRoomId());
            return;
        }

        // Check if player already in the room
        Player existing = gameSessionService.getPlayerById(incoming.getRoomId(), incoming.getId());
        if (existing != null) {
            // Already in the room, so keep the old x,y
            System.out.println("Player " + existing.getUsername()
                    + " already exists at (" + existing.getX() + "," + existing.getY() + ")");
            // Optionally update user name if needed
            existing.setUsername(incoming.getUsername());
            broadcastPlayerStates(incoming.getRoomId());
            return;
        }

        // If new player, set default spawn
        incoming.setX(DEFAULT_SPAWN_X);
        incoming.setY(DEFAULT_SPAWN_Y);

        System.out.println("New player: " + incoming.getUsername() + " in room: "
                + incoming.getRoomId() + " spawn @(" + DEFAULT_SPAWN_X + "," + DEFAULT_SPAWN_Y + ")");

        gameSessionService.addPlayer(incoming);
        broadcastPlayerStates(incoming.getRoomId());
    }

    // ---------------------- MOVE PLAYER ----------------------
    @MessageMapping("/move")
    public void movePlayer(@Payload Player playerMovement) {
        System.out.println("Received movement from player ID: "
                + playerMovement.getId() + " in room: " + playerMovement.getRoomId());
        Player existingPlayer = gameSessionService.getPlayerById(
                playerMovement.getRoomId(),
                playerMovement.getId()
        );

        if (existingPlayer != null) {
            existingPlayer.setX(playerMovement.getX());
            existingPlayer.setY(playerMovement.getY());
            existingPlayer.setDirection(playerMovement.getDirection());
            existingPlayer.setIsMoving(playerMovement.getIsMoving());
            existingPlayer.setAnimation(playerMovement.getAnimation());
            existingPlayer.setTimestamp(playerMovement.getTimestamp());

            broadcastPlayerStates(playerMovement.getRoomId());
        } else {
            System.out.println("Player ID not found: " + playerMovement.getId()
                    + " in room: " + playerMovement.getRoomId());
        }
    }

    // ---------------------- LEAVE ROOM ----------------------
    @MessageMapping("/leaveRoom")
    public void leaveRoom(@Payload Map<String, String> payload) {
        String roomId = payload.get("roomId");
        String playerId = payload.get("playerId");
        if (roomId == null || playerId == null) {
            System.out.println("Invalid leaveRoom payload");
            return;
        }
        System.out.println("Removing player " + playerId + " from room " + roomId);

        gameSessionService.removePlayer(roomId, playerId);
        broadcastPlayerStates(roomId);
    }

    // ---------------------- BROADCAST ----------------------
    private void broadcastPlayerStates(String roomId) {
        Map<String, Player> players = gameSessionService.getPlayersInRoom(roomId);
        System.out.println("Broadcasting player states for room " + roomId
                + ": " + players.size() + " players");
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/players", players);
    }
}

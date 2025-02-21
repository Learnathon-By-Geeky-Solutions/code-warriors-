package com.map.MetaHive.controller;

import com.map.MetaHive.model.Player;
import com.map.MetaHive.model.Room;
import com.map.MetaHive.service.GameSessionService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class PlayerController {

    @Autowired
    private GameSessionService gameSessionService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Path to your Tiled map JSON file (placed in src/main/resources)
    private static final String MAP_JSON_PATH = "mapfinal1.json";

    /**
     * Reads the Tiled map JSON from the classpath and extracts spawn coordinates
     * from the layer named "spawnpoint". If not found, returns fallback coordinates.
     *
     * @return a double array with [spawnX, spawnY]
     */
    private double[] getSpawnCoordinates() {
        try {
            ClassPathResource resource = new ClassPathResource(MAP_JSON_PATH);
            InputStream is = resource.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> mapData = mapper.readValue(is, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> layers = (List<Map<String, Object>>) mapData.get("layers");
            if (layers != null) {
                for (Map<String, Object> layer : layers) {
                    String layerName = (String) layer.get("name");
                    if ("spawnpoint".equalsIgnoreCase(layerName)) {
                        List<Map<String, Object>> objects = (List<Map<String, Object>>) layer.get("objects");
                        if (objects != null && !objects.isEmpty()) {
                            // Choose the first spawn point (or implement a random selection if needed)
                            Map<String, Object> spawnObj = objects.get(0);
                            double spawnX = ((Number) spawnObj.get("x")).doubleValue();
                            double spawnY = ((Number) spawnObj.get("y")).doubleValue();
                            return new double[]{spawnX, spawnY};
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Fallback coordinates if no spawnpoint found in the map
        return new double[]{400, 300};
    }

    @MessageMapping("/createRoom")
    public void createRoom(@Payload Map<String, Object> payload) {
        String username = (String) payload.get("username");
        // Expect the office id (room id) to be provided in the payload
        String roomId = (String) payload.get("roomId");
        if (roomId == null || roomId.isEmpty()) {
            System.out.println("Invalid roomId provided.");
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid roomId");
            messagingTemplate.convertAndSend("/queue/roomCreated", response);
            return;
        }
        // Create room if it doesn't exist
        if (!gameSessionService.roomExists(roomId)) {
            gameSessionService.createRoom(roomId);
        } else {
            System.out.println("Room " + roomId + " already exists.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", roomId);
        response.put("success", true);

        System.out.println("Room created/exists: " + roomId);
        messagingTemplate.convertAndSend("/queue/roomCreated", response);
    }

    @MessageMapping("/joinRoom")
    public void joinRoom(SimpMessageHeaderAccessor headerAccessor, @Payload Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String roomId = (String) payload.get("roomId");

        Map<String, Object> response = new HashMap<>();

        // Create room if it doesn't exist
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

        // Check if player already exists in the room
        Player existing = gameSessionService.getPlayerById(incoming.getRoomId(), incoming.getId());
        if (existing != null) {
            System.out.println("Player " + existing.getUsername() +
                    " already exists at (" + existing.getX() + "," + existing.getY() + ")");
            // Optionally update username
            existing.setUsername(incoming.getUsername());
            broadcastPlayerStates(incoming.getRoomId());
            return;
        }

        // Instead of using hardcoded default spawn values,
        // read the spawn point from the Tiled map JSON in the backend.
        double[] spawnCoords = getSpawnCoordinates();
        incoming.setX(spawnCoords[0]);
        incoming.setY(spawnCoords[1]);

        System.out.println("New player: " + incoming.getUsername() + " in room: " +
                incoming.getRoomId() + " spawn @(" + spawnCoords[0] + "," + spawnCoords[1] + ")");

        gameSessionService.addPlayer(incoming);
        broadcastPlayerStates(incoming.getRoomId());
    }

    @MessageMapping("/move")
    public void movePlayer(@Payload Player playerMovement) {
        System.out.println("Received movement from player ID: " +
                playerMovement.getId() + " in room: " + playerMovement.getRoomId());
        Player existingPlayer = gameSessionService.getPlayerById(
                playerMovement.getRoomId(), playerMovement.getId());

        if (existingPlayer != null) {
            existingPlayer.setX(playerMovement.getX());
            existingPlayer.setY(playerMovement.getY());
            existingPlayer.setDirection(playerMovement.getDirection());
            existingPlayer.setIsMoving(playerMovement.getIsMoving());
            existingPlayer.setAnimation(playerMovement.getAnimation());
            existingPlayer.setTimestamp(playerMovement.getTimestamp());

            broadcastPlayerStates(playerMovement.getRoomId());
        } else {
            System.out.println("Player ID not found: " + playerMovement.getId() +
                    " in room: " + playerMovement.getRoomId());
        }
    }

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

    private void broadcastPlayerStates(String roomId) {
        Map<String, Player> players = gameSessionService.getPlayersInRoom(roomId);
        System.out.println("Broadcasting player states for room " + roomId +
                ": " + players.size() + " players");
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/players", players);
    }
}

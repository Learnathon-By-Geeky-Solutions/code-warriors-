package com.map.metahive.service;

import com.map.metahive.model.Player;
import com.map.metahive.model.Room;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    private static final Logger logger = LoggerFactory.getLogger(GameSessionService.class);
    private final Map<String, Room> activeRooms = new ConcurrentHashMap<>();

    /**
     * Creates a room using the provided roomId if it doesn't already exist.
     *
     * @param roomId The room id.
     */
    public void createRoom(String roomId) {
        if (roomId == null || roomId.isEmpty()) {
            throw new IllegalArgumentException("Room ID cannot be null or empty");
        }
        activeRooms.putIfAbsent(roomId, new Room(roomId));
        logger.info("Room created or already exists.");
    }

    public boolean joinRoom(String roomId, Player player) {
        if (roomId == null || player == null || player.getId() == null) {
            throw new IllegalArgumentException("Room ID, Player, or Player ID cannot be null");
        }
        Room room = activeRooms.get(roomId);
        if (room != null) {
            room.addPlayer(player);
            logger.info("Player joined the room.");
            return true;
        }
        logger.warn("Attempt to join a non-existent room.");
        return false;
    }

    public void addRoom(String roomId, Room room) {
        if (roomId == null || room == null) {
            throw new IllegalArgumentException("Room ID or Room object cannot be null");
        }
        activeRooms.put(roomId, room);
        logger.info("New room added.");
    }

    public void addPlayer(Player player) {
        if (player == null || player.getId() == null || player.getRoomId() == null) {
            throw new IllegalArgumentException("Player, Player ID, or Room ID cannot be null");
        }
        Room room = activeRooms.get(player.getRoomId());
        if (room == null) {
            throw new IllegalStateException("Room does not exist: " + player.getRoomId());
        }
        logger.info("Adding player to room.");
        room.addPlayer(player);
        logger.info("Player added; current room player count updated.");
    }

    public Map<String, Player> getPlayersInRoom(String roomId) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room ID cannot be null");
        }
        Room room = activeRooms.get(roomId);
        if (room != null) {
            logger.info("Retrieving players from room.");
            return room.getPlayers();
        }
        return new ConcurrentHashMap<>();
    }

    public Player getPlayerById(String roomId, String playerId) {
        if (roomId == null || playerId == null) {
            throw new IllegalArgumentException("Room ID or Player ID cannot be null");
        }
        Room room = activeRooms.get(roomId);
        return (room != null) ? room.getPlayers().get(playerId) : null;
    }

    public void removePlayer(String roomId, String playerId) {
        if (roomId == null || playerId == null) {
            throw new IllegalArgumentException("Room ID or Player ID cannot be null");
        }
        Room room = activeRooms.get(roomId);
        if (room == null) {
            logger.warn("Attempt to remove a player from a non-existent room.");
            return;
        }
        room.removePlayer(playerId);
        logger.info("Player removed from room.");
        if (room.getPlayers().isEmpty()) {
            activeRooms.remove(roomId);
            logger.info("Room removed due to being empty.");
        }
    }

    public boolean roomExists(String roomId) {
        return roomId != null && activeRooms.containsKey(roomId);
    }
}

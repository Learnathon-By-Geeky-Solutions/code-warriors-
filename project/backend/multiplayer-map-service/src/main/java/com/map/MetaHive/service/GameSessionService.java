package com.map.MetaHive.service;

import com.map.MetaHive.model.Player;
import com.map.MetaHive.model.Room;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    private final Map<String, Room> activeRooms = new ConcurrentHashMap<>();

    /**
     * Creates a room using the provided roomId if it doesn't already exist.
     *
     * @param roomId The office id to be used as the room id.
     */
    public void createRoom(String roomId) {
        if (roomId == null || roomId.isEmpty()) {
            throw new IllegalArgumentException("Room ID cannot be null or empty");
        }
        activeRooms.putIfAbsent(roomId, new Room(roomId));
        System.out.println("Room created (or already exists) with ID: " + roomId);
    }

    public boolean joinRoom(String roomId, Player player) {
        if (roomId == null || player == null || player.getId() == null) {
            throw new IllegalArgumentException("Room ID, Player, or Player ID cannot be null");
        }

        Room room = activeRooms.get(roomId);
        if (room != null) {
            room.addPlayer(player);
            System.out.println("Player " + player.getUsername() + " joined room " + roomId);
            return true;
        }
        System.out.println("Failed to join room: " + roomId + " (Room does not exist)");
        return false;
    }

    public void addRoom(String roomId, Room room) {
        if (roomId == null || room == null) {
            throw new IllegalArgumentException("Room ID or Room object cannot be null");
        }
        activeRooms.put(roomId, room);
        System.out.println("Added new room with ID: " + roomId);
    }

    public void addPlayer(Player player) {
        if (player == null || player.getId() == null || player.getRoomId() == null) {
            throw new IllegalArgumentException("Player, Player ID, or Room ID cannot be null");
        }

        Room room = activeRooms.get(player.getRoomId());
        if (room == null) {
            throw new IllegalStateException("Room does not exist: " + player.getRoomId());
        }

        System.out.println("Adding player to room " + player.getRoomId() + ": " + player.getUsername());
        room.addPlayer(player);
        System.out.println("Players now in room: " + room.getPlayers().size());
    }

    public Map<String, Player> getPlayersInRoom(String roomId) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room ID cannot be null");
        }
        Room room = activeRooms.get(roomId);
        if (room != null) {
            System.out.println("Retrieving players for room " + roomId
                    + ": " + room.getPlayers().size() + " total");
            return room.getPlayers();
        }
        return new ConcurrentHashMap<>();
    }

    public Player getPlayerById(String roomId, String playerId) {
        if (roomId == null || playerId == null) {
            throw new IllegalArgumentException("Room ID or Player ID cannot be null");
        }
        Room room = activeRooms.get(roomId);
        if (room != null) {
            return room.getPlayers().get(playerId);
        }
        return null;
    }

    public void removePlayer(String roomId, String playerId) {
        if (roomId == null || playerId == null) {
            throw new IllegalArgumentException("Room ID or Player ID cannot be null");
        }

        Room room = activeRooms.get(roomId);
        if (room == null) {
            System.out.println("Room does not exist: " + roomId);
            return;
        }

        room.removePlayer(playerId);
        System.out.println("Removed player " + playerId + " from room " + roomId);

        if (room.getPlayers().isEmpty()) {
            activeRooms.remove(roomId);
            System.out.println("Room removed due to no players: " + roomId);
        }
    }

    public boolean roomExists(String roomId) {
        return roomId != null && activeRooms.containsKey(roomId);
    }
}

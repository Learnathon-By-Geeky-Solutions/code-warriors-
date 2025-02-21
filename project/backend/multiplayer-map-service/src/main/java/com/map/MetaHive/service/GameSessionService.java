package com.map.MetaHive.service;

import com.map.MetaHive.model.Player;
import com.map.MetaHive.model.Room;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {

    private final Map<String, Room> activeRooms = new ConcurrentHashMap<>();
    private static final int ROOM_ID_LENGTH = 6;
    private static final String ROOM_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public String createRoom() {
        // Generate a short ID for the room
        String roomId;
        do {
            roomId = generateRoomId();
        } while (activeRooms.containsKey(roomId));

        System.out.println("Room created with ID: " + roomId);
        Room newRoom = new Room(roomId);
        activeRooms.put(roomId, newRoom);
        return roomId;
    }

    private String generateRoomId() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < ROOM_ID_LENGTH; i++) {
            int index = random.nextInt(ROOM_ID_CHARS.length());
            sb.append(ROOM_ID_CHARS.charAt(index));
        }
        return sb.toString();
    }

    public boolean joinRoom(String roomId, Player player) {
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
        activeRooms.put(roomId, room);
        System.out.println("Added new room with ID: " + roomId);
    }

    public void addPlayer(Player player) {
        Room room = activeRooms.get(player.getRoomId());
        if (room != null) {
            System.out.println("Adding player to room " + player.getRoomId() + ": " + player.getUsername());
            room.addPlayer(player);
            System.out.println("Players now in room: " + room.getPlayers().size());
        } else {
            System.out.println("Cannot add player. Room not found: " + player.getRoomId());
        }
    }

    public Map<String, Player> getPlayersInRoom(String roomId) {
        Room room = activeRooms.get(roomId);
        if (room != null) {
            System.out.println("Retrieving players for room " + roomId
                    + ": " + room.getPlayers().size() + " total");
            return room.getPlayers();
        }
        return new ConcurrentHashMap<>();
    }

    public Player getPlayerById(String roomId, String playerId) {
        Room room = activeRooms.get(roomId);
        if (room != null) {
            return room.getPlayers().get(playerId);
        }
        return null;
    }

    public void removePlayer(String roomId, String playerId) {
        Room room = activeRooms.get(roomId);
        if (room != null) {
            room.removePlayer(playerId);
            System.out.println("Removed player " + playerId + " from room " + roomId);
            if (room.getPlayers().isEmpty()) {
                activeRooms.remove(roomId);
                System.out.println("Room removed due to no players: " + roomId);
            }
        }
    }

    public boolean roomExists(String roomId) {
        return activeRooms.containsKey(roomId);
    }
}

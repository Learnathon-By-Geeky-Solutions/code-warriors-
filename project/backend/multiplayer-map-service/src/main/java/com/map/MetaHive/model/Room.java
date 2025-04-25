package com.map.metahive.model;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Room {
    private String id;
    private Map<String, Player> players;
    private long createdAt;

    public Room(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("Room ID cannot be null or empty");
        }
        this.id = id;
        this.players = new ConcurrentHashMap<>();
        this.createdAt = System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }

    public Map<String, Player> getPlayers() {
        return players;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void addPlayer(Player player) {
        if (player == null || player.getId() == null) {
            throw new IllegalArgumentException("Player or Player ID cannot be null");
        }
        players.put(player.getId(), player);
    }

    public void removePlayer(String playerId) {
        if (playerId == null) {
            throw new IllegalArgumentException("Player ID cannot be null");
        }
        players.remove(playerId);
    }

    public boolean hasPlayer(String playerId) {
        return playerId != null && players.containsKey(playerId);
    }
}

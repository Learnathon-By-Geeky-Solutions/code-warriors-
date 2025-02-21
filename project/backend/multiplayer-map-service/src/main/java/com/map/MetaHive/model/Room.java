package com.map.MetaHive.model;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Room {
    private String id;
    private Map<String, Player> players;
    private long createdAt;

    public Room(String id) {
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
        players.put(player.getId(), player);
    }

    public void removePlayer(String playerId) {
        players.remove(playerId);
    }

    public boolean hasPlayer(String playerId) {
        return players.containsKey(playerId);
    }
}

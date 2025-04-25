package com.map.metahive.dto;

public class LeaveRoomRequest {
    private String roomId;
    private String playerId;

    public LeaveRoomRequest() {}

    public LeaveRoomRequest(String roomId, String playerId) {
        this.roomId = roomId;
        this.playerId = playerId;
    }

    public String getRoomId() {
        return roomId;
    }
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
    public String getPlayerId() {
        return playerId;
    }
    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }
}

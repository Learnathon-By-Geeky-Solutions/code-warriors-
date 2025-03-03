package com.map.MetaHive.dto;

public class JoinRoomRequest {
    private String username;
    private String roomId;

    public JoinRoomRequest() {}

    public JoinRoomRequest(String username, String roomId) {
        this.username = username;
        this.roomId = roomId;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getRoomId() {
        return roomId;
    }
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
}

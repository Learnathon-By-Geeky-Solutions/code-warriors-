package com.map.metahive.dto;

public class JoinRoomRequest extends RoomRequest {
    public JoinRoomRequest() {
        super();
    }

    public JoinRoomRequest(String roomId, String username) {
        super(roomId, username);
    }
}

package com.map.MetaHive.dto;

public class JoinRoomRequest extends RoomRequest {
    public JoinRoomRequest() {
        super();
    }

    public JoinRoomRequest(String roomId, String username) {
        super(roomId, username);
    }
}

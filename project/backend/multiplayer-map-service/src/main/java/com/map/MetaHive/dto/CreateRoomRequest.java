package com.map.MetaHive.dto;

public class CreateRoomRequest extends RoomRequest {
    public CreateRoomRequest() {
        super();
    }

    public CreateRoomRequest(String roomId, String username) {
        super(roomId, username);
    }
}

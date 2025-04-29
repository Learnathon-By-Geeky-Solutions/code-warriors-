package com.map.metahive.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class DTOTest {

    @Test
    public void testRoomRequestGettersSetters() {
        RoomRequest request = new RoomRequest();
        request.setRoomId("room1");
        request.setUsername("user1");
        assertThat(request.getRoomId()).isEqualTo("room1");
        assertThat(request.getUsername()).isEqualTo("user1");

        RoomRequest request2 = new RoomRequest("room2", "user2");
        assertThat(request2.getRoomId()).isEqualTo("room2");
        assertThat(request2.getUsername()).isEqualTo("user2");
    }

    @Test
    public void testCreateRoomRequest() {
        CreateRoomRequest request = new CreateRoomRequest("room3", "user3");
        assertThat(request.getRoomId()).isEqualTo("room3");
        assertThat(request.getUsername()).isEqualTo("user3");
    }

    @Test
    public void testJoinRoomRequest() {
        JoinRoomRequest request = new JoinRoomRequest("room4", "user4");
        assertThat(request.getRoomId()).isEqualTo("room4");
        assertThat(request.getUsername()).isEqualTo("user4");
    }

    @Test
    public void testLeaveRoomRequest() {
        LeaveRoomRequest request = new LeaveRoomRequest("room5", "player5");
        assertThat(request.getRoomId()).isEqualTo("room5");
        assertThat(request.getPlayerId()).isEqualTo("player5");

        request.setRoomId("room6");
        request.setPlayerId("player6");
        assertThat(request.getRoomId()).isEqualTo("room6");
        assertThat(request.getPlayerId()).isEqualTo("player6");
    }
}

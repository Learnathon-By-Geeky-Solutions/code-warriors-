package com.map.metahive.controller;

import com.map.metahive.dto.CreateRoomRequest;
import com.map.metahive.dto.JoinRoomRequest;
import com.map.metahive.dto.LeaveRoomRequest;
import com.map.metahive.model.Player;
import com.map.metahive.model.Room;
import com.map.metahive.service.GameSessionService;
import com.map.metahive.service.SpawnPointService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class PlayerControllerTest {

    private GameSessionService gameSessionService;
    private SimpMessagingTemplate messagingTemplate;
    private SpawnPointService spawnPointService;
    private PlayerController playerController;

    @BeforeEach
    public void setup() {
        gameSessionService = mock(GameSessionService.class);
        messagingTemplate = mock(SimpMessagingTemplate.class);
        spawnPointService = mock(SpawnPointService.class);
        playerController = new PlayerController(gameSessionService, messagingTemplate, spawnPointService);
    }

    @Test
    public void testCreateRoomInvalidRoomId() {
        CreateRoomRequest request = new CreateRoomRequest("", "testuser");
        playerController.createRoom(request);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(messagingTemplate).convertAndSend(eq("/queue/roomCreated"), captor.capture());

        // The response should indicate a failed creation due to an invalid roomId.
        java.util.Map<?, ?> response = (java.util.Map<?, ?>) captor.getValue();
        assertThat(response.get("success")).isEqualTo(false);
        assertThat(response.get("message")).isEqualTo("Invalid roomId");
    }

    @Test
    public void testCreateRoomNewRoom() {
        String roomId = "room1";
        CreateRoomRequest request = new CreateRoomRequest(roomId, "testuser");
        when(gameSessionService.roomExists(roomId)).thenReturn(false);

        playerController.createRoom(request);
        verify(gameSessionService).createRoom(roomId);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(messagingTemplate).convertAndSend(eq("/queue/roomCreated"), captor.capture());
        java.util.Map<?, ?> response = (java.util.Map<?, ?>) captor.getValue();
        assertThat(response.get("success")).isEqualTo(true);
        assertThat(response.get("roomId")).isEqualTo(roomId);
    }

    @Test
    public void testJoinRoomCreatesNewRoomWhenNotExist() {
        String roomId = "room2";
        JoinRoomRequest request = new JoinRoomRequest(roomId, "testuser");
        when(gameSessionService.roomExists(roomId)).thenReturn(false);

        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        playerController.joinRoom(headerAccessor, request);

        verify(gameSessionService).addRoom(eq(roomId), any(Room.class));

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(messagingTemplate).convertAndSend(eq("/queue/joinResult"), captor.capture());
        java.util.Map<?, ?> response = (java.util.Map<?, ?>) captor.getValue();
        assertThat(response.get("success")).isEqualTo(true);
        assertThat(response.get("roomId")).isEqualTo(roomId);
    }

    @Test
    public void testRegisterPlayerNewPlayer() {
        Player player = new Player();
        player.setId("player1");
        player.setRoomId("room1");
        player.setUsername("testuser");

        when(gameSessionService.roomExists("room1")).thenReturn(true);
        when(gameSessionService.getPlayerById("room1", "player1")).thenReturn(null);
        when(spawnPointService.getSpawnCoordinates()).thenReturn(new double[]{100, 200});

        playerController.registerPlayer(player);

        // Verify the spawn coordinates assignment.
        assertThat(player.getX()).isEqualTo(100);
        assertThat(player.getY()).isEqualTo(200);
        verify(gameSessionService).addPlayer(player);
        verify(messagingTemplate).convertAndSend(eq("/topic/rooms/room1/players"), any(java.util.Map.class));
    }

    @Test
    public void testRegisterPlayerExistingPlayer() {
        Player existing = new Player();
        existing.setId("player1");
        existing.setRoomId("room1");
        existing.setUsername("oldname");

        Player incoming = new Player();
        incoming.setId("player1");
        incoming.setRoomId("room1");
        incoming.setUsername("newname");

        when(gameSessionService.roomExists("room1")).thenReturn(true);
        when(gameSessionService.getPlayerById("room1", "player1")).thenReturn(existing);

        playerController.registerPlayer(incoming);

        // Verify that the existing player's username is updated.
        assertThat(existing.getUsername()).isEqualTo("newname");
        verify(messagingTemplate).convertAndSend(eq("/topic/rooms/room1/players"), any(java.util.Map.class));
    }

    @Test
    public void testMovePlayerValid() {
        Player existing = new Player();
        existing.setId("player1");
        existing.setRoomId("room1");
        existing.setX(50);
        existing.setY(50);

        Player movement = new Player();
        movement.setId("player1");
        movement.setRoomId("room1");
        movement.setX(100);
        movement.setY(150);
        movement.setDirection("north");
        movement.setIsMoving(true);
        movement.setAnimation("walk");
        movement.setTimestamp(123456789L);

        when(gameSessionService.getPlayerById("room1", "player1")).thenReturn(existing);

        playerController.movePlayer(movement);

        assertThat(existing.getX()).isEqualTo(100);
        assertThat(existing.getY()).isEqualTo(150);
        assertThat(existing.getDirection()).isEqualTo("north");
        assertThat(existing.getIsMoving()).isTrue();
        assertThat(existing.getAnimation()).isEqualTo("walk");
        assertThat(existing.getTimestamp()).isEqualTo(123456789L);
        verify(messagingTemplate).convertAndSend(eq("/topic/rooms/room1/players"), any(java.util.Map.class));
    }

    @Test
    public void testMovePlayerNonExistent() {
        Player movement = new Player();
        movement.setId("player1");
        movement.setRoomId("room1");
        movement.setX(100);
        movement.setY(150);

        when(gameSessionService.getPlayerById("room1", "player1")).thenReturn(null);

        playerController.movePlayer(movement);
        verify(messagingTemplate, never()).convertAndSend(anyString(), Optional.ofNullable(any()));
    }

    @Test
    public void testLeaveRoom() {
        LeaveRoomRequest request = new LeaveRoomRequest("room1", "player1");
        playerController.leaveRoom(request);

        verify(gameSessionService).removePlayer("room1", "player1");
        verify(messagingTemplate).convertAndSend(eq("/topic/rooms/room1/players"), any(java.util.Map.class));
    }
}

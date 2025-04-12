package com.map.metahive.service;

import com.map.metahive.model.Player;
import com.map.metahive.model.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

public class GameSessionServiceTest {

    private GameSessionService gameSessionService;

    @BeforeEach
    public void setup() {
        gameSessionService = new GameSessionService();
    }

    @Test
    public void testCreateRoomInvalid() {
        assertThatThrownBy(() -> gameSessionService.createRoom(null))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> gameSessionService.createRoom(""))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void testCreateRoom() {
        String roomId = "room1";
        gameSessionService.createRoom(roomId);
        assertThat(gameSessionService.roomExists(roomId)).isTrue();
    }

    @Test
    public void testJoinRoom() {
        String roomId = "room2";
        gameSessionService.createRoom(roomId);

        Player player = new Player();
        player.setId("player1");
        player.setRoomId(roomId);

        boolean joined = gameSessionService.joinRoom(roomId, player);
        assertThat(joined).isTrue();
        assertThat(gameSessionService.getPlayerById(roomId, "player1")).isNotNull();

        // Joining a non-existent room
        Player player2 = new Player();
        player2.setId("player2");
        player2.setRoomId("nonexistentRoom");
        boolean joinedNonExistent = gameSessionService.joinRoom("nonexistentRoom", player2);
        assertThat(joinedNonExistent).isFalse();
    }

    @Test
    public void testAddRoomAndPlayer() {
        String roomId = "room3";
        Room room = new Room(roomId);
        gameSessionService.addRoom(roomId, room);
        assertThat(gameSessionService.roomExists(roomId)).isTrue();

        Player player = new Player();
        player.setId("player1");
        player.setRoomId(roomId);
        gameSessionService.addPlayer(player);
        assertThat(gameSessionService.getPlayerById(roomId, "player1")).isEqualTo(player);
    }

    @Test
    public void testAddPlayerToNonExistentRoom() {
        Player player = new Player();
        player.setId("player1");
        player.setRoomId("nonExistentRoom");
        assertThatThrownBy(() -> gameSessionService.addPlayer(player))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Room does not exist");
    }

    @Test
    public void testGetPlayersInRoom() {
        String roomId = "room4";
        gameSessionService.createRoom(roomId);
        Player player = new Player();
        player.setId("player1");
        player.setRoomId(roomId);
        gameSessionService.addPlayer(player);

        assertThat(gameSessionService.getPlayersInRoom(roomId)).containsKey("player1");
    }

    @Test
    public void testRemovePlayerAndRoomCleanup() {
        String roomId = "room5";
        gameSessionService.createRoom(roomId);
        Player player = new Player();
        player.setId("player1");
        player.setRoomId(roomId);
        gameSessionService.addPlayer(player);
        // Removing the player should clean up the room if empty.
        gameSessionService.removePlayer(roomId, "player1");
        assertThat(gameSessionService.roomExists(roomId)).isFalse();
    }

    @Test
    public void testRoomExists() {
        String roomId = "room6";
        assertThat(gameSessionService.roomExists(roomId)).isFalse();
        gameSessionService.createRoom(roomId);
        assertThat(gameSessionService.roomExists(roomId)).isTrue();
    }
}

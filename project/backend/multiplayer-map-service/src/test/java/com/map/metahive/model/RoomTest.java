package com.map.metahive.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

public class RoomTest {

    @Test
    public void testRoomConstructorAndMethods() {
        String roomId = "room1";
        Room room = new Room(roomId);
        assertThat(room.getId()).isEqualTo(roomId);
        assertThat(room.getCreatedAt()).isGreaterThan(0);
        assertThat(room.getPlayers()).isEmpty();

        // Test adding a player.
        Player player = new Player();
        player.setId("player1");
        room.addPlayer(player);
        assertThat(room.getPlayers()).containsKey("player1");
        assertThat(room.hasPlayer("player1")).isTrue();

        // Test removing the player.
        room.removePlayer("player1");
        assertThat(room.getPlayers()).doesNotContainKey("player1");
        assertThat(room.hasPlayer("player1")).isFalse();
    }

    @Test
    public void testRoomConstructorInvalidId() {
        assertThatThrownBy(() -> new Room(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Room ID cannot be null or empty");

        assertThatThrownBy(() -> new Room(""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Room ID cannot be null or empty");
    }

    @Test
    public void testAddPlayerNulls() {
        Room room = new Room("room2");
        assertThatThrownBy(() -> room.addPlayer(null))
                .isInstanceOf(IllegalArgumentException.class);

        Player player = new Player();
        assertThatThrownBy(() -> room.addPlayer(player))
                .isInstanceOf(IllegalArgumentException.class);

        player.setId("player2");
        room.addPlayer(player); // Now it should work.
        assertThat(room.getPlayers()).containsKey("player2");
    }

    @Test
    public void testRemovePlayerNull() {
        Room room = new Room("room3");
        assertThatThrownBy(() -> room.removePlayer(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Player ID cannot be null");
    }
}

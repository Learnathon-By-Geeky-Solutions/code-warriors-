package com.map.metahive.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class PlayerTest {

    @Test
    public void testGettersAndSetters() {
        Player player = new Player();
        player.setId("player1");
        player.setUsername("user1");
        player.setDirection("east");
        player.setX(10.0);
        player.setY(20.0);
        player.setColor("red");
        player.setIsMoving(true);
        player.setAnimation("run");
        player.setTimestamp(123456789L);
        player.setRoomId("room1");

        assertThat(player.getId()).isEqualTo("player1");
        assertThat(player.getUsername()).isEqualTo("user1");
        assertThat(player.getDirection()).isEqualTo("east");
        assertThat(player.getX()).isEqualTo(10.0);
        assertThat(player.getY()).isEqualTo(20.0);
        assertThat(player.getColor()).isEqualTo("red");
        assertThat(player.getIsMoving()).isTrue();
        assertThat(player.getAnimation()).isEqualTo("run");
        assertThat(player.getTimestamp()).isEqualTo(123456789L);
        assertThat(player.getRoomId()).isEqualTo("room1");
    }
}

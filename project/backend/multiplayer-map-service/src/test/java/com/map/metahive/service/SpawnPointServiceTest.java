package com.map.metahive.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class SpawnPointServiceTest {

    @Test
    public void testGetSpawnCoordinatesFallback() {
        // This test assumes that there is no valid "mapfinal1.json" in the test classpath.
        SpawnPointService spawnPointService = new SpawnPointService();
        double[] coords = spawnPointService.getSpawnCoordinates();
        // The fallback coordinates are defined as {400, 300}.
        assertThat(coords[0]).isEqualTo(400);
        assertThat(coords[1]).isEqualTo(300);
    }

    // To test JSON parsing, add a valid "mapfinal1.json" file under src/test/resources and create an extra test.
}

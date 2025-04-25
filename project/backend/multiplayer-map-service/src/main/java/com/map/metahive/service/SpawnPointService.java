package com.map.metahive.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class SpawnPointService {

    private static final Logger logger = LoggerFactory.getLogger(SpawnPointService.class);
    private static final String MAP_JSON_PATH = "mapfinal1.json";
    private static final double[] FALLBACK_COORDINATES = {400, 300};

    /**
     * Reads the Tiled map JSON from the classpath and extracts the first spawn point's coordinates.
     * Returns fallback coordinates if not found or if an error occurs.
     *
     * @return a double array with [spawnX, spawnY]
     */
    public double[] getSpawnCoordinates() {
        try {
            ClassPathResource resource = new ClassPathResource(MAP_JSON_PATH);
            InputStream is = resource.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> mapData = mapper.readValue(is, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> layers = (List<Map<String, Object>>) mapData.get("layers");
            if (layers != null) {
                for (Map<String, Object> layer : layers) {
                    String layerName = (String) layer.get("name");
                    if ("spawnpoint".equalsIgnoreCase(layerName)) {
                        List<Map<String, Object>> objects = (List<Map<String, Object>>) layer.get("objects");
                        if (objects != null && !objects.isEmpty()) {
                            Map<String, Object> spawnObj = objects.get(0);
                            double spawnX = ((Number) spawnObj.get("x")).doubleValue();
                            double spawnY = ((Number) spawnObj.get("y")).doubleValue();
                            return new double[]{spawnX, spawnY};
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error reading spawn coordinates from JSON: ", e);
        }
        return FALLBACK_COORDINATES;
    }
}

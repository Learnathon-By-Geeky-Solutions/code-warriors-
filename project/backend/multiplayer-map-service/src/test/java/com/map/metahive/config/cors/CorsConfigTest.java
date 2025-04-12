package com.map.metahive.config.cors;

import org.junit.jupiter.api.Test;
import org.springframework.web.filter.CorsFilter;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class CorsConfigTest {

    @Test
    public void testCorsFilterBean() {
        CorsConfig config = new CorsConfig();
        CorsFilter filter = config.corsFilter();
        assertNotNull(filter, "CorsFilter bean should not be null");
    }
}

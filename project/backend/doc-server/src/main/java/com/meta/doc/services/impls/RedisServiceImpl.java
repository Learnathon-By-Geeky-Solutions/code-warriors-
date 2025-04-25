package com.meta.doc.services.impls;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meta.doc.services.RedisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Implementation of RedisService for caching data in Redis.
 */
@Service
@Slf4j
public class RedisServiceImpl implements RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String EXCEPTION_MESSAGE = "Exception occurred while interacting with Redis: ";

    /**
     * Constructor-based dependency injection for RedisTemplate.
     *
     * @param redisTemplate RedisTemplate instance for Redis operations
     */
    public RedisServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Retrieves an object from Redis and converts it to the specified class.
     *
     * @param key         The Redis key to retrieve the value from
     * @param entityClass The class type to convert the stored value into
     * @param <T>         The type of the object being retrieved
     * @return The retrieved object or null if an exception occurs
     */
    public <T> T get(String key, Class<T> entityClass) {
        try {
            Object o = redisTemplate.opsForValue().get(key);
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(o.toString(), entityClass);
        } catch (Exception e) {
            log.error(EXCEPTION_MESSAGE, e);
            return null;
        }
    }

    /**
     * Stores an object in Redis with an optional TTL (Time-To-Live).
     *
     * @param key The Redis key
     * @param o   The object to store
     * @param ttl The time-to-live in seconds
     */
    public void set(String key, Object o, Long ttl) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonValue = objectMapper.writeValueAsString(o);
            redisTemplate.opsForValue().set(key, jsonValue, ttl, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error(EXCEPTION_MESSAGE, e);
        }
    }

    /**
     * Deletes a key from Redis.
     *
     * @param key The Redis key to delete
     */
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.error(EXCEPTION_MESSAGE, e);
        }
    }
}

package com.meta.doc.services;

public interface RedisService {
    <T> T get(String key,Class<T> entityClass);
    void set(String key, Object o, Long ttl);
    void delete(String key);
}

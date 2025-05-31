package com.example.homecleanapi.utils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

public class LockManager {
    private static final Map<Long, ReentrantLock> cleanerLocks = new ConcurrentHashMap<>();

    public static ReentrantLock getLockForCleaner(Long cleanerId) {
        return cleanerLocks.computeIfAbsent(cleanerId, k -> new ReentrantLock());
    }
}

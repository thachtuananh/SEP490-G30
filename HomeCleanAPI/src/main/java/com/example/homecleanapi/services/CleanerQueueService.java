package com.example.homecleanapi.services;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.*;

@Service
public class CleanerQueueService {

    private final Map<Long, BlockingQueue<Runnable>> cleanerQueues = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public void enqueue(Long cleanerId, Runnable task) {
        cleanerQueues.computeIfAbsent(cleanerId, id -> {
            BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
            startWorker(id, queue);
            return queue;
        }).add(task);
    }

    private void startWorker(Long cleanerId, BlockingQueue<Runnable> queue) {
        executorService.submit(() -> {
            while (true) {
                try {
                    Runnable task = queue.take();
                    task.run();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
}


package com.map.metahive.model;

public class Player {
    private String id;
    private String direction;
    private String username;
    private double x;
    private double y;
    private String color;
    private boolean isMoving;
    private String animation;
    private long timestamp;
    private String roomId;

    public Player() {
        // no-args constructor
    }

    // Getters and Setters

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getDirection() {
        return direction;
    }
    public void setDirection(String direction) {
        this.direction = direction;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public double getX() {
        return x;
    }
    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }
    public void setY(double y) {
        this.y = y;
    }

    public String getColor() {
        return color;
    }
    public void setColor(String color) {
        this.color = color;
    }

    public boolean getIsMoving() {
        return isMoving;
    }
    public void setIsMoving(boolean isMoving) {
        this.isMoving = isMoving;
    }

    public String getAnimation() {
        return animation;
    }
    public void setAnimation(String animation) {
        this.animation = animation;
    }

    public long getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getRoomId() {
        return roomId;
    }
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
}

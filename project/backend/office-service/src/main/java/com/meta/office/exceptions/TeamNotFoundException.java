package com.meta.office.exceptions;

public class TeamNotFoundException extends RuntimeException {
    public TeamNotFoundException(String teamId) {
        super("Team not found with id: " + teamId);
    }
}
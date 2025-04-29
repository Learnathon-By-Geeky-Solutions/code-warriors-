package com.meta.office.exceptions;

public class InvalidRoleException extends RuntimeException {
    public InvalidRoleException(Integer roleId) {
        super("Invalid role ID: " + roleId);
    }
}

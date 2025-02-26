package com.meta.office.exceptions;

public class MemberRoleNotFoundException extends RuntimeException{
    public MemberRoleNotFoundException(Long id) {
        super("Member role not found with id: " + id);
    }
}

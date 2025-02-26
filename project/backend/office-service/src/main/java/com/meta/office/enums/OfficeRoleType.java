package com.meta.office.enums;

import com.meta.office.exceptions.InvalidRoleException;

public enum OfficeRoleType {
    ADMIN(101, "Admin"),
    MODERATOR(102, "Moderator"),
    MANAGER(103, "Manager"),
    EMPLOYEE(104, "Employee"),
    GUEST(105, "Guest"),
    CUSTOMER(106, "Customer"),
    VENDOR(107, "Vendor"),
    OPERATOR(108, "Operator");

    private final Integer id;
    private final String name;

    OfficeRoleType(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public static OfficeRoleType fromId(Integer id) {
        for (OfficeRoleType role : OfficeRoleType.values()) {
            if (role.getId().equals(id)) {
                return role;
            }
        }
        throw new InvalidRoleException(id);
    }
}
package com.meta.office.dtos;

import lombok.Data;

@Data
public class OfficeRoleDTO {
    private Long id;
    private String memberId;
    private String officeId;
    private Integer roleId;
    private String roleName; // Derived from roleId
}

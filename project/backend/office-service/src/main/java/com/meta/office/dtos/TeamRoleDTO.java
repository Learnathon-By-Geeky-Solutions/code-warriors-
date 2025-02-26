package com.meta.office.dtos;

import lombok.Data;

@Data
public class TeamRoleDTO {
    private Long id;
    private String memberId;
    private String teamId;
    private Integer roleId;
    private String roleName;
}

package com.meta.office.services;

import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.enums.OfficeRoleType;

import java.util.List;

public interface OfficeRoleService {
    OfficeRoleDTO assignRole(OfficeRoleDTO officeRoleDTO);
    List<OfficeRoleDTO> getRolesByOffice(String officeId);
    List<OfficeRoleDTO> getRolesByMember(String memberId);
    List<OfficeRoleDTO> getMembersByRole(OfficeRoleType officeRoleType, String officeId);
    boolean hasMemberRole(String memberId, OfficeRoleType officeRoleType, String officeId);
}

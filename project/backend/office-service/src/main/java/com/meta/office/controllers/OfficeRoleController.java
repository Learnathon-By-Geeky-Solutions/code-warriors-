package com.meta.office.controllers;

import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.enums.OfficeRoleType;
import com.meta.office.services.OfficeRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/os/v1/office-role")
public class OfficeRoleController {

    private final OfficeRoleService officeRoleService;

    @Autowired
    public OfficeRoleController(OfficeRoleService officeRoleService) {
        this.officeRoleService = officeRoleService;
    }

    @PostMapping
    public ResponseEntity<OfficeRoleDTO> assignRole(@RequestBody OfficeRoleDTO officeRoleDTO) {
        return ResponseEntity.ok(officeRoleService.assignRole(officeRoleDTO));
    }

    @GetMapping("/office/{officeId}")
    public ResponseEntity<List<OfficeRoleDTO>> getRolesByOffice(@PathVariable String officeId) {
        return ResponseEntity.ok(officeRoleService.getRolesByOffice(officeId));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<OfficeRoleDTO>> getRolesByMember(@PathVariable String memberId) {
        return ResponseEntity.ok(officeRoleService.getRolesByMember(memberId));
    }

    @GetMapping("/office/{officeId}/role/{roleId}")
    public ResponseEntity<List<OfficeRoleDTO>> getMembersByRole(@PathVariable String officeId, @PathVariable Integer roleId) {
        OfficeRoleType roleType = OfficeRoleType.fromId(roleId);
        return ResponseEntity.ok(officeRoleService.getMembersByRole(roleType, officeId));
    }

    @GetMapping("/has-role")
    public ResponseEntity<Boolean> hasMemberRole(
            @RequestParam String memberId,
            @RequestParam Integer roleId,
            @RequestParam String officeId) {
        OfficeRoleType roleType = OfficeRoleType.fromId(roleId);
        boolean hasRole = officeRoleService.hasMemberRole(memberId, roleType, officeId);
        return ResponseEntity.ok(hasRole);
    }
}

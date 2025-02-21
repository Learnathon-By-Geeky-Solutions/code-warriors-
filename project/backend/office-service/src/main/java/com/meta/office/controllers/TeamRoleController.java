package com.meta.office.controllers;

import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.services.TeamRoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/os/v1/team-role")
public class TeamRoleController {
    private final TeamRoleService teamRoleService;

    public TeamRoleController(TeamRoleService teamRoleService) {
        this.teamRoleService = teamRoleService;
    }

    /**
     * Assigns a role to a team member.
     *
     * @param teamRoleDTO The team role details.
     * @return The assigned TeamRoleDTO.
     */
    @PostMapping
    public ResponseEntity<TeamRoleDTO> assignRole(@RequestBody TeamRoleDTO teamRoleDTO) {
        TeamRoleDTO assignedRole = teamRoleService.assignRole(teamRoleDTO);
        return ResponseEntity.ok(assignedRole);
    }

    /**
     * Retrieves all roles within a specific team.
     *
     * @param teamId The team ID.
     * @return A list of TeamRoleDTOs.
     */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamRoleDTO>> getRolesByTeam(@PathVariable String teamId) {
        List<TeamRoleDTO> roles = teamRoleService.getRolesByTeam(teamId);
        return ResponseEntity.ok(roles);
    }

    /**
     * Retrieves all team roles assigned to a specific member.
     *
     * @param memberId The member ID.
     * @return A list of TeamRoleDTOs.
     */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<TeamRoleDTO>> getTeamRolesByMember(@PathVariable String memberId) {
        List<TeamRoleDTO> teamRoles = teamRoleService.getTeamRolesByMember(memberId);
        return ResponseEntity.ok(teamRoles);
    }


    @GetMapping("/users/{teamId}")
    public ResponseEntity<List<String>> getUserIdsByTeam(@PathVariable String teamId) {
        List<String> userIds = teamRoleService.getUserIdsByTeam(teamId);
        return ResponseEntity.ok(userIds);
    }

}

package com.meta.office.services;

import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.enums.TeamRoleType;

import java.util.List;

public interface TeamRoleService {
    /**
     * Assigns a role to a team member.
     *
     * @param teamRoleDTO The team role details.
     * @return The assigned TeamRoleDTO.
     */
    TeamRoleDTO assignRole(TeamRoleDTO teamRoleDTO);

    /**
     * Retrieves all roles within a specific team.
     *
     * @param teamId The team ID.
     * @return A list of TeamRoleDTOs.
     */
    List<TeamRoleDTO> getRolesByTeam(String teamId);

    /**
     * Retrieves all team roles assigned to a specific member.
     *
     * @param memberId The member ID.
     * @return A list of TeamRoleDTOs.
     */
    List<TeamRoleDTO> getTeamRolesByMember(String memberId);

    /**
     * Retrieves all members with a specific role within a team.
     *
     * @param roleType The role type.
     * @param teamId   The team ID.
     * @return A list of TeamRoleDTOs.
     */
    List<TeamRoleDTO> getMembersByRoleInTeam(TeamRoleType roleType, String teamId);

    /**
     * Checks if a member has a specific role within a team.
     *
     * @param memberId The member ID.
     * @param roleType The role type.
     * @param teamId   The team ID.
     * @return True if the member has the role in the team, else false.
     */
    boolean hasMemberRoleInTeam(String memberId, TeamRoleType roleType, String teamId);

    List<String> getUserIdsByTeam(String teamId);

}

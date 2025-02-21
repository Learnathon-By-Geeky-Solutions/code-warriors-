package com.meta.office.services;

import com.meta.office.dtos.TeamDTO;
import java.util.List;

public interface TeamService {
    /**
     * Creates a new team and assigns the creator as the Team Leader.
     *
     * @param teamDTO      The team details.
     * @param creatorUserId The ID of the user creating the team.
     * @return The created TeamDTO.
     */
    TeamDTO createTeam(TeamDTO teamDTO, String creatorUserId);

    /**
     * Retrieves a team by its ID.
     *
     * @param id The team ID.
     * @return The TeamDTO.
     */
    TeamDTO getTeam(String id);

    /**
     * Updates an existing team.
     *
     * @param id      The team ID.
     * @param teamDTO The updated team details.
     * @return The updated TeamDTO.
     */
    TeamDTO updateTeam(String id, TeamDTO teamDTO);

    /**
     * Deletes a team by its ID.
     *
     * @param id The team ID.
     */
    void deleteTeam(String id);

    /**
     * Retrieves all teams associated with a specific office.
     *
     * @param officeId The office ID.
     * @return A list of TeamDTOs.
     */
    List<TeamDTO> getTeamsByOffice(String officeId);

    /**
     * Retrieves all teams that the current user is a member of.
     *
     * @param userId The user ID.
     * @return A list of TeamDTOs.
     */
    List<TeamDTO> getCurrentUserTeams(String userId);

    List<TeamDTO> getTeamsByOfficeForUser(String officeId, String userId);




}

package com.meta.office.controllers;

import com.meta.office.dtos.TeamDTO;
import com.meta.office.services.TeamService;
import com.meta.office.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/os/v1/team")
public class TeamController {
    private final TeamService teamService;
    private final JwtUtil jwtUtil;

    public TeamController(TeamService teamService, JwtUtil jwtUtil) {
        this.teamService = teamService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Creates a new team and assigns the creator as the Team Leader.
     *
     * @param teamDTO The team details.
     * @return The created TeamDTO.
     */
    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody TeamDTO teamDTO) {
        String userId = jwtUtil.getUserIdFromToken();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        TeamDTO createdTeam = teamService.createTeam(teamDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
    }

    /**
     * Retrieves a team by its ID.
     *
     * @param id The team ID.
     * @return The TeamDTO.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable String id) {
        TeamDTO teamDTO = teamService.getTeam(id);
        return ResponseEntity.ok(teamDTO);
    }

    /**
     * Updates an existing team.
     *
     * @param id      The team ID.
     * @param teamDTO The updated team details.
     * @return The updated TeamDTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable String id, @RequestBody TeamDTO teamDTO) {
        TeamDTO updatedTeam = teamService.updateTeam(id, teamDTO);
        return ResponseEntity.ok(updatedTeam);
    }

    /**
     * Deletes a team by its ID.
     *
     * @param id The team ID.
     * @return An empty response with HTTP status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves all teams associated with a specific office.
     *
     * @param officeId The office ID.
     * @return A list of TeamDTOs.
     */
//    @GetMapping("/office/{officeId}")
//    public ResponseEntity<List<TeamDTO>> getTeamsByOffice(@PathVariable String officeId) {
//        List<TeamDTO> teams = teamService.getTeamsByOffice(officeId);
//        return ResponseEntity.ok(teams);
//    }

    @GetMapping("/office/{officeId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByOffice(@PathVariable String officeId) {
        String userId = jwtUtil.getUserIdFromToken();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<TeamDTO> teams = teamService.getTeamsByOfficeForUser(officeId, userId);
        return ResponseEntity.ok(teams);
    }

    /**
     * Retrieves all teams that the current user is a member of.
     *
     * @return A list of TeamDTOs.
     */
    @GetMapping("/current-user")
    public ResponseEntity<List<TeamDTO>> getCurrentUserTeams() {
        String userId = jwtUtil.getUserIdFromToken();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<TeamDTO> userTeams = teamService.getCurrentUserTeams(userId);
        return ResponseEntity.ok(userTeams);
    }
}

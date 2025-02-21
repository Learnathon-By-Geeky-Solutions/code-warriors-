package com.meta.office.services.impl;

import com.meta.office.dtos.TeamDTO;
import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.entities.Team;
import com.meta.office.enums.TeamRoleType;
import com.meta.office.exceptions.TeamNotFoundException;
import com.meta.office.repositories.TeamRepository;
import com.meta.office.services.TeamRoleService;
import com.meta.office.services.TeamService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final ModelMapper modelMapper;
    private final TeamRoleService teamRoleService;

    public TeamServiceImpl(TeamRepository teamRepository, ModelMapper modelMapper, TeamRoleService teamRoleService) {
        this.teamRepository = teamRepository;
        this.modelMapper = modelMapper;
        this.teamRoleService = teamRoleService;
    }

    @Override
    public TeamDTO createTeam(TeamDTO teamDTO, String creatorUserId) {
        teamDTO.setId(UUID.randomUUID().toString());
        Team team = modelMapper.map(teamDTO, Team.class);
        Team savedTeam = teamRepository.save(team);

        // Assign Team Leader role to the creator
        TeamRoleDTO teamRoleDTO = new TeamRoleDTO();
        teamRoleDTO.setMemberId(creatorUserId);
        teamRoleDTO.setTeamId(savedTeam.getId());
        teamRoleDTO.setRoleId(TeamRoleType.TEAM_LEADER.getId());
        teamRoleService.assignRole(teamRoleDTO);

        return modelMapper.map(savedTeam, TeamDTO.class);
    }

    @Override
    public TeamDTO getTeam(String id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new TeamNotFoundException(id));
        return modelMapper.map(team, TeamDTO.class);
    }

    @Override
    public TeamDTO updateTeam(String id, TeamDTO teamDTO) {
        if (!teamRepository.existsById(id)) {
            throw new TeamNotFoundException(id);
        }
        teamDTO.setId(id);
        Team team = modelMapper.map(teamDTO, Team.class);
        Team updatedTeam = teamRepository.save(team);
        return modelMapper.map(updatedTeam, TeamDTO.class);
    }

    @Override
    public void deleteTeam(String id) {
        if (!teamRepository.existsById(id)) {
            throw new TeamNotFoundException(id);
        }
        teamRepository.deleteById(id);
    }

    @Override
    public List<TeamDTO> getTeamsByOffice(String officeId) {
        return teamRepository.findByOfficeId(officeId).stream()
                .map(team -> modelMapper.map(team, TeamDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamDTO> getCurrentUserTeams(String userId) {
        List<TeamRoleDTO> teamRoles = teamRoleService.getTeamRolesByMember(userId);
        return teamRoles.stream()
                .map(role -> getTeam(role.getTeamId()))
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamDTO> getTeamsByOfficeForUser(String officeId, String userId) {
        // First, get the list of teams in the office
        List<Team> officeTeams = teamRepository.findByOfficeId(officeId);

        // Then filter teams where the user has any role
        return officeTeams.stream()
                .filter(team -> {
                    // Check if the user has any role in this team
                    List<TeamRoleDTO> userTeamRoles = teamRoleService.getTeamRolesByMember(userId);
                    return userTeamRoles.stream()
                            .anyMatch(role -> role.getTeamId().equals(team.getId()));
                })
                .map(team -> modelMapper.map(team, TeamDTO.class))
                .collect(Collectors.toList());
    }



}

package com.meta.office.services.impl;

import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.entities.TeamRole;
import com.meta.office.enums.TeamRoleType;
import com.meta.office.exceptions.InvalidRoleException;
import com.meta.office.exceptions.TeamNotFoundException;
import com.meta.office.repositories.TeamRoleRepository;
import com.meta.office.repositories.TeamRepository;
import com.meta.office.services.TeamRoleService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamRoleServiceImpl implements TeamRoleService {
    private final TeamRoleRepository teamRoleRepository;
    private final TeamRepository teamRepository;
    private final ModelMapper modelMapper;

    public TeamRoleServiceImpl(TeamRoleRepository teamRoleRepository,
                               TeamRepository teamRepository,
                               ModelMapper modelMapper) {
        this.teamRoleRepository = teamRoleRepository;
        this.teamRepository = teamRepository;
        this.modelMapper = modelMapper;
    }

    private void validateRole(Integer roleId) {
        try {
            TeamRoleType.fromId(roleId);
        } catch (InvalidRoleException e) {
            throw new InvalidRoleException(roleId);
        }
    }

    private TeamRoleDTO enrichWithRoleName(TeamRoleDTO dto) {
        TeamRoleType teamRoleType = TeamRoleType.fromId(dto.getRoleId());
        dto.setRoleName(teamRoleType.getName());
        return dto;
    }

    private void validateTeam(String teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new TeamNotFoundException(teamId);
        }
    }

    @Override
    public TeamRoleDTO assignRole(TeamRoleDTO teamRoleDTO) {
        validateRole(teamRoleDTO.getRoleId());
        validateTeam(teamRoleDTO.getTeamId());

        TeamRole teamRole = modelMapper.map(teamRoleDTO, TeamRole.class);
        TeamRole savedRole = teamRoleRepository.save(teamRole);
        return enrichWithRoleName(modelMapper.map(savedRole, TeamRoleDTO.class));
    }

    @Override
    public List<TeamRoleDTO> getRolesByTeam(String teamId) {
        return teamRoleRepository.findByTeamId(teamId).stream()
                .map(role -> modelMapper.map(role, TeamRoleDTO.class))
                .map(this::enrichWithRoleName)
                .toList();
    }

    @Override
    public List<TeamRoleDTO> getTeamRolesByMember(String memberId) {
        return teamRoleRepository.findByMemberId(memberId).stream()
                .map(role -> modelMapper.map(role, TeamRoleDTO.class))
                .map(this::enrichWithRoleName)
                .toList();
    }

    @Override
    public List<TeamRoleDTO> getMembersByRoleInTeam(TeamRoleType roleType, String teamId) {
        return teamRoleRepository.findByRoleIdAndTeamId(roleType.getId(), teamId).stream()
                .map(role -> modelMapper.map(role, TeamRoleDTO.class))
                .map(this::enrichWithRoleName)
                .toList();
    }

    @Override
    public boolean hasMemberRoleInTeam(String memberId, TeamRoleType roleType, String teamId) {
        return teamRoleRepository.existsByMemberIdAndRoleIdAndTeamId(memberId, roleType.getId(), teamId);
    }

    @Override
    public List<String> getUserIdsByTeam(String teamId) {
        // Validate team exists
        validateTeam(teamId);

        // Retrieve all team roles for the given team and extract unique member IDs
        return teamRoleRepository.findByTeamId(teamId).stream()
                .map(TeamRole::getMemberId)
                .distinct()
                .collect(Collectors.toList());
    }
}

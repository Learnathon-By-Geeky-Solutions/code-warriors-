package com.meta.office.services;

import com.meta.office.config.TestContainersConfig;
import com.meta.office.dtos.TeamDTO;
import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.enums.TeamRoleType;
import com.meta.office.repositories.TeamRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
class TeamRoleServiceTest {

    @Autowired
    private TeamRoleService teamRoleService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private TeamRoleRepository teamRoleRepository;

    private TeamDTO testTeam;
    private String testUserId;

    @BeforeEach
    void setUp() {
        teamRoleRepository.deleteAll();
        testUserId = UUID.randomUUID().toString();
        
        TeamDTO teamDTO = new TeamDTO();
        teamDTO.setName("Test Team");
        teamDTO.setDescription("Test Description");
        testTeam = teamService.createTeam(teamDTO, testUserId);
    }

    @Test
    void assignRole_ShouldAssignRoleSuccessfully() {
        // Arrange
        TeamRoleDTO roleDTO = new TeamRoleDTO();
        roleDTO.setTeamId(testTeam.getId());
        roleDTO.setMemberId(UUID.randomUUID().toString());
        roleDTO.setRoleId(TeamRoleType.DEVELOPER.getId());

        // Act
        TeamRoleDTO assignedRole = teamRoleService.assignRole(roleDTO);

        // Assert
        assertNotNull(assignedRole);
        assertEquals(roleDTO.getTeamId(), assignedRole.getTeamId());
        assertEquals(roleDTO.getMemberId(), assignedRole.getMemberId());
        assertEquals(TeamRoleType.DEVELOPER.getName(), assignedRole.getRoleName());
    }

    @Test
    void getRolesByTeam_ShouldReturnAllTeamRoles() {
        // Arrange
        String memberId = UUID.randomUUID().toString();
        TeamRoleDTO roleDTO = new TeamRoleDTO();
        roleDTO.setTeamId(testTeam.getId());
        roleDTO.setMemberId(memberId);
        roleDTO.setRoleId(TeamRoleType.DEVELOPER.getId());
        teamRoleService.assignRole(roleDTO);

        // Act
        List<TeamRoleDTO> teamRoles = teamRoleService.getRolesByTeam(testTeam.getId());

        // Assert
        assertThat(teamRoles).hasSize(2); // Including the team leader role
        assertThat(teamRoles).extracting("teamId")
                .containsOnly(testTeam.getId());
    }

   

    @Test
    void getUserIdsByTeam_ShouldReturnAllTeamMembers() {
        // Arrange
        String newMemberId = UUID.randomUUID().toString();
        TeamRoleDTO roleDTO = new TeamRoleDTO();
        roleDTO.setTeamId(testTeam.getId());
        roleDTO.setMemberId(newMemberId);
        roleDTO.setRoleId(TeamRoleType.DEVELOPER.getId());
        teamRoleService.assignRole(roleDTO);

        // Act
        List<String> userIds = teamRoleService.getUserIdsByTeam(testTeam.getId());

        // Assert
        assertThat(userIds).hasSize(2)
                .contains(testUserId, newMemberId);
    }
} 
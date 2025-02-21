package com.meta.office.services;

import com.meta.office.config.TestContainersConfig;
import com.meta.office.dtos.TeamDTO;
import com.meta.office.dtos.TeamRoleDTO;
import com.meta.office.entities.Team;
import com.meta.office.enums.TeamRoleType;
import com.meta.office.repositories.TeamRepository;
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
class TeamServiceTest {

    @Autowired
    private TeamService teamService;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamRoleService teamRoleService;

    private TeamDTO createTestTeamDTO() {
        TeamDTO teamDTO = new TeamDTO();
        teamDTO.setName("Test Team");
        teamDTO.setDescription("Test Description");
        teamDTO.setOfficeId(UUID.randomUUID().toString());
        return teamDTO;
    }

    @BeforeEach
    void setUp() {
        teamRepository.deleteAll();
    }

    @Test
    void createTeam_ShouldCreateTeamAndAssignLeaderRole() {
        // Arrange
        TeamDTO teamDTO = createTestTeamDTO();
        String creatorUserId = UUID.randomUUID().toString();

        // Act
        TeamDTO createdTeam = teamService.createTeam(teamDTO, creatorUserId);

        // Assert
        assertNotNull(createdTeam.getId());
        assertEquals(teamDTO.getName(), createdTeam.getName());
        assertEquals(teamDTO.getDescription(), createdTeam.getDescription());

        // Verify leader role was assigned
        List<TeamRoleDTO> teamRoles = teamRoleService.getRolesByTeam(createdTeam.getId());
        assertThat(teamRoles)
                .hasSize(1)
                .anySatisfy(role -> {
                    assertEquals(creatorUserId, role.getMemberId());
                    assertEquals(TeamRoleType.TEAM_LEADER.getId(), role.getRoleId());
                });
    }

    @Test
    void getTeamsByOffice_ShouldReturnTeamsForOffice() {
        // Arrange
        String officeId = UUID.randomUUID().toString();
        TeamDTO team1 = createTestTeamDTO();
        TeamDTO team2 = createTestTeamDTO();
        team1.setOfficeId(officeId);
        team2.setOfficeId(officeId);

        String creatorUserId = UUID.randomUUID().toString();
        teamService.createTeam(team1, creatorUserId);
        teamService.createTeam(team2, creatorUserId);

        // Act
        List<TeamDTO> teams = teamService.getTeamsByOffice(officeId);

        // Assert
        assertThat(teams).hasSize(2);
        assertThat(teams).allSatisfy(team -> 
            assertEquals(officeId, team.getOfficeId())
        );
    }

    @Test
    void getCurrentUserTeams_ShouldReturnTeamsForUser() {
        // Arrange
        String userId = UUID.randomUUID().toString();
        TeamDTO team1 = createTestTeamDTO();
        TeamDTO team2 = createTestTeamDTO();

        TeamDTO createdTeam1 = teamService.createTeam(team1, userId);
        TeamDTO createdTeam2 = teamService.createTeam(team2, userId);

        // Act
        List<TeamDTO> userTeams = teamService.getCurrentUserTeams(userId);

        // Assert
        assertThat(userTeams).hasSize(2);
        assertThat(userTeams).extracting("id")
                .containsExactlyInAnyOrder(createdTeam1.getId(), createdTeam2.getId());
    }
} 
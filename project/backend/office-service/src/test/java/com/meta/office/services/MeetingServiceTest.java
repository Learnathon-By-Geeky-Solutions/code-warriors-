package com.meta.office.services;

import com.meta.office.config.TestContainersConfig;
import com.meta.office.dtos.MeetingDTO;
import com.meta.office.repositories.MeetingRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
class MeetingServiceTest {

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private MeetingRepo meetingRepo;

    private MeetingDTO createTestMeetingDTO() {
        return MeetingDTO.builder()
                .teamId(UUID.randomUUID().toString())
                .title("Test Meeting")
                .description("Test Description")
                .meetingDate(LocalDateTime.now().plusDays(1))
                .summary("Test Summary")
                .build();
    }

    @BeforeEach
    void setUp() {
        meetingRepo.deleteAll();
    }

    @Test
    void createMeeting_ShouldCreateMeetingSuccessfully() {
        // Arrange
        MeetingDTO meetingDTO = createTestMeetingDTO();

        // Act
        MeetingDTO createdMeeting = meetingService.createMeeting(meetingDTO);

        // Assert
        assertNotNull(createdMeeting.getId());
        assertEquals(meetingDTO.getTitle(), createdMeeting.getTitle());
        assertEquals(meetingDTO.getDescription(), createdMeeting.getDescription());
        assertEquals(meetingDTO.getTeamId(), createdMeeting.getTeamId());
    }

    @Test
    void getMeetingsByTeamId_ShouldReturnMeetingsOrderedByDate() {
        // Arrange
        String teamId = UUID.randomUUID().toString();
        
        MeetingDTO meeting1 = createTestMeetingDTO();
        meeting1.setTeamId(teamId);
        meeting1.setMeetingDate(LocalDateTime.now().plusDays(1));
        
        MeetingDTO meeting2 = createTestMeetingDTO();
        meeting2.setTeamId(teamId);
        meeting2.setMeetingDate(LocalDateTime.now().plusDays(2));

        meetingService.createMeeting(meeting1);
        meetingService.createMeeting(meeting2);

        // Act
        List<MeetingDTO> meetings = meetingService.getMeetingsByTeamId(teamId);

        // Assert
        assertThat(meetings).hasSize(2);
        assertThat(meetings).isSortedAccordingTo((m1, m2) -> 
            m2.getMeetingDate().compareTo(m1.getMeetingDate())
        );
    }

    @Test
    void updateMeeting_ShouldUpdateMeetingSuccessfully() {
        // Arrange
        MeetingDTO originalMeeting = meetingService.createMeeting(createTestMeetingDTO());
        
        MeetingDTO updateDTO = MeetingDTO.builder()
                .title("Updated Title")
                .description("Updated Description")
                .meetingDate(LocalDateTime.now().plusDays(3))
                .summary("Updated Summary")
                .build();

        // Act
        MeetingDTO updatedMeeting = meetingService.updateMeeting(originalMeeting.getId(), updateDTO);

        // Assert
        assertEquals("Updated Title", updatedMeeting.getTitle());
        assertEquals("Updated Description", updatedMeeting.getDescription());
        assertEquals("Updated Summary", updatedMeeting.getSummary());
    }

    @Test
    void deleteMeeting_ShouldDeleteMeetingSuccessfully() {
        // Arrange
        MeetingDTO meeting = meetingService.createMeeting(createTestMeetingDTO());

        // Act
        meetingService.deleteMeeting(meeting.getId());

        // Assert
        assertThat(meetingRepo.findById(meeting.getId())).isEmpty();
    }
} 
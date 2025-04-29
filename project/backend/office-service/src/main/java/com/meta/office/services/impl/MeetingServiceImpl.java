package com.meta.office.services.impl;

import com.meta.office.dtos.MeetingDTO;
import com.meta.office.entities.Meeting;
import com.meta.office.repositories.MeetingRepo;
import com.meta.office.services.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepo meetingRepo;
    private static final String MEETING_NOT_FOUND_MESSAGE = "Meeting not found with id: ";

    @Override
    public MeetingDTO createMeeting(MeetingDTO meetingDTO) {
        Meeting meeting = convertToEntity(meetingDTO);
        Meeting savedMeeting = meetingRepo.save(meeting);
        return convertToDTO(savedMeeting);
    }

    @Override
    public List<MeetingDTO> getMeetingsByTeamId(String teamId) {
        List<Meeting> meetings = meetingRepo.findByTeamIdOrderByMeetingDateDesc(teamId);
        return meetings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MeetingDTO getMeetingById(String id) {
        Meeting meeting = meetingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException(MEETING_NOT_FOUND_MESSAGE + id));
        return convertToDTO(meeting);
    }

    @Override
    public MeetingDTO updateMeeting(String id, MeetingDTO meetingDTO) {
        Meeting existingMeeting = meetingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException(MEETING_NOT_FOUND_MESSAGE + id));

        // Update existing meeting fields
        existingMeeting.setTitle(meetingDTO.getTitle());
        existingMeeting.setDescription(meetingDTO.getDescription());
        existingMeeting.setMeetingDate(meetingDTO.getMeetingDate());
        existingMeeting.setSummary(meetingDTO.getSummary());

        Meeting updatedMeeting = meetingRepo.save(existingMeeting);
        return convertToDTO(updatedMeeting);
    }

    @Override
    public void deleteMeeting(String id) {
        Meeting meeting = meetingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException(MEETING_NOT_FOUND_MESSAGE + id));
        meetingRepo.delete(meeting);
    }

    // Conversion methods
    private Meeting convertToEntity(MeetingDTO meetingDTO) {
        return new Meeting(
                meetingDTO.getId(),
                meetingDTO.getTeamId(),
                meetingDTO.getTitle(),
                meetingDTO.getDescription(),
                meetingDTO.getMeetingDate(),
                meetingDTO.getSummary()
        );
    }

    private MeetingDTO convertToDTO(Meeting meeting) {
        return MeetingDTO.builder()
                .id(meeting.getId())
                .teamId(meeting.getTeamId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .meetingDate(meeting.getMeetingDate())
                .summary(meeting.getSummary())
                .build();
    }
}
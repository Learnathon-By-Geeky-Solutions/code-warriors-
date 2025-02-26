package com.meta.office.services;

import com.meta.office.dtos.MeetingDTO;
import java.util.List;

public interface MeetingService {
    // Create a new meeting
    MeetingDTO createMeeting(MeetingDTO meetingDTO);

    // Get meetings by team ID, sorted by time
    List<MeetingDTO> getMeetingsByTeamId(String teamId);

    // Get meeting by its ID
    MeetingDTO getMeetingById(String id);

    // Update an existing meeting
    MeetingDTO updateMeeting(String id, MeetingDTO meetingDTO);

    // Delete a meeting
    void deleteMeeting(String id);
}
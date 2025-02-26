package com.meta.office.repositories;

import com.meta.office.entities.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepo extends JpaRepository<Meeting, String> {
    // Method to find meetings by team ID, sorted by meeting date in descending order
    List<Meeting> findByTeamIdOrderByMeetingDateDesc(String teamId);
}
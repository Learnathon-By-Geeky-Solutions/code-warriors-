package com.meta.office.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDTO {
    private String id;
    private String teamId;
    private String title;
    private String description;
    private LocalDateTime meetingDate;
    private String summary;
}
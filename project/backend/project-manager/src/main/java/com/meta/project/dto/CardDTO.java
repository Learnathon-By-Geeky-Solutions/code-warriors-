package com.meta.project.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CardDTO {
    private String id;

    private String title;

    private String description;

    private Integer order;

    private String listId;

    private String boardId;

    private String userId;
    private List<String> labels;
    private List<String> links;
    private Boolean isCompleted;
    private List<String> trackedTimes;
    private LocalDateTime dateTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<CommentDTO> comments;
    private List<TodoDTO> todos;
    private List<String> memberIds;

}
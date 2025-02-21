// src/main/java/com/meta/project/dto/UpdateCardDTO.java

package com.meta.project.dto;

import lombok.Data;

@Data
public class UpdateCardDTO {
    private String listId;
    private Integer order;
    private String boardId;  // Added to maintain consistency
}


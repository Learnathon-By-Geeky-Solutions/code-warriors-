package com.meta.project.dto;

import lombok.Data;
import java.util.Set;
// DTO Classes

@Data
public class BoardDTO {
    private String id;
    private String title;
    private String image;
    private String teamId;
    private Set<BoardListDTO> lists;
    private Set<CardDTO> cards;
}
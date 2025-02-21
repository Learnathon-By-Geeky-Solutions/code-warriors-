package com.meta.project.dto;

import lombok.Data;

@Data
public class TodoDTO {
    private String id;
    private String content;
    private Boolean completed;
}
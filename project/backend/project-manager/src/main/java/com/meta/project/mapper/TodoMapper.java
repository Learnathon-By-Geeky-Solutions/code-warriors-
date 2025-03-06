package com.meta.project.mapper;

import com.meta.project.dto.TodoDTO;
import com.meta.project.entity.Todo;
import org.springframework.stereotype.Component;

@Component
public class TodoMapper {


    public TodoDTO toDTO(Todo todo) {
        if (todo == null) {
            return null;
        }

        TodoDTO dto = new TodoDTO();
        dto.setId(todo.getId());
        dto.setContent(todo.getContent());
        dto.setCompleted(todo.getCompleted());

        return dto;
    }

    public Todo toEntity(TodoDTO todoDTO) {
        if (todoDTO == null) {
            return null;
        }

        Todo todo = new Todo();
        todo.setId(todoDTO.getId());
        todo.setContent(todoDTO.getContent());
        todo.setCompleted(todoDTO.getCompleted() != null ? todoDTO.getCompleted() : false);

        return todo;
    }
}
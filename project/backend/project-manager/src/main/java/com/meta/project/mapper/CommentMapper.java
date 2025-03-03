package com.meta.project.mapper;


import com.meta.project.dto.CommentDTO;
import com.meta.project.entity.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentDTO toDTO(Comment comment) {
        if (comment == null) return null;

        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setImage(comment.getImage());
        dto.setUserId(comment.getUserId());
        dto.setCardId(comment.getCard() != null ? comment.getCard().getId() : null);
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }

    public Comment toEntity(CommentDTO dto) {
        if (dto == null) return null;

        Comment comment = new Comment();
        comment.setId(dto.getId());
        comment.setText(dto.getText());
        comment.setImage(dto.getImage());
        comment.setUserId(dto.getUserId());
        // Set card reference in service layer
        comment.setCreatedAt(dto.getCreatedAt());
        comment.setUpdatedAt(dto.getUpdatedAt());
        return comment;
    }
}
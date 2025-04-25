package com.meta.project.mapper;

import com.meta.project.dto.CardDTO;
import com.meta.project.dto.CommentDTO;
import com.meta.project.dto.TodoDTO;
import com.meta.project.entity.Card;
import com.meta.project.entity.Comment;
import com.meta.project.entity.Todo;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CardMapper {

    private final CommentMapper commentMapper;
    private final TodoMapper todoMapper;

    public CardMapper(CommentMapper commentMapper, TodoMapper todoMapper) {
        this.commentMapper = commentMapper;
        this.todoMapper = todoMapper;
    }

    private List<CommentDTO> mapCommentsToDTOs(List<Comment> comments) {
        return comments != null ? comments.stream()
                .map(commentMapper::toDTO)
                .collect(Collectors.toList()) : new ArrayList<>();
    }

    private List<TodoDTO> mapTodosToDTOs(List<Todo> todos) {
        return todos != null ? todos.stream()
                .map(todoMapper::toDTO)
                .collect(Collectors.toList()) : new ArrayList<>();
    }

    public CardDTO toDTO(Card card) {
        if (card == null) {
            return null;
        }

        CardDTO dto = new CardDTO();
        dto.setId(card.getId());
        dto.setTitle(card.getTitle());
        dto.setDescription(card.getDescription());
        dto.setOrder(card.getOrder());
        dto.setUserId(card.getUserId());

        if (card.getBoard() != null) {
            dto.setBoardId(card.getBoard().getId());
        }

        if (card.getBoardList() != null) {
            dto.setListId(card.getBoardList().getId());
        }

        dto.setLabels(new ArrayList<>(card.getLabels()));
        dto.setLinks(new ArrayList<>(card.getLinks()));
        dto.setTrackedTimes(new ArrayList<>(card.getTrackedTimes()));
        dto.setIsCompleted(card.getIsCompleted());
        dto.setDateTo(card.getDateTo());
        dto.setUpdatedAt(card.getUpdatedAt());
        dto.setComments(mapCommentsToDTOs(card.getComments()));
        dto.setTodos(mapTodosToDTOs(card.getTodos()));
        dto.setMemberIds(new ArrayList<>(card.getMembers()));
        return dto;
    }

    private List<Comment> mapCommentDTOsToEntities(List<CommentDTO> commentDTOs, Card card) {
        return commentDTOs != null ? commentDTOs.stream()
                .map(dto -> {
                    Comment comment = commentMapper.toEntity(dto);
                    comment.setCard(card);
                    return comment;
                })
                .collect(Collectors.toList()) : new ArrayList<>();
    }

    private List<Todo> mapTodoDTOsToEntities(List<TodoDTO> todoDTOs, Card card) {
        return todoDTOs != null ? todoDTOs.stream()
                .map(dto -> {
                    Todo todo = todoMapper.toEntity(dto);
                    todo.setCard(card);
                    return todo;
                })
                .collect(Collectors.toList()) : new ArrayList<>();
    }

    public Card toEntity(CardDTO cardDTO) {
        if (cardDTO == null) {
            return null;
        }

        Card card = new Card();
        card.setId(cardDTO.getId());
        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());
        card.setOrder(cardDTO.getOrder());
        card.setUserId(cardDTO.getUserId());

        if (cardDTO.getLabels() != null) {
            card.setLabels(new HashSet<>(cardDTO.getLabels()));
        }

        if (cardDTO.getLinks() != null) {
            card.setLinks(new HashSet<>(cardDTO.getLinks()));
        }

        if (cardDTO.getTrackedTimes() != null) {
            card.setTrackedTimes(new HashSet<>(cardDTO.getTrackedTimes()));
        }

        card.setIsCompleted(cardDTO.getIsCompleted());
        card.setDateTo(cardDTO.getDateTo());

        card.setComments(mapCommentDTOsToEntities(cardDTO.getComments(), card));
        card.setTodos(mapTodoDTOsToEntities(cardDTO.getTodos(), card));

        if (cardDTO.getMemberIds() != null) {
            card.setMembers(new HashSet<>(cardDTO.getMemberIds()));
        }
        return card;
    }
}

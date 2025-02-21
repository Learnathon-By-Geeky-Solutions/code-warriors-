package com.meta.project.mapper;

import com.meta.project.dto.CardDTO;
import com.meta.project.dto.CommentDTO;
import com.meta.project.dto.TodoDTO;
import com.meta.project.entity.Board;
import com.meta.project.entity.BoardList;
import com.meta.project.entity.Card;
import com.meta.project.entity.Comment;
import com.meta.project.entity.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CardMapper {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private TodoMapper todoMapper;


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

        // Safely extract boardId and listId, handling potential nulls
        if (card.getBoard() != null) {
            dto.setBoardId(card.getBoard().getId());
        }

        if (card.getBoardList() != null) {
            dto.setListId(card.getBoardList().getId());
        }

        // Assuming userIds are managed via another relationship not shown in the Card entity
        // If such a relationship exists, map it accordingly
        // For example:
        // dto.setUserIds(card.getUsers().stream().map(User::getId).collect(Collectors.toList()));

        // Convert Sets to Lists for DTO
        dto.setLabels(new ArrayList<>(card.getLabels()));
        dto.setLinks(new ArrayList<>(card.getLinks()));
        dto.setTrackedTimes(new ArrayList<>(card.getTrackedTimes()));

        dto.setIsCompleted(card.getIsCompleted());
        dto.setDateTo(card.getDateTo());

        dto.setCreatedAt(card.getCreatedAt());
        dto.setUpdatedAt(card.getUpdatedAt());

        // Map comments
        if (card.getComments() != null && !card.getComments().isEmpty()) {
            List<CommentDTO> commentDTOs = card.getComments().stream()
                    .map(commentMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setComments(commentDTOs);
        }

        // Map todos
        if (card.getTodos() != null && !card.getTodos().isEmpty()) {
            List<TodoDTO> todoDTOs = card.getTodos().stream()
                    .map(todoMapper::toDTO)
                    .collect(Collectors.toList());
            dto.setTodos(todoDTOs);
        }
        dto.setMemberIds(new ArrayList<>(card.getMembers()));
        return dto;
    }

    public Card toEntity(CardDTO cardDTO) {
        if (cardDTO == null) {
            return null;
        }

        Card card = new Card();
        card.setId(cardDTO.getId()); // Ensure this is necessary; typically, IDs are generated

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

        // createdAt and updatedAt are managed by JPA lifecycle events
        // Typically, you shouldn't set them manually from DTO
        // If necessary, uncomment the following lines
        // card.setCreatedAt(cardDTO.getCreatedAt());
        // card.setUpdatedAt(cardDTO.getUpdatedAt());

        // Map comments
        if (cardDTO.getComments() != null && !cardDTO.getComments().isEmpty()) {
            List<Comment> comments = cardDTO.getComments().stream()
                    .map(commentMapper::toEntity)
                    .collect(Collectors.toList());
            // Set the card reference in each comment
            comments.forEach(comment -> comment.setCard(card));
            card.setComments(comments);
        }

        // Map todos
        if (cardDTO.getTodos() != null && !cardDTO.getTodos().isEmpty()) {
            List<Todo> todos = cardDTO.getTodos().stream()
                    .map(todoMapper::toEntity)
                    .collect(Collectors.toList());
            // Set the card reference in each todo
            todos.forEach(todo -> todo.setCard(card));
            card.setTodos(todos);
        }
        if (cardDTO.getMemberIds() != null) {
            card.setMembers(new HashSet<>(cardDTO.getMemberIds()));
        }
        return card;
    }
}
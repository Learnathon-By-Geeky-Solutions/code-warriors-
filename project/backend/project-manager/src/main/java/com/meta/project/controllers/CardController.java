package com.meta.project.controllers;

import com.meta.project.dto.CardDTO;
import com.meta.project.dto.CommentDTO;
import com.meta.project.dto.TodoDTO;
import com.meta.project.dto.UpdateCardDTO;
import com.meta.project.entity.Comment;
import com.meta.project.entity.Todo;
import com.meta.project.exception.ErrorResponsee;
import com.meta.project.mapper.CommentMapper;
import com.meta.project.mapper.TodoMapper;
import com.meta.project.service.CardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST controller for managing cards within a project management application.
 * This class handles various operations related to cards, such as creation, retrieval,
 * updates, deletion, and manipulation of card attributes like comments, todos, labels, etc.
 */
@RestController
@RequestMapping("/pm/v1/cards")
@Slf4j
@Validated
public class CardController {

    private final CardService cardService;
    private final CommentMapper commentMapper;
    private final TodoMapper todoMapper;

    /**
     * Constructor for CardController, injecting necessary services and mappers.
     *
     * @param cardService   Service for handling card-related business logic.
     * @param commentMapper Mapper for converting between Comment entities and DTOs.
     * @param todoMapper    Mapper for converting between Todo entities and DTOs.
     */
    public CardController(CardService cardService, CommentMapper commentMapper, TodoMapper todoMapper) {
        this.cardService = cardService;
        this.commentMapper = commentMapper;
        this.todoMapper = todoMapper;
    }

    /**
     * Creates a new card within a specified list and board.
     *
     * @param cardDTO The DTO containing card details.
     * @return A ResponseEntity containing the created CardDTO.
     */
    @PostMapping
    public ResponseEntity<CardDTO> createCard(@RequestBody @Validated CardDTO cardDTO) {
        CardDTO createdCard = cardService.createCard(cardDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCard);
    }

    /**
     * Adds members to a card.
     *
     * @param cardId  The ID of the card.
     * @param userIds List of user IDs to add as members.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/members/add")
    public ResponseEntity<CardDTO> addCardMembers(
            @PathVariable String cardId,
            @RequestBody List<String> userIds) {
        return ResponseEntity.ok(cardService.addCardMembers(cardId, userIds));
    }

    /**
     * Removes members from a card.
     *
     * @param cardId  The ID of the card.
     * @param userIds List of user IDs to remove.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PatchMapping("/{cardId}/members/remove")
    public ResponseEntity<CardDTO> removeCardMembers(
            @PathVariable String cardId,
            @RequestBody List<String> userIds) {
        return ResponseEntity.ok(cardService.removeCardMembers(cardId, userIds));
    }

    /**
     * Updates the tracked times for a card.
     *
     * @param cardId       The ID of the card.
     * @param trackedTimes Set of tracked times to update.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PatchMapping("/{cardId}/tracked-times")
    public ResponseEntity<CardDTO> updateCardTrackedTimes(
            @PathVariable String cardId,
            @RequestBody Set<String> trackedTimes) {
        return ResponseEntity.ok(cardService.updateCardTrackedTimes(cardId, trackedTimes));
    }

    /**
     * Removes links from a card.
     *
     * @param cardId         The ID of the card.
     * @param linksToRemove Set of links to remove.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @DeleteMapping("/{cardId}/links")
    public ResponseEntity<CardDTO> removeCardLinks(
            @PathVariable String cardId,
            @RequestBody Set<String> linksToRemove) {
        return ResponseEntity.ok(cardService.removeCardLinks(cardId, linksToRemove));
    }

    /**
     * Retrieves a card by its ID.
     *
     * @param id The ID of the card.
     * @return A ResponseEntity containing the CardDTO if found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getCard(@PathVariable String id) {
        return ResponseEntity.ok(cardService.getCardById(id));
    }

    /**
     * Updates an existing card.
     *
     * @param id      The ID of the card to update.
     * @param cardDTO The DTO containing updated card details.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CardDTO> updateCard(@PathVariable String id, @RequestBody @Validated CardDTO cardDTO) {
        cardDTO.setId(id); // Ensure the DTO has the correct ID
        return ResponseEntity.ok(cardService.updateCard(cardDTO));
    }

    /**
     * Deletes a card.
     *
     * @param cardId The ID of the card to delete.
     * @return A ResponseEntity with HTTP status OK.
     */
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable String cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves all cards within a specific list.
     *
     * @param listId The ID of the list.
     * @return A ResponseEntity containing a list of CardDTOs.
     */
    @GetMapping("/list/{listId}")
    public ResponseEntity<List<CardDTO>> getCardsByListId(@PathVariable String listId) {
        return ResponseEntity.ok(cardService.getCardsByBoardListId(listId));
    }

    /**
     * Copies a card within a board.
     *
     * @param cardId The ID of the card to copy.
     * @return A ResponseEntity containing the copied CardDTO.
     */
    @PostMapping("/copy/{cardId}")
    public ResponseEntity<CardDTO> copyCard(@PathVariable String cardId) {
        return ResponseEntity.ok(cardService.copyCard(cardId));
    }

    /**
     * Updates the labels of a card.
     *
     * @param cardId The ID of the card.
     * @param labels List of labels to update.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/labels")
    public ResponseEntity<CardDTO> updateCardLabel(@PathVariable String cardId, @RequestBody List<String> labels) {
        return ResponseEntity.ok(cardService.updateCardLabels(cardId, new HashSet<>(labels)));
    }

    /**
     * Updates the completion status of a card.
     *
     * @param cardId      The ID of the card.
     * @param isCompleted The new completion status.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/is-completed")
    public ResponseEntity<CardDTO> updateCardIsCompleted(@PathVariable String cardId, @RequestBody Boolean isCompleted) {
        return ResponseEntity.ok(cardService.updateCardIsCompleted(cardId, isCompleted));
    }

    private List<Comment> mapCommentDTOsToEntities(List<CommentDTO> commentDTOs) {
        return commentDTOs.stream()
                .map(commentMapper::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Updates the comments of a card.
     *
     * @param cardId   The ID of the card.
     * @param comments List of CommentDTOs to update.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/comments")
    public ResponseEntity<CardDTO> updateCardComments(@PathVariable String cardId, @RequestBody List<CommentDTO> comments) {
        return ResponseEntity.ok(cardService.updateCardComments(cardId, mapCommentDTOsToEntities(comments)));
    }

    private List<Todo> mapTodoDTOsToEntities(List<TodoDTO> todoDTOs) {
        return todoDTOs.stream()
                .map(todoMapper::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Updates the todos of a card.
     *
     * @param cardId The ID of the card.
     * @param todos  List of TodoDTOs to update.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/todos")
    public ResponseEntity<CardDTO> updateCardTodos(@PathVariable String cardId, @RequestBody List<TodoDTO> todos) {
        return ResponseEntity.ok(cardService.updateCardTodos(cardId, mapTodoDTOsToEntities(todos)));
    }

    /**
     * Updates the links of a card.
     *
     * @param cardId The ID of the card.
     * @param links  List of links to update.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/links")
    public ResponseEntity<CardDTO> updateCardLinks(@PathVariable String cardId, @RequestBody List<String> links) {
        return ResponseEntity.ok(cardService.updateCardLinks(cardId, new HashSet<>(links)));
    }

    /**
     * Updates the date of a card.
     *
     * @param cardId The ID of the card.
     * @param dateTo The new date in ISO format.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{cardId}/date")
    public ResponseEntity<CardDTO> updateCardDate(@PathVariable String cardId, @RequestBody String dateTo) {
        LocalDateTime parsedDate = dateTo != null ? LocalDateTime.parse(dateTo) : null;
        return ResponseEntity.ok(cardService.updateCardDate(cardId, parsedDate));
    }

    /**
     * Adds a comment to a card.
     *
     * @param cardId     The ID of the card.
     * @param commentDTO The DTO containing comment details.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PostMapping("/{cardId}/comments")
    public ResponseEntity<CardDTO> addCardComment(
            @PathVariable String cardId,
            @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(cardService.addCardComment(cardId, commentMapper.toEntity(commentDTO)));
    }

    /**
     * Removes a comment from a card.
     *
     * @param cardId    The ID of the card.
     * @param commentId The ID of the comment to remove.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @DeleteMapping("/{cardId}/comments/{commentId}")
    public ResponseEntity<CardDTO> removeCardComment(@PathVariable String cardId, @PathVariable String commentId) {
        return ResponseEntity.ok(cardService.removeCardComment(cardId, commentId));
    }

    /**
     * Reorders multiple cards based on the provided list of DTOs.
     *
     * @param cards A list of CardDTOs with updated order values.
     * @return A ResponseEntity with HTTP status.
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderCards(@RequestBody List<CardDTO> cards) {
        cardService.reorderCards(cards);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves all cards within a specific board.
     *
     * @param boardId The ID of the board.
     * @return A ResponseEntity containing a list of CardDTOs.
     */
    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<CardDTO>> getCardsByBoardId(@PathVariable String boardId) {
        return ResponseEntity.ok(cardService.getCardsByBoardId(boardId));
    }

    /**
     * Updates a card's position to a new list and order.
     *
     * @param cardId        The ID of the card to update.
     * @param updateCardDTO The DTO containing the new list ID and order.
     * @return A ResponseEntity with the result.
     */
    @PutMapping("/{cardId}/position")
    public ResponseEntity<?> updateCardPosition(
            @PathVariable String cardId,
            @RequestBody @Validated UpdateCardDTO updateCardDTO) {
        try {
            return ResponseEntity.ok(cardService.updateCardPosition(cardId, updateCardDTO));
        } catch (RuntimeException e) {
            log.error("Error updating card position for card ID {}: {}", cardId, e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponsee(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating card position for card ID {}: {}", cardId, e.getMessage());
            return ResponseEntity.internalServerError().body(new ErrorResponsee("An unexpected error occurred"));
        }
    }
}
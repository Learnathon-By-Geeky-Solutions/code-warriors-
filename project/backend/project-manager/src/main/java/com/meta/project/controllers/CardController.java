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
import java.util.Map;
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
     * @param cardService    Service for handling card-related business logic.
     * @param commentMapper  Mapper for converting between Comment entities and DTOs.
     * @param todoMapper     Mapper for converting between Todo entities and DTOs.
     */
    public CardController(CardService cardService, CommentMapper commentMapper, TodoMapper todoMapper) {
        this.cardService = cardService;
        this.commentMapper = commentMapper;
        this.todoMapper = todoMapper;
    }

    /**
     * Creates a new card within a specified list and board.
     *
     * @param request A map containing card details such as 'title', 'description', 'listId', 'boardId', etc.
     * @return A ResponseEntity containing the created CardDTO.
     */
    @PostMapping
    public ResponseEntity<CardDTO> createCard(@RequestBody Map<String, Object> request) {
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        String listId = (String) request.get("listId");
        String boardId = (String) request.get("boardId");
        String userId = (String) request.get("userId");
        List<String> labels = (List<String>) request.get("labels");
        List<String> links = (List<String>) request.get("links");
        Boolean isCompleted = (Boolean) request.get("isCompleted");
        String dateToStr = (String) request.get("dateTo");
        LocalDateTime dateTo = dateToStr != null ? LocalDateTime.parse(dateToStr) : null;

        // Basic validation
        if (title == null || listId == null || boardId == null) {
            throw new IllegalArgumentException("Title, List ID, and Board ID are required.");
        }

        CardDTO cardDTO = new CardDTO();
        cardDTO.setTitle(title);
        cardDTO.setDescription(description);
        cardDTO.setListId(listId);
        cardDTO.setBoardId(boardId);
        cardDTO.setUserId(userId);
        cardDTO.setLabels(labels != null ? labels : List.of());
        cardDTO.setLinks(links != null ? links : List.of());
        cardDTO.setIsCompleted(isCompleted);  // Removed unnecessary `false` defaulting (L78)
        cardDTO.setDateTo(dateTo);

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
        CardDTO updatedCard = cardService.addCardMembers(cardId, userIds);
        return ResponseEntity.ok(updatedCard);
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
        CardDTO updatedCard = cardService.removeCardMembers(cardId, userIds);
        return ResponseEntity.ok(updatedCard);
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
        CardDTO updatedCard = cardService.updateCardTrackedTimes(cardId, trackedTimes);
        return ResponseEntity.ok(updatedCard);
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
        CardDTO updatedCard = cardService.removeCardLinks(cardId, linksToRemove);
        return ResponseEntity.ok(updatedCard);
    }


    /**
     * Retrieves a card by its ID.
     *
     * @param id The ID of the card.
     * @return A ResponseEntity containing the CardDTO if found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getCard(@PathVariable String id) {
        CardDTO card = cardService.getCardById(id);
        return ResponseEntity.ok(card);
    }

    /**
     * Updates an existing card.
     *
     * @param id      The ID of the card to update.
     * @param cardDTO The DTO containing updated card details.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CardDTO> updateCard(@PathVariable String id, @RequestBody CardDTO cardDTO) {
        cardDTO.setId(id); // Ensure the DTO has the correct ID
        CardDTO updatedCard = cardService.updateCard(cardDTO);
        return ResponseEntity.ok(updatedCard);
    }

    /**
     * Deletes a card.
     *
     * @param boardId The ID of the board containing the card.
     * @param cardId  The ID of the card to delete.
     * @return A ResponseEntity with HTTP status OK.
     */

    @DeleteMapping("/{boardId}/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable String boardId, @PathVariable String cardId) {
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
        List<CardDTO> cards = cardService.getCardsByBoardListId(listId);
        return ResponseEntity.ok(cards);
    }

    /**
     * Copies a card within a board.
     *
     * @param boardId The ID of the board.
     * @param cardId  The ID of the card to copy.
     * @return A ResponseEntity containing the copied CardDTO.
     */
    @PostMapping("/{boardId}/copy")
    public ResponseEntity<CardDTO> copyCard(@PathVariable String boardId, @RequestBody String cardId) {
        CardDTO copiedCard = cardService.copyCard(cardId);
        return ResponseEntity.ok(copiedCard);
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
        Set<String> labelSet = new HashSet<>(labels);
        CardDTO updatedCard = cardService.updateCardLabels(cardId, labelSet);
        return ResponseEntity.ok(updatedCard);
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
        CardDTO updatedCard = cardService.updateCardIsCompleted(cardId, isCompleted);
        return ResponseEntity.ok(updatedCard);
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
        List<Comment> commentEntities = comments.stream()
                .map(commentMapper::toEntity)
                .collect(Collectors.toList());

        CardDTO updatedCard = cardService.updateCardComments(cardId, commentEntities);
        return ResponseEntity.ok(updatedCard);
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
        List<Todo> todoEntities = todos.stream()
                .map(todoMapper::toEntity)
                .collect(Collectors.toList());

        CardDTO updatedCard = cardService.updateCardTodos(cardId, todoEntities);
        return ResponseEntity.ok(updatedCard);
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
        // Convert List to Set before passing to service
        Set<String> linkSet = new HashSet<>(links);
        CardDTO updatedCard = cardService.updateCardLinks(cardId, linkSet);
        return ResponseEntity.ok(updatedCard);
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
        CardDTO updatedCard = cardService.updateCardDate(cardId, parsedDate);
        return ResponseEntity.ok(updatedCard);
    }

    /**
     * Adds a comment to a card.
     *
     * @param cardId  The ID of the card.
     * @param commentDTO The DTO containing comment details.
     * @return A ResponseEntity containing the updated CardDTO.
     */
    @PostMapping("/{cardId}/comments")
    public ResponseEntity<CardDTO> addCardComment(
            @PathVariable String cardId,
            @RequestBody CommentDTO commentDTO) {
        Comment comment = commentMapper.toEntity(commentDTO);
        CardDTO updatedCard = cardService.addCardComment(cardId, comment);
        return ResponseEntity.ok(updatedCard);
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
        CardDTO updatedCard = cardService.removeCardComment(cardId, commentId);
        return ResponseEntity.ok(updatedCard);
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
        List<CardDTO> cards = cardService.getCardsByBoardId(boardId);
        return ResponseEntity.ok(cards);
    }


    // For updating card position/list
    @PutMapping("/{cardId}/position")
    public ResponseEntity<ErrorResponsee> updateCardPosition(
            @PathVariable String cardId,
            @RequestBody UpdateCardDTO updateCardDTO) {
        try {
            CardDTO updatedCard = cardService.updateCardPosition(cardId, updateCardDTO);
            return ResponseEntity.ok().body(new ErrorResponsee(updatedCard.toString()));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponsee(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponsee("An unexpected error occurred"));
        }
    }

}
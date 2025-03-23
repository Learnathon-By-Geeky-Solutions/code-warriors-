package com.meta.project.controllers;

import com.meta.project.dto.CardDTO;
import com.meta.project.dto.CommentDTO;
import com.meta.project.dto.TodoDTO;
import com.meta.project.dto.UpdateCardDTO;
import com.meta.project.entity.Comment;
import com.meta.project.entity.Todo;
import com.meta.project.mapper.CommentMapper;
import com.meta.project.mapper.TodoMapper;
import com.meta.project.service.CardService;
import lombok.RequiredArgsConstructor;
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
 */
@RestController
@RequestMapping("/pm/v1/cards")
@Slf4j
@Validated
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final CommentMapper commentMapper;
    private final TodoMapper todoMapper;

    @PostMapping
    public ResponseEntity<CardDTO> createCard(@RequestBody @Validated CardDTO cardDTO) {
        CardDTO createdCard = cardService.createCard(cardDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCard);
    }

    @PutMapping("/{cardId}/members/add")
    public ResponseEntity<CardDTO> addCardMembers(
            @PathVariable String cardId,
            @RequestBody List<String> userIds) {
        return ResponseEntity.ok(cardService.addCardMembers(cardId, userIds));
    }

    @PatchMapping("/{cardId}/members/remove")
    public ResponseEntity<CardDTO> removeCardMembers(
            @PathVariable String cardId,
            @RequestBody List<String> userIds) {
        return ResponseEntity.ok(cardService.removeCardMembers(cardId, userIds));
    }

    @PatchMapping("/{cardId}/tracked-times")
    public ResponseEntity<CardDTO> updateCardTrackedTimes(
            @PathVariable String cardId,
            @RequestBody Set<String> trackedTimes) {
        return ResponseEntity.ok(cardService.updateCardTrackedTimes(cardId, trackedTimes));
    }

    @DeleteMapping("/{cardId}/links")
    public ResponseEntity<CardDTO> removeCardLinks(
            @PathVariable String cardId,
            @RequestBody Set<String> linksToRemove) {
        return ResponseEntity.ok(cardService.removeCardLinks(cardId, linksToRemove));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getCard(@PathVariable String id) {
        return ResponseEntity.ok(cardService.getCardById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardDTO> updateCard(
            @PathVariable String id,
            @RequestBody @Validated CardDTO cardDTO) {
        cardDTO.setId(id);
        return ResponseEntity.ok(cardService.updateCard(cardDTO));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable String cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/list/{listId}")
    public ResponseEntity<List<CardDTO>> getCardsByListId(@PathVariable String listId) {
        return ResponseEntity.ok(cardService.getCardsByBoardListId(listId));
    }

    @PostMapping("/copy/{cardId}")
    public ResponseEntity<CardDTO> copyCard(@PathVariable String cardId) {
        return ResponseEntity.ok(cardService.copyCard(cardId));
    }

    @PutMapping("/{cardId}/labels")
    public ResponseEntity<CardDTO> updateCardLabel(
            @PathVariable String cardId,
            @RequestBody List<String> labels) {
        return ResponseEntity.ok(cardService.updateCardLabels(cardId, new HashSet<>(labels)));
    }

    @PutMapping("/{cardId}/is-completed")
    public ResponseEntity<CardDTO> updateCardIsCompleted(
            @PathVariable String cardId,
            @RequestBody Boolean isCompleted) {
        return ResponseEntity.ok(cardService.updateCardIsCompleted(cardId, isCompleted));
    }

    @PutMapping("/{cardId}/comments")
    public ResponseEntity<CardDTO> updateCardComments(
            @PathVariable String cardId,
            @RequestBody List<CommentDTO> comments) {
        List<Comment> commentEntities = comments.stream()
                .map(commentMapper::toEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cardService.updateCardComments(cardId, commentEntities));
    }

    @PutMapping("/{cardId}/todos")
    public ResponseEntity<CardDTO> updateCardTodos(
            @PathVariable String cardId,
            @RequestBody List<TodoDTO> todos) {
        List<Todo> todoEntities = todos.stream()
                .map(todoMapper::toEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cardService.updateCardTodos(cardId, todoEntities));
    }

    @PutMapping("/{cardId}/links")
    public ResponseEntity<CardDTO> updateCardLinks(
            @PathVariable String cardId,
            @RequestBody List<String> links) {
        return ResponseEntity.ok(cardService.updateCardLinks(cardId, new HashSet<>(links)));
    }

    @PutMapping("/{cardId}/date")
    public ResponseEntity<CardDTO> updateCardDate(
            @PathVariable String cardId,
            @RequestBody String dateTo) {
        LocalDateTime parsedDate = dateTo != null ? LocalDateTime.parse(dateTo) : null;
        return ResponseEntity.ok(cardService.updateCardDate(cardId, parsedDate));
    }

    @PostMapping("/{cardId}/comments")
    public ResponseEntity<CardDTO> addCardComment(
            @PathVariable String cardId,
            @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(cardService.addCardComment(cardId, commentMapper.toEntity(commentDTO)));
    }

    @DeleteMapping("/{cardId}/comments/{commentId}")
    public ResponseEntity<CardDTO> removeCardComment(
            @PathVariable String cardId,
            @PathVariable String commentId) {
        return ResponseEntity.ok(cardService.removeCardComment(cardId, commentId));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderCards(@RequestBody List<CardDTO> cards) {
        cardService.reorderCards(cards);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<CardDTO>> getCardsByBoardId(@PathVariable String boardId) {
        return ResponseEntity.ok(cardService.getCardsByBoardId(boardId));
    }

    @PutMapping("/{cardId}/position")
    public ResponseEntity<CardDTO> updateCardPosition(
            @PathVariable String cardId,
            @RequestBody @Validated UpdateCardDTO updateCardDTO) {
        return ResponseEntity.ok(cardService.updateCardPosition(cardId, updateCardDTO));
    }
}
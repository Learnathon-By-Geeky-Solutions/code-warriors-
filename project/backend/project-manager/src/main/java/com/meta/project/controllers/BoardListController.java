package com.meta.project.controllers;



import com.meta.project.dto.BoardListDTO;
import com.meta.project.service.BoardListService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pm/v1/lists")
@Slf4j
@Validated
public class BoardListController {

    private BoardListService boardListService;

    public BoardListController(BoardListService boardListService) {
        this.boardListService = boardListService;
    }
    /**
     * Creates a new list within a specified board.
     *
     * @param request A map containing 'title' and 'boardId'.
     * @return A ResponseEntity containing the created BoardListDTO.
     */
    @PostMapping
    public ResponseEntity<BoardListDTO> createList(@RequestBody Map<String, Object> request) {
        String title = (String) request.get("title");
        String boardId = (String) request.get("boardId");

        // Basic validation
        if (title == null || boardId == null) {
            throw new IllegalArgumentException("Title and Board ID are required.");
        }

        BoardListDTO createdList = boardListService.createList(title, boardId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdList);
    }

    /**
     * Retrieves a list by its ID.
     *
     * @param id The ID of the list.
     * @return A ResponseEntity containing the BoardListDTO if found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BoardListDTO> getList(@PathVariable String id) {
        BoardListDTO list = boardListService.getBoardListById(id);
        return ResponseEntity.ok(list);
    }

    /**
     * Reorders multiple lists based on the provided list of DTOs.
     *
     * @param lists A list of BoardListDTOs with updated order values.
     * @return A ResponseEntity with HTTP status.
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderLists(@RequestBody List<BoardListDTO> lists) {
        boardListService.reorderLists(lists);
        return ResponseEntity.ok().build();
    }

    /**
     * Updates an existing list's title and associated board.
     *
     * @param id      The ID of the list to update.
     * @param request A map containing 'title' and 'boardId'.
     * @return A ResponseEntity containing the updated BoardListDTO if successful.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BoardListDTO> updateList(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        String title = (String) request.get("title");
        String boardId = (String) request.get("boardId");

        // Basic validation
        if (title == null || boardId == null) {
            throw new IllegalArgumentException("Title and Board ID are required.");
        }

        BoardListDTO updatedList = boardListService.updateList(id, title, boardId);
        return ResponseEntity.ok(updatedList);
    }

    /**
     * Deletes a list by its ID.
     *
     * @param id The ID of the list to delete.
     * @return A ResponseEntity with HTTP status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable String id) {
        boardListService.deleteList(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves all lists associated with a specific board.
     *
     * @param boardId The ID of the board.
     * @return A ResponseEntity containing a list of BoardListDTOs.
     */
    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<BoardListDTO>> getListsByBoardId(@PathVariable String boardId) {
        List<BoardListDTO> lists = boardListService.getLists(boardId);
        return ResponseEntity.ok(lists);
    }

    /**
     * Retrieves the number of cards within a specific list.
     *
     * @param listId The ID of the list.
     * @return A ResponseEntity containing a map with the count.
     */
    @GetMapping("/{listId}/length")
    public ResponseEntity<Map<String, Integer>> getCardCountByListId(@PathVariable String listId) {
        int count = boardListService.getCardCountByListId(listId);
        Map<String, Integer> response = Map.of("length", count);
        return ResponseEntity.ok(response);
    }
}

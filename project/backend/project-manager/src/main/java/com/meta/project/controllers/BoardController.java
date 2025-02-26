package com.meta.project.controllers;


import com.meta.project.dto.BoardDTO;
import com.meta.project.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/pm/v1/boards")
@Validated
public class BoardController {

    @Autowired
    private BoardService boardService;


    // Get all boards
    @GetMapping
    public ResponseEntity<List<BoardDTO>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }


    // get boards by team id

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<BoardDTO>> getBoardsByTeamId(@PathVariable String teamId) {
        return ResponseEntity.ok(boardService.getBoardsByTeamId(teamId));
    }



    /**
     * Creates a new board.
     *
     * @param boardDTO The DTO containing board details.
     * @return A ResponseEntity containing the created BoardDTO.
     */
    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(@RequestBody BoardDTO boardDTO) {
        BoardDTO createdBoard = boardService.createBoard(boardDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
    }

    /**
     * Deletes a board by its ID.
     *
     * @param id The ID of the board to delete.
     * @return A ResponseEntity with HTTP status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves a board by its ID.
     *
     * @param id The ID of the board.
     * @return A ResponseEntity containing the BoardDTO if found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBoardById(@PathVariable String id) {
        try {
            return boardService.getBoardById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving board: " + e.getMessage());
        }
    }




    // Add more endpoints as needed
}

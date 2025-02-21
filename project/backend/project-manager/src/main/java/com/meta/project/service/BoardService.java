package com.meta.project.service;

import com.meta.project.dto.BoardDTO;
import com.meta.project.entity.Board;
import com.meta.project.mapper.BoardMapper;
import com.meta.project.repository.BoardListRepository;
import com.meta.project.repository.BoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardMapper boardMapper;

    @Autowired
    private BoardListRepository boardListRepository;

    // Get all boards

    public List<BoardDTO> getAllBoards() {
        return boardRepository.findAll().stream()
                .map(boardMapper::toDTO)
                .collect(Collectors.toList());
    }

    // get boards by team id

    public List<BoardDTO> getBoardsByTeamId(String teamId) {
        return boardRepository.getBoardsByTeamId(teamId).stream()
                .map(boardMapper::toDTO)
                .collect(Collectors.toList());
    }




    /**
     * Creates a new board.
     *
     * @param boardDTO The DTO containing board details.
     * @return The created BoardDTO.
     */
    public BoardDTO createBoard(BoardDTO boardDTO) {
        Board board = boardMapper.toEntity(boardDTO);
        return boardMapper.toDTO(boardRepository.save(board));
    }

    /**
     * Retrieves a board by its ID.
     *
     * @param id The ID of the board.
     * @return An Optional containing the BoardDTO if found.
     */
    public Optional<BoardDTO> getBoardById(String id) {
        return boardRepository.findById(id)
                .map(boardMapper::toDTO);
    }

    /**
     * Deletes a board by its ID.
     *
     * @param id The ID of the board to delete.
     */
    public void deleteBoard(String id) {
        if (!boardRepository.existsById(id)) {
            throw new RuntimeException("Board not found with ID: " + id);
        }
        boardRepository.deleteById(id);
    }



}
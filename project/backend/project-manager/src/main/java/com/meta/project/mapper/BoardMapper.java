package com.meta.project.mapper;

import com.meta.project.dto.BoardDTO;
import com.meta.project.dto.BoardListDTO;
import com.meta.project.entity.Board;
import com.meta.project.entity.BoardList;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;
// Mapper Classes
@Component
public class BoardMapper {

    public BoardDTO toDTO(Board board) {
        BoardDTO dto = new BoardDTO();
        dto.setId(board.getId());
        dto.setTitle(board.getTitle());
        dto.setImage(board.getImage());
        dto.setTeamId(board.getTeamId());
        dto.setLists(
                board.getLists().stream()
                        .map(this::toDTO)
                        .collect(Collectors.toSet())
        );
        return dto;
    }

    public Board toEntity(BoardDTO boardDTO) {
        Board board = new Board();
        board.setId(boardDTO.getId());
        board.setTitle(boardDTO.getTitle());
        board.setImage(boardDTO.getImage());
        board.setTeamId(boardDTO.getTeamId());
        return board;
    }

    public BoardListDTO toDTO(BoardList boardList) {
        BoardListDTO dto = new BoardListDTO();
        dto.setId(String.valueOf(boardList.getId())); // Convert Long to String
        dto.setTitle(boardList.getTitle());
        dto.setOrder(boardList.getOrder());
        dto.setBoardId(String.valueOf(boardList.getBoard().getId())); // Convert Long to String
        return dto;
    }

    public BoardList toEntity(BoardListDTO boardListDTO) {
        BoardList boardList = new BoardList();
        boardList.setId(boardListDTO.getId()); // Convert String to Long
        boardList.setTitle(boardListDTO.getTitle());
        boardList.setOrder(boardListDTO.getOrder());
        return boardList;
    }
}
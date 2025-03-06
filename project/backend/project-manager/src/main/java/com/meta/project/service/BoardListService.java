package com.meta.project.service;

import com.meta.project.dto.BoardListDTO;
import com.meta.project.entity.Board;
import com.meta.project.entity.BoardList;
import com.meta.project.exception.ResourceNotFoundException;
import com.meta.project.exception.ServiceException;
import com.meta.project.mapper.BoardListMapper;
import com.meta.project.repository.BoardListRepository;
import com.meta.project.repository.BoardRepository;
import com.meta.project.repository.CardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BoardListService {

    private static final String LIST_NOT_FOUND = "List not found with ID: ";

    private final BoardListRepository boardListRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final BoardListMapper boardListMapper;

    public BoardListService(BoardListRepository boardListRepository, BoardRepository boardRepository,
                            CardRepository cardRepository, BoardListMapper boardListMapper) {
        this.boardListRepository = boardListRepository;
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
        this.boardListMapper = boardListMapper;
    }

    public List<BoardListDTO> getLists(String boardId) {
        List<BoardList> lists = boardListRepository.findByBoardIdOrderByOrderAsc(boardId);
        return lists.stream().map(boardListMapper::toDTO).collect(Collectors.toList());
    }

    public BoardListDTO createList(String title, String boardId) {
        try {
            Board board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Board not found with ID: " + boardId));

            Integer maxOrder = boardListRepository.findMaxOrderByBoardId(boardId).orElse(0);

            BoardList list = new BoardList();
            list.setTitle(title);
            list.setBoard(board);
            list.setOrder(maxOrder + 1);

            BoardList savedList = boardListRepository.save(list);
            return boardListMapper.toDTO(savedList);
        } catch (Exception e) {
            log.error("Error creating list: ", e);
            throw new ServiceException("Failed to create list.", e);
        }
    }

    public BoardListDTO updateList(String id, String title, String boardId) {
        try {
            BoardList list = boardListRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(LIST_NOT_FOUND + id));

            Board board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Board not found with ID: " + boardId));

            list.setTitle(title);
            list.setBoard(board);

            BoardList updatedList = boardListRepository.save(list);
            return boardListMapper.toDTO(updatedList);
        } catch (Exception e) {
            log.error("Error updating list: ", e);
            throw new ServiceException("Failed to update list.", e);
        }
    }

    public void deleteList(String id) {
        try {
            if (!boardListRepository.existsById(id)) {
                throw new ResourceNotFoundException(LIST_NOT_FOUND + id);
            }
            boardListRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Error deleting list: ", e);
            throw new ServiceException("Failed to delete list.", e);
        }
    }

    public int getCardCountByListId(String listId) {
        try {
            return cardRepository.countByBoardListId(listId);
        } catch (Exception e) {
            log.error("Error counting cards in list ID {}: ", listId, e);
            throw new ServiceException("Failed to count cards in list.", e);
        }
    }

    public void reorderLists(List<BoardListDTO> lists) {
        try {
            for (BoardListDTO dto : lists) {
                BoardList existingList = boardListRepository.findById(dto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException(LIST_NOT_FOUND + dto.getId()));
                existingList.setOrder(dto.getOrder());
                boardListRepository.save(existingList);
            }
        } catch (Exception e) {
            log.error("Error reordering lists: ", e);
            throw new ServiceException("Failed to reorder lists.", e);
        }
    }

    public BoardListDTO getBoardListById(String id) {
        try {
            BoardList list = boardListRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(LIST_NOT_FOUND + id));
            return boardListMapper.toDTO(list);
        } catch (Exception e) {
            log.error("Error retrieving list by ID: ", e);
            throw new ServiceException("Failed to retrieve list.", e);
        }
    }
}

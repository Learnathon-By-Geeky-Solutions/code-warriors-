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

/**
 * Service class for managing BoardLists.
 * This class provides methods to perform CRUD operations on BoardLists,
 * as well as other business logic related to lists within a board.
 */
@Service
@Slf4j
public class BoardListService {

    private static final String LIST_NOT_FOUND = "List not found with ID: ";
    private static final String BOARD_NOT_FOUND = "Board not found with ID: ";

    private final BoardListRepository boardListRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final BoardListMapper boardListMapper;

    /**
     * Constructor for BoardListService.
     *
     * @param boardListRepository Repository for accessing BoardList entities.
     * @param boardRepository     Repository for accessing Board entities.
     * @param cardRepository      Repository for accessing Card entities.
     * @param boardListMapper     Mapper for converting between BoardList entities and DTOs.
     */
    public BoardListService(BoardListRepository boardListRepository, BoardRepository boardRepository,
                            CardRepository cardRepository, BoardListMapper boardListMapper) {
        this.boardListRepository = boardListRepository;
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
        this.boardListMapper = boardListMapper;
    }

    private Board getBoardById(String boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException(BOARD_NOT_FOUND + boardId));
    }

    private BoardList getBoardListEntityById(String id) {
        return boardListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(LIST_NOT_FOUND + id));
    }

    /**
     * Retrieves all lists associated with a given board ID, ordered by their order.
     *
     * @param boardId The ID of the board.
     * @return A list of BoardListDTOs.
     */
    public List<BoardListDTO> getLists(String boardId) {
        List<BoardList> lists = boardListRepository.findByBoardIdOrderByOrderAsc(boardId);
        return lists.stream().map(boardListMapper::toDTO).collect(Collectors.toList());
    }

    private BoardList createAndSaveNewList(String title, Board board) {
        Integer maxOrder = boardListRepository.findMaxOrderByBoardId(board.getId()).orElse(0);
        BoardList list = new BoardList();
        list.setTitle(title);
        list.setBoard(board);
        list.setOrder(maxOrder + 1);
        return boardListRepository.save(list);
    }

    /**
     * Creates a new list within a specified board.
     *
     * @param title   The title of the new list.
     * @param boardId The ID of the board to which the list will be added.
     * @return The created BoardListDTO.
     * @throws ServiceException If an error occurs during list creation.
     */
    public BoardListDTO createList(String title, String boardId) {
        try {
            Board board = getBoardById(boardId);
            BoardList savedList = createAndSaveNewList(title, board);
            return boardListMapper.toDTO(savedList);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating list: ", e);
            throw new ServiceException("Failed to create list.", e);
        }
    }

    private BoardList updateAndSaveList(BoardList list, String title, Board board) {
        list.setTitle(title);
        list.setBoard(board);
        return boardListRepository.save(list);
    }

    /**
     * Updates an existing list with a new title and/or board association.
     *
     * @param id      The ID of the list to update.
     * @param title   The new title of the list.
     * @param boardId The ID of the board to which the list will be associated.
     * @return The updated BoardListDTO.
     * @throws ServiceException If an error occurs during list update.
     */
    public BoardListDTO updateList(String id, String title, String boardId) {
        try {
            BoardList list = getBoardListEntityById(id);
            Board board = getBoardById(boardId);
            BoardList updatedList = updateAndSaveList(list, title, board);
            return boardListMapper.toDTO(updatedList);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating list: ", e);
            throw new ServiceException("Failed to update list.", e);
        }
    }

    private void deleteBoardListById(String id) {
        if (!boardListRepository.existsById(id)) {
            throw new ResourceNotFoundException(LIST_NOT_FOUND + id);
        }
        boardListRepository.deleteById(id);
    }

    /**
     * Deletes a list by its ID.
     *
     * @param id The ID of the list to delete.
     * @throws ServiceException If an error occurs during list deletion.
     */
    public void deleteList(String id) {
        try {
            deleteBoardListById(id);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting list: ", e);
            throw new ServiceException("Failed to delete list.", e);
        }
    }

    /**
     * Retrieves the count of cards within a specific list.
     *
     * @param listId The ID of the list.
     * @return The number of cards in the list.
     * @throws ServiceException If an error occurs while counting cards.
     */
    public int getCardCountByListId(String listId) {
        try {
            return cardRepository.countByBoardListId(listId);
        } catch (Exception e) {
            log.error("Error counting cards in list ID {}: ", listId, e);
            throw new ServiceException("Failed to count cards in list.", e);
        }
    }

    private void updateListOrder(BoardList list, int order) {
        list.setOrder(order);
        boardListRepository.save(list);
    }

    /**
     * Reorders a list of BoardLists based on the provided DTOs.
     *
     * @param lists A list of BoardListDTOs with updated order values.
     * @throws ServiceException If an error occurs during reordering.
     */
    public void reorderLists(List<BoardListDTO> lists) {
        try {
            for (BoardListDTO dto : lists) {
                BoardList existingList = getBoardListEntityById(dto.getId());
                updateListOrder(existingList, dto.getOrder());
            }
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error reordering lists: ", e);
            throw new ServiceException("Failed to reorder lists.", e);
        }
    }

    /**
     * Retrieves a BoardList by its ID.
     *
     * @param id The ID of the list.
     * @return The BoardListDTO representing the list.
     * @throws ServiceException If an error occurs while retrieving the list.
     */
    public BoardListDTO getBoardListById(String id) {
        try {
            BoardList list = getBoardListEntityById(id);
            return boardListMapper.toDTO(list);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving list by ID: ", e);
            throw new ServiceException("Failed to retrieve list.", e);
        }
    }
}
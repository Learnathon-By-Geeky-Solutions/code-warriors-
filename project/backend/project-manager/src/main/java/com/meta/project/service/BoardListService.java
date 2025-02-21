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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BoardListService {

    @Autowired
    private BoardListRepository boardListRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private CardRepository cardRepository; // Inject CardRepository

    @Autowired
    private BoardListMapper boardListMapper;

    /**
     * Retrieves all lists associated with a specific board, ordered by the 'order' field.
     *
     * @param boardId The ID of the board.
     * @return A list of BoardListDTOs.
     */
    public List<BoardListDTO> getLists(String boardId) {
        List<BoardList> lists = boardListRepository.findByBoardIdOrderByOrderAsc(boardId);
        return lists.stream()
                .map(boardListMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new list within a specified board.
     *
     * @param title   The title of the new list.
     * @param boardId The ID of the board where the list will be created.
     * @return The created BoardListDTO.
     */
    public BoardListDTO createList(String title, String boardId) {
        try {
            Board board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Board not found with ID: " + boardId));

            Integer maxOrder = boardListRepository.findMaxOrderByBoardId(boardId)
                    .orElse(0);

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

    /**
     * Updates an existing list's title and associated board.
     *
     * @param id      The ID of the list to update.
     * @param title   The new title for the list.
     * @param boardId The new board ID to associate with the list.
     * @return The updated BoardListDTO.
     */
    public BoardListDTO updateList(String id, String title, String boardId) {
        try {
            BoardList list = boardListRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("List not found with ID: " + id));

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

    /**
     * Deletes a list by its ID.
     *
     * @param id The ID of the list to delete.
     */
    public void deleteList(String id) {
        try {
            if (!boardListRepository.existsById(id)) {
                throw new ResourceNotFoundException("List not found with ID: " + id);
            }
            boardListRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Error deleting list: ", e);
            throw new ServiceException("Failed to delete list.", e);
        }
    }

    /**
     * Retrieves the number of cards within a specific list.
     *
     * @param listId The ID of the list.
     * @return The count of cards in the list.
     */
    public int getCardCountByListId(String listId) {
        try {
            return cardRepository.countByBoardListId(listId);
        } catch (Exception e) {
            log.error("Error counting cards in list ID {}: ", listId, e);
            throw new ServiceException("Failed to count cards in list.", e);
        }
    }

    /**
     * Reorders multiple lists based on the provided list of DTOs.
     *
     * @param lists A list of BoardListDTOs with updated order values.
     */
    public void reorderLists(List<BoardListDTO> lists) {
        try {
            for (BoardListDTO dto : lists) {
                BoardList existingList = boardListRepository.findById(dto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("List not found with ID: " + dto.getId()));
                existingList.setOrder(dto.getOrder());
                boardListRepository.save(existingList);
            }
        } catch (Exception e) {
            log.error("Error reordering lists: ", e);
            throw new ServiceException("Failed to reorder lists.", e);
        }
    }

    /**
     * Retrieves a specific list by its ID.
     *
     * @param id The ID of the list.
     * @return The BoardListDTO if found.
     */
    public BoardListDTO getBoardListById(String id) {
        try {
            BoardList list = boardListRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("List not found with ID: " + id));
            return boardListMapper.toDTO(list);
        } catch (Exception e) {
            log.error("Error retrieving list by ID: ", e);
            throw new ServiceException("Failed to retrieve list.", e);
        }
    }
}
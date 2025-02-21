package com.meta.project.service;

import com.meta.project.dto.CardDTO;
import com.meta.project.dto.UpdateCardDTO;
import com.meta.project.entity.Board;
import com.meta.project.entity.BoardList;
import com.meta.project.entity.Card;
import com.meta.project.entity.Comment;
import com.meta.project.entity.Todo;
import com.meta.project.exception.ResourceNotFoundException;
import com.meta.project.exception.ServiceException;
import com.meta.project.mapper.CardMapper;
import com.meta.project.repository.BoardListRepository;
import com.meta.project.repository.BoardRepository;
import com.meta.project.repository.CardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class CardService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardListRepository boardListRepository;

    @Autowired
    private CardMapper cardMapper;

    /**
     * Creates a new card.
     *
     * @param cardDTO The DTO containing card details.
     * @return The created CardDTO.
     */
    public CardDTO createCard(CardDTO cardDTO) {
        try {
            // Map DTO to Entity
            Card card = cardMapper.toEntity(cardDTO);

            // Fetch and set associated Board and BoardList
            Board board = boardRepository.getBoardById(cardDTO.getBoardId());
            BoardList boardList = getBoardListById(cardDTO.getListId());

            card.setBoard(board);
            card.setBoardList(boardList);

            // Determine the new order within the board list
            Integer maxOrder = cardRepository.findMaxOrderByListId(boardList.getId()).orElse(0);
            card.setOrder(maxOrder + 1);

            // Initialize collections if they are null (should already be handled by entity defaults)
            if (card.getLabels() == null) {
                card.setLabels(new HashSet<>());
            }
            if (card.getLinks() == null) {
                card.setLinks(new HashSet<>());
            }
            if (card.getTrackedTimes() == null) {
                card.setTrackedTimes(new HashSet<>());
            }
            if (card.getComments() == null) {
                card.setComments(new java.util.ArrayList<>());
            }
            if (card.getTodos() == null) {
                card.setTodos(new java.util.ArrayList<>());
            }

            // Note: createdAt and updatedAt are managed by JPA lifecycle callbacks (@PrePersist, @PreUpdate)

            // Save the card
            Card savedCard = cardRepository.save(card);

            // Maintain bidirectional relationships (if Board and BoardList have collections of Cards)
            board.getCards().add(savedCard);
            boardList.getCards().add(savedCard);
            boardRepository.save(board);
            boardListRepository.save(boardList);

            return cardMapper.toDTO(savedCard);
        } catch (Exception e) {
            log.error("Error creating card: ", e);
            throw new ServiceException("Error creating card", e);
        }
    }
    @Transactional
    public CardDTO updateCardTrackedTimes(String cardId, Set<String> trackedTimes) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            card.setTrackedTimes(trackedTimes != null ? new HashSet<>(trackedTimes) : new HashSet<>());
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating tracked times for card: ", e);
            throw new ServiceException("Error updating tracked times for card", e);
        }
    }

    @Transactional
    public CardDTO removeCardLinks(String cardId, Set<String> linksToRemove) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            if (linksToRemove != null) {
                card.getLinks().removeAll(linksToRemove);
            }
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error removing links from card: ", e);
            throw new ServiceException("Error removing links from card", e);
        }
    }

    /**
     * Retrieves a card by its ID.
     *
     * @param id The ID of the card.
     * @return The CardDTO.
     */
    public CardDTO getCardById(String id) {
        return cardRepository.findById(id)
                .map(cardMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + id));
    }

    /**
     * Updates an existing card.
     *
     * @param cardDTO The DTO containing updated card details.
     * @return The updated CardDTO.
     */
    public CardDTO updateCard(CardDTO cardDTO) {
        try {
            Card existingCard = cardRepository.findById(cardDTO.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardDTO.getId()));

            // Update fields
            existingCard.setTitle(cardDTO.getTitle());
            existingCard.setDescription(cardDTO.getDescription());

            // Update Board and BoardList if they have changed
            if (!existingCard.getBoard().getId().equals(cardDTO.getBoardId())) {
                Board newBoard = boardRepository.getBoardById(cardDTO.getBoardId());
                // Remove from old board
                existingCard.getBoard().getCards().remove(existingCard);
                // Set new board
                existingCard.setBoard(newBoard);
                newBoard.getCards().add(existingCard);
                boardRepository.save(newBoard);
                boardRepository.save(existingCard.getBoard());
            }

            if (!existingCard.getBoardList().getId().equals(cardDTO.getListId())) {
                BoardList newBoardList = getBoardListById(cardDTO.getListId());
                // Remove from old board list
                existingCard.getBoardList().getCards().remove(existingCard);
                // Set new board list
                existingCard.setBoardList(newBoardList);
                newBoardList.getCards().add(existingCard);
                boardListRepository.save(newBoardList);
                boardListRepository.save(existingCard.getBoardList());
            }

            // Update labels, links, trackedTimes
            Set<String> updatedLabels = cardDTO.getLabels() != null ? new HashSet<>(cardDTO.getLabels()) : new HashSet<>();
            existingCard.setLabels(updatedLabels);

            Set<String> updatedLinks = cardDTO.getLinks() != null ? new HashSet<>(cardDTO.getLinks()) : new HashSet<>();
            existingCard.setLinks(updatedLinks);

            Set<String> updatedTrackedTimes = cardDTO.getTrackedTimes() != null ? new HashSet<>(cardDTO.getTrackedTimes()) : new HashSet<>();
            existingCard.setTrackedTimes(updatedTrackedTimes);

            // Update other fields
            existingCard.setIsCompleted(cardDTO.getIsCompleted() != null ? cardDTO.getIsCompleted() : false);
            existingCard.setDateTo(cardDTO.getDateTo());

            // Note: updatedAt is managed by JPA lifecycle callbacks

            // Save updated card
            Card updatedCard = cardRepository.save(existingCard);

            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card: ", e);
            throw new ServiceException("Error updating card", e);
        }
    }

    /**
     * Deletes a card by its ID.
     *
     * @param cardId The ID of the card to delete.
     */
    public void deleteCard(String cardId) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            // Remove from Board and BoardList if bidirectional relationships are maintained
            Board board = card.getBoard();
            BoardList boardList = card.getBoardList();

            board.getCards().remove(card);
            boardList.getCards().remove(card);

            boardRepository.save(board);
            boardListRepository.save(boardList);

            // Delete the card
            cardRepository.delete(card);
        } catch (Exception e) {
            log.error("Error deleting card: ", e);
            throw new ServiceException("Error deleting card", e);
        }
    }

    /**
     * Retrieves all cards within a specific board list.
     *
     * @param listId The ID of the board list.
     * @return A list of CardDTOs.
     */
    public List<CardDTO> getCardsByBoardListId(String listId) {
        List<Card> cards = cardRepository.findByBoardListId(listId);
        return cards.stream()
                .map(cardMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Copies an existing card within the same board.
     *
     * @param cardId The ID of the card to copy.
     * @return The copied CardDTO.
     */
    public CardDTO copyCard(String cardId) {
        try {
            Card originalCard = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Original card not found with ID: " + cardId));

            // Determine the new order within the same board list
            Integer maxOrder = cardRepository.findMaxOrderByListId(originalCard.getBoardList().getId()).orElse(0);
            int newOrder = maxOrder + 1;

            // Create the new card
            Card newCard = new Card();
            newCard.setTitle(originalCard.getTitle() + " - Copy");
            newCard.setDescription(originalCard.getDescription());
            newCard.setBoard(originalCard.getBoard());
            newCard.setBoardList(originalCard.getBoardList());
            newCard.setOrder(newOrder);
            newCard.setLabels(new HashSet<>(originalCard.getLabels()));
            newCard.setLinks(new HashSet<>(originalCard.getLinks()));
            newCard.setIsCompleted(originalCard.getIsCompleted());
            newCard.setTrackedTimes(new HashSet<>(originalCard.getTrackedTimes()));
            newCard.setDateTo(originalCard.getDateTo());

            // Initialize comments and todos as empty lists (deep copy is optional)
            newCard.setComments(new java.util.ArrayList<>());
            newCard.setTodos(new java.util.ArrayList<>());

            // Save the new card
            Card savedCard = cardRepository.save(newCard);

            // Maintain bidirectional relationships
            originalCard.getBoard().getCards().add(savedCard);
            originalCard.getBoardList().getCards().add(savedCard);
            boardRepository.save(originalCard.getBoard());
            boardListRepository.save(originalCard.getBoardList());

            return cardMapper.toDTO(savedCard);
        } catch (Exception e) {
            log.error("Error copying card: ", e);
            throw new ServiceException("Error copying card", e);
        }
    }

    /**
     * Updates the labels of a card.
     *
     * @param cardId The ID of the card.
     * @param labels The new list of labels.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardLabels(String cardId, Set<String> labels) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            card.setLabels(labels != null ? new HashSet<>(labels) : new HashSet<>());
            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card labels: ", e);
            throw new ServiceException("Error updating card labels", e);
        }
    }

    /**
     * Updates the completion status of a card.
     *
     * @param cardId      The ID of the card.
     * @param isCompleted The new completion status.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardIsCompleted(String cardId, Boolean isCompleted) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            card.setIsCompleted(isCompleted != null ? isCompleted : false);
            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card completion status: ", e);
            throw new ServiceException("Error updating card completion status", e);
        }
    }

    /**
     * Updates the comments of a card.
     *
     * @param cardId   The ID of the card.
     * @param comments The new list of comments.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardComments(String cardId, List<Comment> comments) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            // Clear existing comments if needed
            card.getComments().clear();

            if (comments != null) {
                comments.forEach(comment -> {
                    comment.setCard(card);
                    card.getComments().add(comment);
                });
            }

            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card comments: ", e);
            throw new ServiceException("Error updating card comments", e);
        }
    }

    /**
     * Updates the todos of a card.
     *
     * @param cardId The ID of the card.
     * @param todos  The new list of todos.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardTodos(String cardId, List<Todo> todos) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            // Clear existing todos if needed
            card.getTodos().clear();

            if (todos != null) {
                todos.forEach(todo -> {
                    todo.setCard(card);
                    card.getTodos().add(todo);
                });
            }

            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card todos: ", e);
            throw new ServiceException("Error updating card todos", e);
        }
    }

    /**
     * Updates the links of a card.
     *
     * @param cardId The ID of the card.
     * @param links  The new list of links.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardLinks(String cardId, Set<String> links) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            card.setLinks(links != null ? new HashSet<>(links) : new HashSet<>());
            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card links: ", e);
            throw new ServiceException("Error updating card links", e);
        }
    }

    /**
     * Updates the date of a card.
     *
     * @param cardId The ID of the card.
     * @param dateTo The new date.
     * @return The updated CardDTO.
     */
    public CardDTO updateCardDate(String cardId, LocalDateTime dateTo) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            card.setDateTo(dateTo);
            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card date: ", e);
            throw new ServiceException("Error updating card date", e);
        }
    }

    /**
     * Adds a comment to a card.
     *
     * @param cardId  The ID of the card.
     * @param comment The comment to add.
     * @return The updated CardDTO.
     */
    @Transactional
    public CardDTO addCardComment(String cardId, Comment comment) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        comment.setCard(card);
        card.getComments().add(comment);

        // Save the card to persist the comment
        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDTO(updatedCard);
    }


    public CardDTO updateCardLabel(String cardId, List<String> labels) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        card.setLabels((Set<String>) labels);
        card.setUpdatedAt(LocalDateTime.now());

        return cardMapper.toDTO(cardRepository.save(card));
    }

    /**
     * Removes a comment from a card.
     *
     * @param cardId    The ID of the card.
     * @param commentId The ID of the comment to remove.
     * @return The updated CardDTO.
     */
    public CardDTO removeCardComment(String cardId, String commentId) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            boolean removed = card.getComments().removeIf(comment -> comment.getId().equals(commentId));

            if (!removed) {
                throw new ResourceNotFoundException("Comment not found with ID: " + commentId + " in Card ID: " + cardId);
            }

            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error removing comment from card: ", e);
            throw new ServiceException("Error removing comment from card", e);
        }
    }

    /**
     * Adds a todo to a card.
     *
     * @param cardId The ID of the card.
     * @param todo   The todo to add.
     * @return The updated CardDTO.
     */
    public CardDTO addCardTodo(String cardId, Todo todo) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            todo.setCard(card);
            card.getTodos().add(todo);
            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error adding todo to card: ", e);
            throw new ServiceException("Error adding todo to card", e);
        }
    }


    public CardDTO removeCardTodo(String cardId, String todoId) {
        try {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

            boolean removed = card.getTodos().removeIf(todo -> todo.getId().equals(todoId));

            if (!removed) {
                throw new ResourceNotFoundException("Todo not found with ID: " + todoId + " in Card ID: " + cardId);
            }

            // Note: updatedAt is managed by JPA lifecycle callbacks

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error removing todo from card: ", e);
            throw new ServiceException("Error removing todo from card", e);
        }
    }

    /**
     * Reorders multiple cards based on the provided list of DTOs.
     *
     * @param cards A list of CardDTOs with updated order values.
     */
    public void reorderCards(List<CardDTO> cards) {
        try {
            for (CardDTO dto : cards) {
                Card existingCard = cardRepository.findById(dto.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + dto.getId()));

                // Ensure the card is being reordered within the correct BoardList
                if (!existingCard.getBoardList().getId().equals(dto.getListId())) {
                    throw new ServiceException(
                            "Card ID: " + dto.getId() + " does not belong to BoardList ID: " + dto.getListId(),
                            null
                    );
                }

                existingCard.setOrder(dto.getOrder());
                // Note: updatedAt is managed by JPA lifecycle callbacks

                cardRepository.save(existingCard);
            }
        } catch (Exception e) {
            log.error("Error reordering cards: ", e);
            throw new ServiceException("Error reordering cards", e);
        }
    }


    /**
     * Retrieves all cards within a specific board.
     *
     * @param boardId The ID of the board.
     * @return A list of CardDTOs.
     */
    public List<CardDTO> getCardsByBoardId(String boardId) {
        List<Card> cards = cardRepository.findByBoardId(boardId);
        return cards.stream()
                .map(cardMapper::toDTO)
                .collect(Collectors.toList());
    }
    @Transactional
    public CardDTO addCardMembers(String cardId, List<String> userIds) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        // Add userIds to the members set
        if (userIds != null) {
            card.getMembers().addAll(userIds);
        }

        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDTO(updatedCard);
    }

    @Transactional
    public CardDTO removeCardMembers(String cardId, List<String> userIds) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with ID: " + cardId));

        // Remove userIds from the members set
        if (userIds != null) {
            card.getMembers().removeAll(userIds);
        }

        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDTO(updatedCard);
    }


    /**
     * Retrieves a specific board list by its ID.
     *
     * @param listId The ID of the board list.
     * @return The BoardList entity.
     */
    public BoardList getBoardListById(String listId) {
        return boardListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("BoardList not found with ID: " + listId));
    }



    @Transactional
    public CardDTO updateCardPosition(String cardId, UpdateCardDTO updateCardDTO) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));

        try {
            BoardList newList = boardListRepository.findById(updateCardDTO.getListId())
                    .orElseThrow(() -> new RuntimeException("List not found with id: " + updateCardDTO.getListId()));

            // Update the card's position
            card.setBoardList(newList);
            card.setOrder(updateCardDTO.getOrder());

            // Reorder other cards in the destination list
            List<Card> cardsInList = cardRepository.findByBoardListIdOrderByOrder(newList.getId());
            for (Card existingCard : cardsInList) {
                if (!existingCard.getId().equals(cardId) &&
                        existingCard.getOrder() >= updateCardDTO.getOrder()) {
                    existingCard.setOrder(existingCard.getOrder() + 1);
                    cardRepository.save(existingCard);
                }
            }

            Card updatedCard = cardRepository.save(card);
            return convertToDTO(updatedCard);
        } catch (Exception e) {
            throw new RuntimeException("Error updating card position: " + e.getMessage());
        }
    }


    private CardDTO convertToDTO(Card card) {
        CardDTO dto = new CardDTO();
        dto.setId(card.getId());
        dto.setTitle(card.getTitle());
        dto.setDescription(card.getDescription());
        dto.setListId(card.getBoardList().getId());
        dto.setBoardId(card.getBoard().getId());
        dto.setOrder(card.getOrder());
        return dto;
    }
}
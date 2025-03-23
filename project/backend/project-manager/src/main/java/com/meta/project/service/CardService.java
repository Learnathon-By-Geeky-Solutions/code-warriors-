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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class CardService {

    private static final String CARD_NOT_FOUND_MESSAGE = "Card not found with ID: ";
    private static final String BOARD_LIST_NOT_FOUND_MESSAGE = "BoardList not found with ID: ";

    private final CardRepository cardRepository;
    private final BoardRepository boardRepository;
    private final BoardListRepository boardListRepository;
    private final CardMapper cardMapper;

    /**
     * Generic method to execute card operations with exception handling
     */
    private <T> T executeCardOperation(String operationName, Function<Card, T> operation, String cardId) {
        try {
            Card card = getExistingCard(cardId);
            return operation.apply(card);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error {} for card ID {}: {}", operationName, cardId, e.getMessage());
            throw new ServiceException("Error " + operationName, e);
        }
    }

    /**
     * Generic method to execute and return CardDTO
     */
    private CardDTO executeCardDTOOperation(String operationName, Function<Card, Card> operation, String cardId) {
        return executeCardOperation(operationName, card -> {
            Card updatedCard = operation.apply(card);
            return cardMapper.toDTO(updatedCard);
        }, cardId);
    }

    private Card getExistingCard(String cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException(CARD_NOT_FOUND_MESSAGE + cardId));
    }

    private BoardList getBoardListById(String listId) {
        return boardListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException(BOARD_LIST_NOT_FOUND_MESSAGE + listId));
    }

    private void setupCardCollections(Card card) {
        if (card.getLabels() == null) card.setLabels(new HashSet<>());
        if (card.getLinks() == null) card.setLinks(new HashSet<>());
        if (card.getTrackedTimes() == null) card.setTrackedTimes(new HashSet<>());
        if (card.getComments() == null) card.setComments(new java.util.ArrayList<>());
        if (card.getTodos() == null) card.setTodos(new java.util.ArrayList<>());
        if (card.getMembers() == null) card.setMembers(new HashSet<>());
    }

    private Card saveCardWithRelationships(Card card) {
        Card savedCard = cardRepository.save(card);
        Board board = card.getBoard();
        BoardList boardList = card.getBoardList();

        board.getCards().add(savedCard);
        boardList.getCards().add(savedCard);

        boardRepository.save(board);
        boardListRepository.save(boardList);

        return savedCard;
    }

    public CardDTO createCard(CardDTO cardDTO) {
        try {
            Card card = cardMapper.toEntity(cardDTO);

            // Set board and boardList
            Board board = boardRepository.getBoardById(cardDTO.getBoardId());
            BoardList boardList = getBoardListById(cardDTO.getListId());
            card.setBoard(board);
            card.setBoardList(boardList);

            // Set order
            Integer maxOrder = cardRepository.findMaxOrderByListId(card.getBoardList().getId()).orElse(0);
            card.setOrder(maxOrder + 1);

            // Initialize collections
            setupCardCollections(card);

            // Save with relationships
            Card savedCard = saveCardWithRelationships(card);
            return cardMapper.toDTO(savedCard);
        } catch (Exception e) {
            log.error("Error creating card: ", e);
            throw new ServiceException("Error creating card", e);
        }
    }

    public CardDTO updateCardTrackedTimes(String cardId, Set<String> trackedTimes) {
        return executeCardDTOOperation("updating tracked times", card -> {
            card.setTrackedTimes(trackedTimes != null ? new HashSet<>(trackedTimes) : new HashSet<>());
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO removeCardLinks(String cardId, Set<String> linksToRemove) {
        return executeCardDTOOperation("removing links", card -> {
            if (linksToRemove != null) {
                card.getLinks().removeAll(linksToRemove);
            }
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO getCardById(String id) {
        return cardRepository.findById(id)
                .map(cardMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException(CARD_NOT_FOUND_MESSAGE + id));
    }

    public CardDTO updateCard(CardDTO cardDTO) {
        return executeCardDTOOperation("updating card", card -> {
            // Update basic fields
            updateBasicCardFields(card, cardDTO);

            // Update board if changed
            if (!card.getBoard().getId().equals(cardDTO.getBoardId())) {
                updateCardBoard(card, cardDTO.getBoardId());
            }

            // Update board list if changed
            if (!card.getBoardList().getId().equals(cardDTO.getListId())) {
                updateCardBoardList(card, cardDTO.getListId());
            }

            // Update sets
            updateCardCollections(card, cardDTO);

            return cardRepository.save(card);
        }, cardDTO.getId());
    }

    private void updateBasicCardFields(Card card, CardDTO cardDTO) {
        card.setTitle(cardDTO.getTitle());
        card.setDescription(cardDTO.getDescription());
        card.setIsCompleted(cardDTO.getIsCompleted() != null && cardDTO.getIsCompleted());
        card.setDateTo(cardDTO.getDateTo());
    }

    private void updateCardBoard(Card card, String newBoardId) {
        Board oldBoard = card.getBoard();
        Board newBoard = boardRepository.getBoardById(newBoardId);

        oldBoard.getCards().remove(card);
        card.setBoard(newBoard);
        newBoard.getCards().add(card);

        boardRepository.save(oldBoard);
        boardRepository.save(newBoard);
    }

    private void updateCardBoardList(Card card, String newBoardListId) {
        BoardList oldBoardList = card.getBoardList();
        BoardList newBoardList = getBoardListById(newBoardListId);

        oldBoardList.getCards().remove(card);
        card.setBoardList(newBoardList);
        newBoardList.getCards().add(card);

        boardListRepository.save(oldBoardList);
        boardListRepository.save(newBoardList);
    }

    private void updateCardCollections(Card card, CardDTO cardDTO) {
        card.setLabels(cardDTO.getLabels() != null ? new HashSet<>(cardDTO.getLabels()) : new HashSet<>());
        card.setLinks(cardDTO.getLinks() != null ? new HashSet<>(cardDTO.getLinks()) : new HashSet<>());
        card.setTrackedTimes(cardDTO.getTrackedTimes() != null ? new HashSet<>(cardDTO.getTrackedTimes()) : new HashSet<>());
    }

    public void deleteCard(String cardId) {
        executeCardOperation("deleting card", card -> {
            Board board = card.getBoard();
            BoardList boardList = card.getBoardList();

            board.getCards().remove(card);
            boardList.getCards().remove(card);

            boardRepository.save(board);
            boardListRepository.save(boardList);
            cardRepository.delete(card);

            return null;
        }, cardId);
    }

    public List<CardDTO> getCardsByBoardListId(String listId) {
        List<Card> cards = cardRepository.findByBoardListId(listId);
        return cards.stream()
                .map(cardMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CardDTO copyCard(String cardId) {
        return executeCardOperation("copying card", originalCard -> {
            Integer maxOrder = cardRepository.findMaxOrderByListId(originalCard.getBoardList().getId()).orElse(0);
            int newOrder = maxOrder + 1;

            Card newCard = new Card();
            // Copy basic properties
            newCard.setTitle(originalCard.getTitle() + " - Copy");
            newCard.setDescription(originalCard.getDescription());
            newCard.setOrder(newOrder);
            newCard.setIsCompleted(originalCard.getIsCompleted());
            newCard.setDateTo(originalCard.getDateTo());

            // Copy references
            newCard.setBoard(originalCard.getBoard());
            newCard.setBoardList(originalCard.getBoardList());

            // Copy collections
            newCard.setLabels(new HashSet<>(originalCard.getLabels()));
            newCard.setLinks(new HashSet<>(originalCard.getLinks()));
            newCard.setTrackedTimes(new HashSet<>(originalCard.getTrackedTimes()));
            newCard.setComments(new java.util.ArrayList<>());
            newCard.setTodos(new java.util.ArrayList<>());

            // Save with relationships
            Card savedCard = saveCardWithRelationships(newCard);
            return cardMapper.toDTO(savedCard);
        }, cardId);
    }

    public CardDTO updateCardLabels(String cardId, Set<String> labels) {
        return executeCardDTOOperation("updating labels", card -> {
            card.setLabels(labels != null ? new HashSet<>(labels) : new HashSet<>());
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO updateCardIsCompleted(String cardId, Boolean isCompleted) {
        return executeCardDTOOperation("updating completion status", card -> {
            card.setIsCompleted(isCompleted != null && isCompleted);
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO updateCardComments(String cardId, List<Comment> comments) {
        return executeCardDTOOperation("updating comments", card -> {
            card.getComments().clear();
            if (comments != null) {
                comments.forEach(comment -> comment.setCard(card));
                card.getComments().addAll(comments);
            }
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO updateCardTodos(String cardId, List<Todo> todos) {
        return executeCardDTOOperation("updating todos", card -> {
            card.getTodos().clear();
            if (todos != null) {
                todos.forEach(todo -> todo.setCard(card));
                card.getTodos().addAll(todos);
            }
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO updateCardLinks(String cardId, Set<String> links) {
        return executeCardDTOOperation("updating links", card -> {
            card.setLinks(links != null ? new HashSet<>(links) : new HashSet<>());
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO updateCardDate(String cardId, LocalDateTime dateTo) {
        return executeCardDTOOperation("updating date", card -> {
            card.setDateTo(dateTo);
            return cardRepository.save(card);
        }, cardId);
    }

    @Transactional
    public CardDTO addCardComment(String cardId, Comment comment) {
        return executeCardDTOOperation("adding comment", card -> {
            comment.setCard(card);
            card.getComments().add(comment);
            return cardRepository.save(card);
        }, cardId);
    }

    public CardDTO removeCardComment(String cardId, String commentId) {
        return executeCardDTOOperation("removing comment", card -> {
            boolean removed = card.getComments().removeIf(comment -> comment.getId().equals(commentId));
            if (!removed) {
                throw new ResourceNotFoundException("Comment not found with ID: " + commentId + " in Card ID: " + cardId);
            }
            return cardRepository.save(card);
        }, cardId);
    }

    public void reorderCards(List<CardDTO> cards) {
        try {
            for (CardDTO dto : cards) {
                Card card = getExistingCard(dto.getId());
                if (!card.getBoardList().getId().equals(dto.getListId())) {
                    throw new ServiceException(
                            "Card ID: " + dto.getId() + " does not belong to BoardList ID: " + dto.getListId(),
                            null
                    );
                }
                card.setOrder(dto.getOrder());
                cardRepository.save(card);
            }
        } catch (Exception e) {
            log.error("Error reordering cards: ", e);
            throw new ServiceException("Error reordering cards", e);
        }
    }

    public List<CardDTO> getCardsByBoardId(String boardId) {
        List<Card> cards = cardRepository.findByBoardId(boardId);
        return cards.stream()
                .map(cardMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CardDTO addCardMembers(String cardId, List<String> userIds) {
        return executeCardDTOOperation("adding members", card -> {
            if (userIds != null) {
                card.getMembers().addAll(userIds);
            }
            return cardRepository.save(card);
        }, cardId);
    }

    @Transactional
    public CardDTO removeCardMembers(String cardId, List<String> userIds) {
        return executeCardDTOOperation("removing members", card -> {
            if (userIds != null) {
                card.getMembers().removeAll(userIds);
            }
            return cardRepository.save(card);
        }, cardId);
    }

    private void reorderCardsInList(String boardListId, int newOrder, String excludedCardId) {
        List<Card> cardsInList = cardRepository.findByBoardListIdOrderByOrder(boardListId);
        for (Card card : cardsInList) {
            if (!card.getId().equals(excludedCardId) && card.getOrder() >= newOrder) {
                card.setOrder(card.getOrder() + 1);
                cardRepository.save(card);
            }
        }
    }

    @Transactional
    public CardDTO updateCardPosition(String cardId, UpdateCardDTO updateCardDTO) {
        return executeCardOperation("updating position", card -> {
            BoardList newList = getBoardListById(updateCardDTO.getListId());

            // Update order of other cards first to make room
            reorderCardsInList(newList.getId(), updateCardDTO.getOrder(), cardId);

            // Update the card's list and order
            card.setBoardList(newList);
            card.setOrder(updateCardDTO.getOrder());

            // Save and return
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        }, cardId);
    }
}
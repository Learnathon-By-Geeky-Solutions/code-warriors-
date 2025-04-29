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
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class CardService {

    private static final String CARD_NOT_FOUND_MESSAGE = "Card not found with ID: ";

    private final CardRepository cardRepository;
    private final BoardRepository boardRepository;
    private final BoardListRepository boardListRepository;
    private final CardMapper cardMapper;

    public CardService(CardRepository cardRepository,
                       BoardRepository boardRepository,
                       BoardListRepository boardListRepository,
                       CardMapper cardMapper) {
        this.cardRepository = cardRepository;
        this.boardRepository = boardRepository;
        this.boardListRepository = boardListRepository;
        this.cardMapper = cardMapper;
    }

    private Card getExistingCard(String cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException(CARD_NOT_FOUND_MESSAGE + cardId));
    }

    private BoardList getBoardListById(String listId) {
        return boardListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("BoardList not found with ID: " + listId));
    }

    private Card getAndSetBoardAndBoardList(Card card, CardDTO cardDTO) {
        Board board = boardRepository.getBoardById(cardDTO.getBoardId());
        BoardList boardList = getBoardListById(cardDTO.getListId());
        card.setBoard(board);
        card.setBoardList(boardList);
        return card;
    }

    private Card initializeCardCollections(Card card) {
        if (card.getLabels() == null) card.setLabels(new HashSet<>());
        if (card.getLinks() == null) card.setLinks(new HashSet<>());
        if (card.getTrackedTimes() == null) card.setTrackedTimes(new HashSet<>());
        if (card.getComments() == null) card.setComments(new java.util.ArrayList<>());
        if (card.getTodos() == null) card.setTodos(new java.util.ArrayList<>());
        if (card.getMembers() == null) card.setMembers(new HashSet<>());
        return card;
    }

    private Card saveCardAndManageRelationships(Card card, Board board, BoardList boardList) {
        Card savedCard = cardRepository.save(card);
        board.getCards().add(savedCard);
        boardList.getCards().add(savedCard);
        boardRepository.save(board);
        boardListRepository.save(boardList);
        return savedCard;
    }

    public CardDTO createCard(CardDTO cardDTO) {
        try {
            Card card = cardMapper.toEntity(cardDTO);
            getAndSetBoardAndBoardList(card, cardDTO);

            Integer maxOrder = cardRepository.findMaxOrderByListId(card.getBoardList().getId()).orElse(0);
            card.setOrder(maxOrder + 1);

            initializeCardCollections(card);

            Card savedCard = saveCardAndManageRelationships(card, card.getBoard(), card.getBoardList());
            return cardMapper.toDTO(savedCard);
        } catch (Exception e) {
            log.error("Error creating card: ", e);
            throw new ServiceException("Error creating card", e);
        }
    }

    public CardDTO updateCardTrackedTimes(String cardId, Set<String> trackedTimes) {
        try {
            Card card = getExistingCard(cardId);
            card.setTrackedTimes(trackedTimes != null ? new HashSet<>(trackedTimes) : new HashSet<>());
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating tracked times for card: ", e);
            throw new ServiceException("Error updating tracked times for card", e);
        }
    }

    public CardDTO removeCardLinks(String cardId, Set<String> linksToRemove) {
        try {
            Card card = getExistingCard(cardId);
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

    public CardDTO getCardById(String id) {
        return cardRepository.findById(id)
                .map(cardMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException(CARD_NOT_FOUND_MESSAGE + id));
    }

    private void updateBasicCardFields(Card existingCard, CardDTO cardDTO) {
        existingCard.setTitle(cardDTO.getTitle());
        existingCard.setDescription(cardDTO.getDescription());
        existingCard.setIsCompleted(cardDTO.getIsCompleted() != null && cardDTO.getIsCompleted());
        existingCard.setDateTo(cardDTO.getDateTo());
    }

    private void updateCardBoard(Card existingCard, String newBoardId) {
        if (!existingCard.getBoard().getId().equals(newBoardId)) {
            Board newBoard = boardRepository.getBoardById(newBoardId);
            existingCard.getBoard().getCards().remove(existingCard);
            existingCard.setBoard(newBoard);
            newBoard.getCards().add(existingCard);
            boardRepository.save(newBoard);
            boardRepository.save(existingCard.getBoard());
        }
    }

    private void updateCardBoardList(Card existingCard, String newBoardListId) {
        if (!existingCard.getBoardList().getId().equals(newBoardListId)) {
            BoardList newBoardList = getBoardListById(newBoardListId);
            existingCard.getBoardList().getCards().remove(existingCard);
            existingCard.setBoardList(newBoardList);
            newBoardList.getCards().add(existingCard);
            boardListRepository.save(newBoardList);
            boardListRepository.save(existingCard.getBoardList());
        }
    }

    private void updateCardSets(Card existingCard, CardDTO cardDTO) {
        existingCard.setLabels(cardDTO.getLabels() != null ? new HashSet<>(cardDTO.getLabels()) : new HashSet<>());
        existingCard.setLinks(cardDTO.getLinks() != null ? new HashSet<>(cardDTO.getLinks()) : new HashSet<>());
        existingCard.setTrackedTimes(cardDTO.getTrackedTimes() != null ? new HashSet<>(cardDTO.getTrackedTimes()) : new HashSet<>());
    }

    public CardDTO updateCard(CardDTO cardDTO) {
        try {
            Card existingCard = getExistingCard(cardDTO.getId());

            updateBasicCardFields(existingCard, cardDTO);
            updateCardBoard(existingCard, cardDTO.getBoardId());
            updateCardBoardList(existingCard, cardDTO.getListId());
            updateCardSets(existingCard, cardDTO);

            Card updatedCard = cardRepository.save(existingCard);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card: ", e);
            throw new ServiceException("Error updating card", e);
        }
    }

    private void removeCardFromBoardAndList(Card card) {
        Board board = card.getBoard();
        BoardList boardList = card.getBoardList();
        board.getCards().remove(card);
        boardList.getCards().remove(card);
        boardRepository.save(board);
        boardListRepository.save(boardList);
    }

    public void deleteCard(String cardId) {
        try {
            Card card = getExistingCard(cardId);
            removeCardFromBoardAndList(card);
            cardRepository.delete(card);
        } catch (Exception e) {
            log.error("Error deleting card: ", e);
            throw new ServiceException("Error deleting card", e);
        }
    }

    public List<CardDTO> getCardsByBoardListId(String listId) {
        List<Card> cards = cardRepository.findByBoardListId(listId);
        return cards.stream()
                .map(cardMapper::toDTO)
                .collect(Collectors.toList());
    }

    private Card createCopiedCard(Card originalCard, int newOrder) {
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
        newCard.setComments(new java.util.ArrayList<>());
        newCard.setTodos(new java.util.ArrayList<>());
        return newCard;
    }

    public CardDTO copyCard(String cardId) {
        try {
            Card originalCard = getExistingCard(cardId);
            Integer maxOrder = cardRepository.findMaxOrderByListId(originalCard.getBoardList().getId()).orElse(0);
            int newOrder = maxOrder + 1;

            Card newCard = createCopiedCard(originalCard, newOrder);
            Card savedCard = saveCardAndManageRelationships(newCard, originalCard.getBoard(), originalCard.getBoardList());

            return cardMapper.toDTO(savedCard);
        } catch (Exception e) {
            log.error("Error copying card: ", e);
            throw new ServiceException("Error copying card", e);
        }
    }

    public CardDTO updateCardLabels(String cardId, Set<String> labels) {
        try {
            Card card = getExistingCard(cardId);
            card.setLabels(labels != null ? new HashSet<>(labels) : new HashSet<>());
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card labels: ", e);
            throw new ServiceException("Error updating card labels", e);
        }
    }

    public CardDTO updateCardIsCompleted(String cardId, Boolean isCompleted) {
        try {
            Card card = getExistingCard(cardId);
            card.setIsCompleted(isCompleted != null && isCompleted);
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card completion status: ", e);
            throw new ServiceException("Error updating card completion status", e);
        }
    }

    public CardDTO updateCardComments(String cardId, List<Comment> comments) {
        try {
            Card card = getExistingCard(cardId);
            card.getComments().clear();
            if (comments != null) {
                comments.forEach(comment -> comment.setCard(card));
                card.getComments().addAll(comments);
            }
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card comments: ", e);
            throw new ServiceException("Error updating card comments", e);
        }
    }

    public CardDTO updateCardTodos(String cardId, List<Todo> todos) {
        try {
            Card card = getExistingCard(cardId);
            card.getTodos().clear();
            if (todos != null) {
                todos.forEach(todo -> todo.setCard(card));
                card.getTodos().addAll(todos);
            }
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card todos: ", e);
            throw new ServiceException("Error updating card todos", e);
        }
    }

    public CardDTO updateCardLinks(String cardId, Set<String> links) {
        try {
            Card card = getExistingCard(cardId);
            card.setLinks(links != null ? new HashSet<>(links) : new HashSet<>());
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card links: ", e);
            throw new ServiceException("Error updating card links", e);
        }
    }

    public CardDTO updateCardDate(String cardId, LocalDateTime dateTo) {
        try {
            Card card = getExistingCard(cardId);
            card.setDateTo(dateTo);
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error updating card date: ", e);
            throw new ServiceException("Error updating card date", e);
        }
    }

    @Transactional
    public CardDTO addCardComment(String cardId, Comment comment) {
        Card card = getExistingCard(cardId);
        comment.setCard(card);
        card.getComments().add(comment);
        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDTO(updatedCard);
    }

    public CardDTO updateCardLabel(String cardId, List<String> labels) {
        Card card = getExistingCard(cardId);
        card.setLabels(new HashSet<>(labels));
        card.setUpdatedAt(LocalDateTime.now());
        return cardMapper.toDTO(cardRepository.save(card));
    }

    public CardDTO removeCardComment(String cardId, String commentId) {
        try {
            Card card = getExistingCard(cardId);
            boolean removed = card.getComments().removeIf(comment -> comment.getId().equals(commentId));
            if (!removed) {
                throw new ResourceNotFoundException("Comment not found with ID: " + commentId + " in Card ID: " + cardId);
            }
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error removing comment from card: ", e);
            throw new ServiceException("Error removing comment from card", e);
        }
    }

    public CardDTO addCardTodo(String cardId, Todo todo) {
        try {
            Card card = getExistingCard(cardId);
            todo.setCard(card);
            card.getTodos().add(todo);
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error adding todo to card: ", e);
            throw new ServiceException("Error adding todo to card", e);
        }
    }

    public CardDTO removeCardTodo(String cardId, String todoId) {
        try {
            Card card = getExistingCard(cardId);
            boolean removed = card.getTodos().removeIf(todo -> todo.getId().equals(todoId));
            if (!removed) {
                throw new ResourceNotFoundException("Todo not found with ID: " + todoId + " in Card ID: " + cardId);
            }
            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (Exception e) {
            log.error("Error removing todo from card: ", e);
            throw new ServiceException("Error removing todo from card", e);
        }
    }

    public void reorderCards(List<CardDTO> cards) {
        try {
            for (CardDTO dto : cards) {
                Card existingCard = getExistingCard(dto.getId());
                if (!existingCard.getBoardList().getId().equals(dto.getListId())) {
                    throw new ServiceException(
                            "Card ID: " + dto.getId() + " does not belong to BoardList ID: " + dto.getListId(),
                            null
                    );
                }
                existingCard.setOrder(dto.getOrder());
                cardRepository.save(existingCard);
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
        Card card = getExistingCard(cardId);
        if (userIds != null) {
            card.getMembers().addAll(userIds);
        }
        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDTO(updatedCard);
    }

    @Transactional
    public CardDTO removeCardMembers(String cardId, List<String> userIds) {
        Card card = getExistingCard(cardId);
        if (userIds != null) {
            card.getMembers().removeAll(userIds);
        }
        Card updatedCard = cardRepository.save(card);
        return cardMapper.toDTO(updatedCard);
    }

    private void reorderCardsInList(String newBoardListId, int newOrder, String currentCardId) {
        List<Card> cardsInList = cardRepository.findByBoardListIdOrderByOrder(newBoardListId);
        for (Card existingCard : cardsInList) {
            if (!existingCard.getId().equals(currentCardId) &&
                    existingCard.getOrder() >= newOrder) {
                existingCard.setOrder(existingCard.getOrder() + 1);
                cardRepository.save(existingCard);
            }
        }
    }

    @Transactional
    public CardDTO updateCardPosition(String cardId, UpdateCardDTO updateCardDTO) {
        Card card = getExistingCard(cardId);

        try {
            BoardList newList = getBoardListById(updateCardDTO.getListId());

            card.setBoardList(newList);
            card.setOrder(updateCardDTO.getOrder());

            reorderCardsInList(newList.getId(), updateCardDTO.getOrder(), cardId);

            Card updatedCard = cardRepository.save(card);
            return cardMapper.toDTO(updatedCard);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating card position: ", e);
            throw new CardPositionException("Error updating card position: " + e.getMessage(), e);
        }
    }

    public static class CardPositionException extends ServiceException {
        public CardPositionException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
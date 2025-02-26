package com.meta.project.repository;

import com.meta.project.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface CardRepository extends JpaRepository<Card, String> {

    // Fetch cards by board list ID
    @Query("SELECT c FROM Card c WHERE c.boardList.id = :listId")
    List<Card> findByBoardListId(@Param("listId") String listId);

    // Find the maximum order value for a given board list ID
    @Query("SELECT MAX(c.order) FROM Card c WHERE c.boardList.id = :listId")
    Optional<Integer> findMaxOrderByListId(@Param("listId") String listId);

    // Count the number of cards in a specific board list
    int countByBoardListId(String listId);

    List<Card> findByBoardListIdOrderByOrder(String id);

    @Query("SELECT c FROM Card c WHERE c.board.id = :boardId")
    List<Card> findByBoardId(@Param("boardId") String boardId);
}
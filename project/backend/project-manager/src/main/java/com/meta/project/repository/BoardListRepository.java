package com.meta.project.repository;

import com.meta.project.entity.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardListRepository extends JpaRepository<BoardList, String> {
    // Fetch lists by board ID ordered by their 'order' field
    List<BoardList> findByBoardIdOrderByOrderAsc(String boardId);

    // Find the maximum order value for a given board ID
    @Query("SELECT MAX(b.order) FROM BoardList b WHERE b.board.id = :boardId")
    Optional<Integer> findMaxOrderByBoardId(@Param("boardId") String boardId);
}
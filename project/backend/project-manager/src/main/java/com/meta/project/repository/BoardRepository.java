package com.meta.project.repository;

import com.meta.project.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, String> {
    Board getBoardById(String boardId);
    List<Board> getBoardsByTeamId(String teamId);
}
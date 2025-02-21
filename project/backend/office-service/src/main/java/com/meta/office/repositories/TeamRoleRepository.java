package com.meta.office.repositories;

import com.meta.office.entities.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRoleRepository extends JpaRepository<TeamRole, Long> {
    List<TeamRole> findByTeamId(String teamId);
    List<TeamRole> findByMemberId(String memberId);
    List<TeamRole> findByRoleIdAndTeamId(Integer roleId, String teamId);
    boolean existsByMemberIdAndRoleIdAndTeamId(String memberId, Integer roleId, String teamId);
}

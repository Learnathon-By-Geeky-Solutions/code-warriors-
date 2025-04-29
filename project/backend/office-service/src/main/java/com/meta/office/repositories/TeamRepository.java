package com.meta.office.repositories;

import com.meta.office.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByOfficeId(String officeId);
}

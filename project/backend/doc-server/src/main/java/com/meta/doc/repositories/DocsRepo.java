package com.meta.doc.repositories;

import com.meta.doc.entities.Docs;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocsRepo extends JpaRepository<Docs, String> {

    List<Docs> findByParentIsNull();

    List<Docs> findByTitleContainingIgnoreCase(String query);

    List<Docs> findByTitleContainingIgnoreCaseAndRootGrandparentId(String query, String rootId);

    List<Docs> findByParentId(String parentId);

    List<Docs> findByRootGrandparentId(String rootId);

    List<Docs> findByTeamId(String teamId);

    List<Docs> findByOfficeId(String officeId);
}

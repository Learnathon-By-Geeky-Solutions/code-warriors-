package com.meta.doc.repositories;

import com.meta.doc.entities.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentFileRepository extends JpaRepository<DocumentFile, String> {
    List<DocumentFile> findByDocument_Id(String documentId);
}
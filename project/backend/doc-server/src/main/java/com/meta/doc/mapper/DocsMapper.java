package com.meta.doc.mapper;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.dtos.DocumentFileDTO;
import com.meta.doc.entities.Docs;
import com.meta.doc.entities.DocumentFile;
import com.meta.doc.repositories.DocumentFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DocsMapper {

    private final DocumentFileRepository documentFileRepository;

    @Autowired
    public DocsMapper(DocumentFileRepository documentFileRepository) {
        this.documentFileRepository = documentFileRepository;
    }

    public DocsDTO instanceToDto(Docs docs, int level) {
        return convertToDto(docs, level, documentFileRepository);
    }

    public static DocsDTO toDto(Docs docs, int level) {
        return convertToDto(docs, level, null);
    }

    private static DocsDTO convertToDto(Docs docs, int level, DocumentFileRepository fileRepository) {
        DocsDTO dto = new DocsDTO(
                docs.getId(),
                docs.getTeamId(),
                docs.getOfficeId(),
                docs.getTitle(),
                docs.getContent(),
                docs.getParent() != null ? docs.getParent().getId() : null,
                docs.getRootGrandparentId(),
                level
        );

        // Add children
        if (docs.getChildren() != null && !docs.getChildren().isEmpty()) {
            dto.setChildren(docs.getChildren().stream()
                    .map(child -> toDto(child, level + 1))
                    .collect(Collectors.toList()));
        }

        // Add files
        return dto;
    }

    public static Docs toEntity(DocsDTO dto) {
        Docs docs = new Docs();
        docs.setId(dto.getId());
        docs.setTeamId(dto.getTeamId());
        docs.setOfficeId(dto.getOfficeId());
        docs.setTitle(dto.getTitle());
        docs.setContent(dto.getContent());
        docs.setRootGrandparentId(dto.getRootGrandparentId());
        return docs;
    }

    public static List<DocsDTO> toDtoList(List<Docs> docsList) {
        return docsList.stream()
                .map(doc -> toDto(doc, 0))
                .collect(Collectors.toList());
    }

    private static DocumentFileDTO convertFileToDTO(DocumentFile file) {
        DocumentFileDTO fileDTO = new DocumentFileDTO();
        fileDTO.setId(file.getId());
        fileDTO.setDocumentId(file.getDocument().getId());
        fileDTO.setOriginalFileName(file.getOriginalFileName());
        fileDTO.setStoredFileName(file.getStoredFileName());
        fileDTO.setFileType(file.getFileType());
        return fileDTO;
    }
}
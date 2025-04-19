package com.meta.doc.mapper;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.entities.Docs;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DocsMapper {

    private DocsMapper() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static DocsDTO toDto(Docs docs, int level) {
        return convertToDto(docs, level);
    }

    private static DocsDTO convertToDto(Docs docs, int level) {
        DocsDTO dto = DocsDTO.builder()
                .id(docs.getId())
                .teamId(docs.getTeamId())
                .officeId(docs.getOfficeId())
                .title(docs.getTitle())
                .content(docs.getContent())
                .parentId(docs.getParent() != null ? docs.getParent().getId() : null)
                .rootGrandparentId(docs.getRootGrandparentId())
                .level(level)
                .build();

        // Add children
        if (docs.getChildren() != null && !docs.getChildren().isEmpty()) {
            dto.setChildren(docs.getChildren().stream()
                    .map(child -> toDto(child, level + 1))
                    .collect(Collectors.toList()));
        }

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
}

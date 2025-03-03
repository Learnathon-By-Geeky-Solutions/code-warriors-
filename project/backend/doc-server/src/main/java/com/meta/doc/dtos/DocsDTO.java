package com.meta.doc.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DocsDTO {
    private String id;
    private String teamId;
    private String officeId;
    private String parentId;
    private String title;
    private String content;
    private String rootGrandparentId;
    private List<DocsDTO> children;
    private int level;
    private List<DocumentFileDTO> files;
}

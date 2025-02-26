package com.meta.doc.dtos;

import lombok.Data;

import java.util.List;

@Data
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

    public DocsDTO(String id, String teamId, String officeId, String title, String content, String parentId, String rootGrandparentId, int level) {
        this.id = id;
        this.teamId = teamId;
        this.officeId = officeId;
        this.title = title;
        this.content = content;
        this.parentId = parentId;
        this.rootGrandparentId = rootGrandparentId;
        this.level = level;
    }
    public DocsDTO() {}
}

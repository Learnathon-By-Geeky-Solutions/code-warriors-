package com.meta.doc.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentFileDTO {
    private String id;
    private String documentId;
    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private long fileSize;
    private String downloadUrl;
}
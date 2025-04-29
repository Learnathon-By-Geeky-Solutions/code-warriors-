package com.meta.doc.controllers;

import com.meta.doc.dtos.DocumentFileDTO;
import com.meta.doc.services.DocumentFileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/ds/v1/docs/{documentId}/files")
public class DocumentFileController {

    private final DocumentFileService documentFileService;

    public DocumentFileController(DocumentFileService documentFileService) {
        this.documentFileService = documentFileService;
    }

    @PostMapping
    public ResponseEntity<DocumentFileDTO> addFileToDocument(
            @PathVariable String documentId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(documentFileService.addFileToDocument(documentId, file));
    }

    @GetMapping
    public ResponseEntity<List<DocumentFileDTO>> getFilesForDocument(
            @PathVariable String documentId) {
        return ResponseEntity.ok(documentFileService.getFilesForDocument(documentId));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteDocumentFile(
            @PathVariable String documentId,
            @PathVariable String fileId) {
        documentFileService.deleteDocumentFile(fileId);
        return ResponseEntity.noContent().build();
    }
}
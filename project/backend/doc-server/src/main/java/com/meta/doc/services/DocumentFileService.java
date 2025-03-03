package com.meta.doc.services;


import com.meta.doc.dtos.DocumentFileDTO;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface DocumentFileService {
    DocumentFileDTO addFileToDocument(String documentId, MultipartFile file) throws IOException;
    List<DocumentFileDTO> getFilesForDocument(String documentId);
    void deleteDocumentFile(String fileId);
}
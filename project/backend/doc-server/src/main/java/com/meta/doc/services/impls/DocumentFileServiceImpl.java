package com.meta.doc.services.impls;

import com.meta.doc.dtos.DocumentFileDTO;
import com.meta.doc.entities.Docs;
import com.meta.doc.entities.DocumentFile;
import com.meta.doc.repositories.DocumentFileRepository;
import com.meta.doc.repositories.DocsRepo;
import com.meta.doc.services.DocumentFileService;
import com.meta.doc.services.FileService;
import com.meta.doc.services.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentFileServiceImpl implements DocumentFileService {

    private final DocumentFileRepository documentFileRepository;
    private final DocsRepo docsRepository;
    private final FileService fileService;

    @Autowired
    private RedisService redisService;
    private static final long CACHE_TTL = 3600;
    @Value("${project.file.path}")
    private String basePath;

    public DocumentFileServiceImpl(
            DocumentFileRepository documentFileRepository,
            DocsRepo docsRepository,
            FileService fileService,
            RedisService redisService) {
        this.documentFileRepository = documentFileRepository;
        this.docsRepository = docsRepository;
        this.fileService = fileService;
        this.redisService = redisService;
    }

    @Override
    public DocumentFileDTO addFileToDocument(String documentId, MultipartFile file) throws IOException {
        // Find the document
        Docs document = docsRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));



        // Upload the file
        String storedFileName = fileService.uploadResource(basePath, file);

        // Create DocumentFile entity
        DocumentFile documentFile = new DocumentFile();
        documentFile.setId(UUID.randomUUID().toString());
        documentFile.setDocument(document);
        documentFile.setOriginalFileName(file.getOriginalFilename());
        documentFile.setStoredFileName(storedFileName);
        documentFile.setFilePath(basePath);
        documentFile.setFileType(file.getContentType());
        // Save the file metadata
        // Save the file metadata
        DocumentFile savedFile = documentFileRepository.save(documentFile);

        // Convert and return DTO
        DocumentFileDTO fileDTO = convertToDTO(savedFile);

        // Cache the file metadata
        redisService.set("docfile:" + fileDTO.getId(), fileDTO, CACHE_TTL);

        // Invalidate files cache for the document
        redisService.delete("docfiles:" + documentId);
        // Convert and return DTO
        return fileDTO;
    }

    @Override
    public List<DocumentFileDTO> getFilesForDocument(String documentId) {
        String cacheKey = "docfiles:" + documentId;
        List<DocumentFileDTO> cachedFiles = redisService.get(cacheKey, List.class);
        if (cachedFiles != null) {
            return cachedFiles;
        }
        List<DocumentFileDTO> files = documentFileRepository.findByDocument_Id(documentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Cache the result
        redisService.set(cacheKey, files, CACHE_TTL);

        return files;
    }

    @Override
    public void deleteDocumentFile(String fileId) {
        DocumentFile file = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));

        String documentId = file.getDocument().getId();

        documentFileRepository.delete(file);

        // Remove file from cache
        redisService.delete("docfile:" + fileId);
        redisService.delete("docfiles:" + documentId);
    }

    private DocumentFileDTO convertToDTO(DocumentFile documentFile) {
        DocumentFileDTO dto = new DocumentFileDTO();
        dto.setId(documentFile.getId());
        dto.setOriginalFileName(documentFile.getOriginalFileName());
        dto.setStoredFileName(documentFile.getStoredFileName());
        dto.setFileType(documentFile.getFileType());
        return dto;
    }
}
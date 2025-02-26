package com.meta.doc.services;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.dtos.DocumentFileDTO;
import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.repositories.DocumentFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DocumentFileServiceTest extends BaseIntegrationTest {

    @Autowired
    private DocumentFileService documentFileService;

    @Autowired
    private DocsService docsService;

    @Autowired
    private DocumentFileRepository documentFileRepository;

    @Value("${project.file.path}")
    private String testFilesPath;

    private DocsDTO testDoc;

    @BeforeEach
    void setup() throws IOException {
        // Clean up database
        documentFileRepository.deleteAll();
        
        // Create test files directory if it doesn't exist
        Path directory = Paths.get(testFilesPath).normalize();
        Files.createDirectories(directory);
        
        // Create a test document
        DocsDTO doc = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Test Doc",
            "Test Content",
            null,
            null,
            0
        );
        testDoc = docsService.saveDocs(doc);
    }

    @Test
    void shouldAddFileToDocument() throws IOException {
        // Given
        String content = "test file content";
        MockMultipartFile file = new MockMultipartFile(
            "test-file.txt",
            "test-file.txt",
            "text/plain",
            content.getBytes()
        );

        // When
        DocumentFileDTO savedFile = documentFileService.addFileToDocument(testDoc.getId(), file);

        // Then
        assertNotNull(savedFile);
        assertNotNull(savedFile.getId());
        assertEquals("test-file.txt", savedFile.getOriginalFileName());
        
        // Verify file is retrievable
        List<DocumentFileDTO> files = documentFileService.getFilesForDocument(testDoc.getId());
        assertFalse(files.isEmpty());
        assertEquals(1, files.size());
        assertEquals(savedFile.getId(), files.get(0).getId());
    }

    @Test
    void shouldDeleteFile() throws IOException {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "test-file.txt",
            "test-file.txt",
            "text/plain",
            "content".getBytes()
        );
        DocumentFileDTO savedFile = documentFileService.addFileToDocument(testDoc.getId(), file);

        // When
        documentFileService.deleteDocumentFile(savedFile.getId());

        // Then
        List<DocumentFileDTO> files = documentFileService.getFilesForDocument(testDoc.getId());
        assertTrue(files.isEmpty());
    }

    @Test
    void shouldGetFilesForDocument() throws IOException {
        // Given
        MockMultipartFile file1 = new MockMultipartFile(
            "file1.txt",
            "file1.txt",
            "text/plain",
            "content1".getBytes()
        );
        MockMultipartFile file2 = new MockMultipartFile(
            "file2.txt",
            "file2.txt",
            "text/plain",
            "content2".getBytes()
        );

        // When
        documentFileService.addFileToDocument(testDoc.getId(), file1);
        documentFileService.addFileToDocument(testDoc.getId(), file2);

        // Then
        List<DocumentFileDTO> files = documentFileService.getFilesForDocument(testDoc.getId());
        assertEquals(2, files.size());
        assertTrue(files.stream().anyMatch(f -> f.getOriginalFileName().equals("file1.txt")));
        assertTrue(files.stream().anyMatch(f -> f.getOriginalFileName().equals("file2.txt")));
    }
} 
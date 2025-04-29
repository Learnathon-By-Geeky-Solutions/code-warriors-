package com.meta.doc.services;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.entities.Docs; // Import the entity
import com.meta.doc.repositories.DocsRepo;
import com.meta.doc.repositories.DocumentFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentFileServiceTest extends BaseIntegrationTest {


    @Autowired
    private DocsService docsService;

    @Autowired
    private DocsRepo docsRepository; // Inject the DocsRepository

    @Autowired
    private DocumentFileRepository documentFileRepository;

    @Value("${project.file.path}")
    private String testFilesPath;

    @BeforeEach
    void setup() throws IOException {
        // Clean up database
        documentFileRepository.deleteAll();

        // Create test files directory if it doesn't exist
        Path directory = Paths.get(testFilesPath).normalize();
        Files.createDirectories(directory);

        // Create a test document without a specific ID
        DocsDTO docDTO = DocsDTO.builder()
                .teamId("teamId")
                .officeId("officeId")
                .title("title")
                .content("content")
                .parentId("parentId")
                .rootGrandparentId("rootGrandparentId")
                .children(new ArrayList<>())
                .level(0)
                .files(new ArrayList<>())
                .build();

        DocsDTO savedDocDTO = docsService.saveDocs(docDTO); // Save and get DTO
        Optional<Docs> retrievedDocOptional = docsRepository.findById(savedDocDTO.getId());
        assertTrue(retrievedDocOptional.isPresent(), "Failed to retrieve saved Doc");
        Docs retrievedDoc = retrievedDocOptional.get();
        docsService.convertToDTO(retrievedDoc); // Convert for consistency in tests
    }
}

package com.meta.doc.controllers;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.services.DocsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.file.Path;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ResourceControllerTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DocsService docsService;

    @TempDir
    Path tempDir;

    private DocsDTO testDoc;

    @BeforeEach
    void setUp() {
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

    private String uploadFile(String filename, String contentType, byte[] content) throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            filename,
            contentType,
            content
        );

        String response = mockMvc.perform(MockMvcRequestBuilders.multipart("/ds/v1/docs/{documentId}/files", testDoc.getId())
                .file(file))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract and return the stored filename from the response
        return response.split("\"storedFileName\":\"")[1].split("\"")[0];
    }

    
} 
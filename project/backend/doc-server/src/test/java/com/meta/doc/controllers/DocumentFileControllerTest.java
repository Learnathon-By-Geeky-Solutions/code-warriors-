package com.meta.doc.controllers;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.services.DocsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.nio.file.Path;
import java.util.UUID;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class DocumentFileControllerTest extends BaseIntegrationTest {

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DocsService docsService;

    @TempDir
    Path tempDir;

    private DocsDTO testDoc;

    @BeforeEach
    void setUp() {
        // Create a test document using the builder pattern
        DocsDTO doc = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Test Doc")
                .content("Test Content")
                .level(0)
                .build();
        testDoc = docsService.saveDocs(doc);
    }

    @Test
    void shouldUploadFile() throws Exception {
        // Create a mock file
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.txt",
            MediaType.TEXT_PLAIN_VALUE,
            "Hello, World!".getBytes()
        );

        // Perform the upload
        mockMvc.perform(MockMvcRequestBuilders.multipart("/ds/v1/docs/{documentId}/files", testDoc.getId())
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.originalFileName").value("test.txt"));
    }

    @Test
    void shouldListFiles() throws Exception {
        // First upload a file
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.txt",
            MediaType.TEXT_PLAIN_VALUE,
            "Hello, World!".getBytes()
        );

        mockMvc.perform(MockMvcRequestBuilders.multipart("/ds/v1/docs/{documentId}/files", testDoc.getId())
                .file(file))
                .andExpect(status().isOk());

        // Then get the list of files
        mockMvc.perform(MockMvcRequestBuilders.get("/ds/v1/docs/{documentId}/files", testDoc.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].originalFileName").value("test.txt"));
    }

    @Test
    void shouldDeleteFile() throws Exception {
        // First upload a file
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.txt",
            MediaType.TEXT_PLAIN_VALUE,
            "Hello, World!".getBytes()
        );

        String response = mockMvc.perform(MockMvcRequestBuilders.multipart("/ds/v1/docs/{documentId}/files", testDoc.getId())
                .file(file))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract the file ID from the response
        String fileId = response.split("\"id\":\"")[1].split("\"")[0];

        // Delete the file
        mockMvc.perform(MockMvcRequestBuilders.delete("/ds/v1/docs/{documentId}/files/{fileId}", 
                testDoc.getId(), fileId))
                .andExpect(status().isNoContent());

        // Verify the file is deleted
        mockMvc.perform(MockMvcRequestBuilders.get("/ds/v1/docs/{documentId}/files", testDoc.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
} 
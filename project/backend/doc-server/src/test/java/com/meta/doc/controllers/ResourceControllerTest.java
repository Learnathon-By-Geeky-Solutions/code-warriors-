package com.meta.doc.controllers;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.services.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;


import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ResourceControllerTest extends BaseIntegrationTest {

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FileService fileService;



    @BeforeEach
    void setUp() throws FileNotFoundException {
        // Mock FileService behavior
        when(fileService.getResource(Mockito.anyString(), Mockito.anyString()))
                .thenReturn(new ByteArrayInputStream("Test file content".getBytes()));
    }

    @Test
    void shouldDownloadResource() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/ds/v1/resource/test.txt"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(content().string("Test file content"));
    }

    @Test
    void shouldReturnNotFoundForInvalidFile() throws Exception {
        when(fileService.getResource(Mockito.anyString(), Mockito.anyString())).thenThrow(new RuntimeException("File not found"));

        mockMvc.perform(MockMvcRequestBuilders.get("/ds/v1/resource/nonexistent.txt"))
                .andExpect(status().isInternalServerError());
    }
}

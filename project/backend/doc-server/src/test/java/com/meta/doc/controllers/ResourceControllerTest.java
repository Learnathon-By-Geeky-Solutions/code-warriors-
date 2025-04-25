package com.meta.doc.controllers;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.services.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;

import static org.mockito.Mockito.when;


@AutoConfigureMockMvc
class ResourceControllerTest extends BaseIntegrationTest {

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FileService fileService;

    private final String TEST_DOC_ID = "test-doc-id";
    private final String TEST_FILE_NAME = "test-file.txt";
    private final String NON_EXISTENT_FILE = "nonexistent.txt";

    @BeforeEach
    void setUp() throws FileNotFoundException {
        // Mock FileService behavior for a valid file
        when(fileService.getResource(TEST_DOC_ID, TEST_FILE_NAME))
                .thenReturn(new ByteArrayInputStream("Test file content".getBytes()));

        // Mock FileService behavior for an invalid file
        when(fileService.getResource(Mockito.anyString(), Mockito.eq(NON_EXISTENT_FILE)))
                .thenThrow(new RuntimeException("File not found"));
    }





    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}
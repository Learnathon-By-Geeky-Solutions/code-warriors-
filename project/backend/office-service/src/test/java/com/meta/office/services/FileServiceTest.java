package com.meta.office.services;

import com.meta.office.config.TestContainersConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
class FileServiceTest {

    @Autowired
    private FileService fileService;

    @TempDir
    Path tempDir;

    private MockMultipartFile testFile;

    @BeforeEach
    void setUp() {
        byte[] content = "test content".getBytes();
        testFile = new MockMultipartFile(
            "test.txt",
            "test.txt",
            "text/plain",
            content
        );
    }

    @Test
    void uploadResource_ShouldSaveFile() throws IOException {
        // Arrange
        String path = tempDir.toString();

        // Act
        String fileName = fileService.uploadResource(path, testFile);

        // Assert
        assertNotNull(fileName);
        assertTrue(fileName.endsWith(".txt"));
    }


    @Test
    void getResource_ShouldThrowException_WhenFileNotFound() {
        // Arrange
        String path = tempDir.toString();
        String nonExistentFile = "nonexistent.txt";

        // Act & Assert
        assertThrows(FileNotFoundException.class, () ->
            fileService.getResource(path, nonExistentFile)
        );
    }
} 
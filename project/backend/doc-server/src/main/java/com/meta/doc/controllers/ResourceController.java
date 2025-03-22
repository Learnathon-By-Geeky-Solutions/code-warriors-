package com.meta.doc.controllers;

import com.meta.doc.services.FileService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;

/**
 * Controller for handling resource file operations such as downloading.
 */
@RestController
@RequestMapping("/ds/v1/resource")
public class ResourceController {

    private final FileService fileService;
    private final String path;

    /**
     * Constructor-based dependency injection.
     * @param fileService The service to handle file operations.
     * @param path The file storage path.
     */
    public ResourceController(FileService fileService, @Value("${project.file.path}") String path) {
        this.fileService = fileService;
        this.path = path;
    }

    /**
     * Downloads a resource by its name.
     * @param fileName The name of the file to download.
     * @param response The HTTP response to write the file data.
     * @throws IOException If an error occurs during file retrieval.
     */
    @GetMapping(value = "/{resourceName}")
    public void downloadResource(
            @PathVariable("resourceName") String fileName,
            HttpServletResponse response
    ) throws IOException {
        // Determine content type based on file extension
        String contentType = determineContentType(fileName);
        response.setContentType(contentType);

        // Retrieve the resource as an InputStream and write to the response output stream
        InputStream resource = this.fileService.getResource(path, fileName);
        StreamUtils.copy(resource, response.getOutputStream());
    }

    /**
     * Determines the content type of a file based on its extension.
     * @param fileName The name of the file.
     * @return The corresponding MIME type.
     */
    private String determineContentType(String fileName) {
        if (fileName.toLowerCase().endsWith(".pdf")) return MediaType.APPLICATION_PDF_VALUE;
        if (fileName.toLowerCase().endsWith(".csv")) return MediaType.TEXT_PLAIN_VALUE;
        if (fileName.toLowerCase().endsWith(".xls")) return "application/vnd.ms-excel";
        if (fileName.toLowerCase().endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (fileName.toLowerCase().endsWith(".zip")) return "application/zip";
        return MediaType.APPLICATION_OCTET_STREAM_VALUE; // Default binary stream
    }
}

package com.meta.doc.controllers;

import com.meta.doc.services.FileService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;


@RestController
@RequestMapping("/ds/v1/resource")
public class ResourceController {
    @Autowired
    private FileService fileService;

    @Value("${project.file.path}")
    private String path;

    @GetMapping(value = "/{resourceName}")
    public void downloadResource(
            @PathVariable("resourceName") String fileName,
            HttpServletResponse response
    ) throws IOException {
        // Determine content type based on file extension
        String contentType = determineContentType(fileName);
        response.setContentType(contentType);

        InputStream resource = this.fileService.getResource(path, fileName);
        StreamUtils.copy(resource, response.getOutputStream());
    }

    private String determineContentType(String fileName) {
        if (fileName.toLowerCase().endsWith(".pdf")) return MediaType.APPLICATION_PDF_VALUE;
        if (fileName.toLowerCase().endsWith(".csv")) return MediaType.TEXT_PLAIN_VALUE;
        if (fileName.toLowerCase().endsWith(".xls")) return "application/vnd.ms-excel";
        if (fileName.toLowerCase().endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (fileName.toLowerCase().endsWith(".zip")) return "application/zip";
        return MediaType.APPLICATION_OCTET_STREAM_VALUE; // default
    }
}

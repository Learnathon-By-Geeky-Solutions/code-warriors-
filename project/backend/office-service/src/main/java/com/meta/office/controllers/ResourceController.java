package com.meta.office.controllers;

import com.meta.office.services.FileService;
import com.meta.office.utils.JwtUtil;

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
@RequestMapping("/os/v1/test")
public class ResourceController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FileService fileService;

    @Value("${project.file.path}")
    private String path;


    @GetMapping
    public String test() {
        return jwtUtil.getUserIdFromToken();
    }

    @PostMapping("/postResource")
    public String postResource(@RequestParam("resource") MultipartFile image) throws IOException {
        // Validate file content type before processing
        validateFileType(image);

        // Sanitize the path before passing to service
        String sanitizedPath = sanitizePath(path);

        // Now call the service method with validated inputs
        String result = this.fileService.uploadResource(sanitizedPath, image);

        // Sanitize the result before returning it
        return sanitizeFilename(result);
    }

    @GetMapping(value = "/resource/{resourceName}", produces = MediaType.IMAGE_JPEG_VALUE)
    public void downloadResource(@PathVariable("resourceName") String imageName, HttpServletResponse response) throws IOException {
        // Sanitize the filename before processing
        String sanitizedImageName = sanitizeFilename(imageName);
        String sanitizedPath = sanitizePath(path);

        InputStream resource = this.fileService.getResource(sanitizedPath, sanitizedImageName);
        response.setContentType(MediaType.IMAGE_JPEG_VALUE);
        StreamUtils.copy(resource, response.getOutputStream());
    }

    // Helper method to validate file type
    private void validateFileType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }

    // Helper method to sanitize filenames
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return null;
        }

        // Remove any path traversal characters
        String sanitized = filename.replaceAll("[.]{2,}|[/\\\\]", "");

        // Ensure it's just a simple filename without paths
        int lastSeparatorIndex = Math.max(
                sanitized.lastIndexOf('/'),
                sanitized.lastIndexOf('\\')
        );

        if (lastSeparatorIndex >= 0) {
            sanitized = sanitized.substring(lastSeparatorIndex + 1);
        }

        return sanitized;
    }

    // Helper method to sanitize paths
    private String sanitizePath(String path) {
        if (path == null) {
            throw new IllegalArgumentException("Path cannot be null");
        }

        return path.replaceAll("[.]{2,}", "");
    }
}
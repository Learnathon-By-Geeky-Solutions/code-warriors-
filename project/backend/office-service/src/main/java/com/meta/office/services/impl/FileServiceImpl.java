package com.meta.office.services.impl;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.meta.office.services.FileService;

@Service
public class FileServiceImpl implements FileService {

    @Override
    public String uploadResource(String path, MultipartFile file) throws IOException {
        // Safely extract file extension
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";

        if (originalFilename != null && !originalFilename.isEmpty()) {
            int lastDotIndex = originalFilename.lastIndexOf(".");
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex);
                // Validate extension - only allow specific extensions if needed
                if (!isValidExtension(fileExtension)) {
                    fileExtension = ".bin"; // Default to a safe extension
                }
            }
        }

        // Generate random name for file
        String randomID = UUID.randomUUID().toString();
        String safeFileName = randomID + fileExtension;

        // Full path
        String filePath = path + File.separator + safeFileName;

        // Create folder if not created
        File f = new File(path);
        if (!f.exists()) {
            f.mkdir();
        }

        // File copy
        Files.copy(file.getInputStream(), Paths.get(filePath));

        return safeFileName;
    }

    // Helper method to validate file extensions
    private boolean isValidExtension(String extension) {
        // Add your allowed extensions here
        String[] allowedExtensions = {".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".txt"};
        for (String ext : allowedExtensions) {
            if (ext.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public InputStream getResource(String path, String fileName) throws FileNotFoundException {
        // Validate fileName to prevent path traversal attacks
        if (fileName == null || fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String fullPath = path + File.separator + fileName;
        InputStream is = new FileInputStream(fullPath);
        // db logic to return inputstream
        return is;
    }
}
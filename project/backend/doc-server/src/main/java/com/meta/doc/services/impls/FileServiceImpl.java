package com.meta.doc.services.impls;

import java.io.IOException;
import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.InputStream;
import java.io.FileNotFoundException;
import java.nio.file.Files;

import com.meta.doc.services.FileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class FileServiceImpl implements FileService {

    @Override
    public String uploadResource(String path, MultipartFile file) throws IOException {
        Path directory = Paths.get(path).normalize();
        Files.createDirectories(directory);

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = directory.resolve(fileName);
        
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath);
        }
        return fileName;
    }

    @Override
    public InputStream getResource(String path, String fileName) throws FileNotFoundException {
        Path filePath = Paths.get(path).resolve(fileName).normalize();
        try {
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new FileNotFoundException("File not found: " + filePath);
        }
    }
}
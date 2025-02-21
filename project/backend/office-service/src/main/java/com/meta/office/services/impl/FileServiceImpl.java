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

        // File name
        String name = file.getOriginalFilename();
        // abc.png

        // random name generate file
        String randomID = UUID.randomUUID().toString();
        String fileName1 = randomID.concat(name.substring(name.lastIndexOf(".")));

        // Full path
        String filePath = path + File.separator + fileName1;

        // create folder if not created
        File f = new File(path);
        if (!f.exists()) {
            f.mkdir();
        }

        // file copy

        Files.copy(file.getInputStream(), Paths.get(filePath));

        return fileName1;
    }

    @Override
    public InputStream getResource(String path, String fileName) throws FileNotFoundException {
        String fullPath = path + File.separator + fileName;
        InputStream is = new FileInputStream(fullPath);
        // db logic to return inpustream
        return is;
    }

}
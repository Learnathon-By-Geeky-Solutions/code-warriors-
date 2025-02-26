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
        return this.fileService.uploadResource(path, image);
    }

    @GetMapping(value = "/resource/{resourceName}",produces = MediaType.IMAGE_JPEG_VALUE)
    public void downloadResource( @PathVariable("resourceName") String imageName, HttpServletResponse response) throws IOException {

        InputStream resource = this.fileService.getResource(path, imageName);
        response.setContentType(MediaType.IMAGE_JPEG_VALUE);
        StreamUtils.copy(resource,response.getOutputStream())   ;

    }

}

package com.saas.Dashboard.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(@Value("${file.upload-dir:/tmp/uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file, String tenantId, String userEmail) {
        String originalName = file.getOriginalFilename() != null
            ? file.getOriginalFilename()
            : "file";
        String storedName = UUID.randomUUID() + "_" + sanitize(originalName);

        try {
            Path targetDir = uploadRoot
                .resolve(sanitize(tenantId))
                .resolve(sanitizeEmail(userEmail));
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(storedName);
            file.transferTo(targetPath.toFile());
            return targetPath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalName, e);
        }
    }

    public Resource loadFileAsResource(String storedPath) {
        try {
            Path path = Paths.get(storedPath).normalize();
            if (!path.startsWith(uploadRoot)) {
                throw new RuntimeException("Access denied");
            }
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found", e);
        }
    }

    public void deleteFile(String storedPath) {
        try {
            Path path = Paths.get(storedPath).normalize();
            if (path.startsWith(uploadRoot)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    private String sanitize(String value) {
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sanitizeEmail(String email) {
        return email.replace("@", "_at_").replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

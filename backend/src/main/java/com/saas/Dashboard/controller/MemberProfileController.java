package com.saas.Dashboard.controller;

import com.saas.Dashboard.dto.ProfileUpdateRequest;
import com.saas.Dashboard.entity.MemberProfile;
import com.saas.Dashboard.service.MemberProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class MemberProfileController {

    private final MemberProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<MemberProfile> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<MemberProfile> updateMyProfile(
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }

    @PostMapping("/documents")
    public ResponseEntity<MemberProfile> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {
        return ResponseEntity.ok(profileService.uploadDocument(file, documentType));
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<MemberProfile> deleteDocument(
            @PathVariable String documentId) {
        return ResponseEntity.ok(profileService.deleteDocument(documentId));
    }

    @GetMapping("/members")
    public ResponseEntity<List<MemberProfile>> getAllMemberProfiles() {
        return ResponseEntity.ok(profileService.getAllProfilesForAdmin());
    }

    @GetMapping("/members/{email}")
    public ResponseEntity<MemberProfile> getMemberProfile(@PathVariable String email) {
        return ResponseEntity.ok(profileService.getProfileForAdmin(email));
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String documentId) {
        Resource resource = profileService.downloadDocument(documentId);
        String contentType = profileService.getDocumentContentType(documentId);
        String fileName = profileService.getDocumentOriginalName(documentId);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(
                contentType != null ? contentType : "application/octet-stream"))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + fileName + "\"")
            .body(resource);
    }
}

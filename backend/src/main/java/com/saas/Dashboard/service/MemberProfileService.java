package com.saas.Dashboard.service;

import com.saas.Dashboard.dto.ProfileUpdateRequest;
import com.saas.Dashboard.entity.MemberProfile;
import com.saas.Dashboard.entity.User;
import com.saas.Dashboard.repository.MemberProfileRepository;
import com.saas.Dashboard.repository.UserRepository;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

    private final MemberProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public MemberProfile getMyProfile() {
        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();

        return profileRepository.findByTenantIdAndUserEmail(tenantId, email)
            .orElseGet(() -> {
                MemberProfile profile = new MemberProfile();
                profile.setTenantId(tenantId);
                profile.setUserEmail(email);
                return profileRepository.save(profile);
            });
    }

    public MemberProfile updateMyProfile(ProfileUpdateRequest request) {
        MemberProfile profile = getMyProfile();

        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setEducation(request.getEducation());
        profile.setDesignation(request.getDesignation());
        profile.setDepartment(request.getDepartment());
        profile.setUpdatedAt(LocalDateTime.now());

        return profileRepository.save(profile);
    }

    public MemberProfile uploadDocument(MultipartFile file, String documentType) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();
        MemberProfile profile = getMyProfile();

        String storedPath = fileStorageService.storeFile(file, tenantId, email);

        MemberProfile.ProfileDocument doc = new MemberProfile.ProfileDocument();
        doc.setId(UUID.randomUUID().toString());
        doc.setOriginalName(file.getOriginalFilename());
        doc.setStoredName(Paths.get(storedPath).getFileName().toString());
        doc.setDocumentType(documentType != null ? documentType : "OTHER");
        doc.setContentType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setStoredPath(storedPath);
        doc.setUploadedAt(LocalDateTime.now());

        profile.getDocuments().add(doc);
        profile.setUpdatedAt(LocalDateTime.now());

        return profileRepository.save(profile);
    }

    public MemberProfile deleteDocument(String documentId) {
        MemberProfile profile = getMyProfile();
        MemberProfile.ProfileDocument doc = findDocument(profile, documentId);

        fileStorageService.deleteFile(doc.getStoredPath());
        profile.getDocuments().remove(doc);
        profile.setUpdatedAt(LocalDateTime.now());

        return profileRepository.save(profile);
    }

    public List<MemberProfile> getAllProfilesForAdmin() {
        requireOrgAdmin();
        String tenantId = TenantContext.getTenantId();

        List<User> users = userRepository.findAllByTenantId(tenantId);
        Map<String, MemberProfile> profileByEmail = profileRepository
            .findAllByTenantId(tenantId)
            .stream()
            .collect(Collectors.toMap(MemberProfile::getUserEmail, p -> p, (a, b) -> a));

        return users.stream()
            .map(user -> profileByEmail.getOrDefault(user.getEmail(), emptyProfile(tenantId, user.getEmail())))
            .collect(Collectors.toList());
    }

    private MemberProfile emptyProfile(String tenantId, String email) {
        MemberProfile profile = new MemberProfile();
        profile.setTenantId(tenantId);
        profile.setUserEmail(email);
        return profile;
    }

    public MemberProfile getProfileForAdmin(String userEmail) {
        requireOrgAdmin();
        return profileRepository
            .findByTenantIdAndUserEmail(TenantContext.getTenantId(), userEmail)
            .orElse(emptyProfile(TenantContext.getTenantId(), userEmail));
    }

    public Resource downloadDocument(String documentId) {
        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();
        String role = TenantContext.getRole();

        MemberProfile profile;
        if ("ORG_ADMIN".equals(role)) {
            profile = profileRepository.findAllByTenantId(tenantId).stream()
                .filter(p -> p.getDocuments().stream()
                    .anyMatch(d -> d.getId().equals(documentId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Document not found"));
        } else {
            profile = profileRepository
                .findByTenantIdAndUserEmail(tenantId, email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        }

        MemberProfile.ProfileDocument doc = findDocument(profile, documentId);
        return fileStorageService.loadFileAsResource(doc.getStoredPath());
    }

    public String getDocumentContentType(String documentId) {
        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();
        String role = TenantContext.getRole();

        MemberProfile profile;
        if ("ORG_ADMIN".equals(role)) {
            profile = profileRepository.findAllByTenantId(tenantId).stream()
                .filter(p -> p.getDocuments().stream()
                    .anyMatch(d -> d.getId().equals(documentId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Document not found"));
        } else {
            profile = profileRepository
                .findByTenantIdAndUserEmail(tenantId, email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        }

        return findDocument(profile, documentId).getContentType();
    }

    public String getDocumentOriginalName(String documentId) {
        String tenantId = TenantContext.getTenantId();
        String role = TenantContext.getRole();
        String email = TenantContext.getEmail();

        MemberProfile profile;
        if ("ORG_ADMIN".equals(role)) {
            profile = profileRepository.findAllByTenantId(tenantId).stream()
                .filter(p -> p.getDocuments().stream()
                    .anyMatch(d -> d.getId().equals(documentId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Document not found"));
        } else {
            profile = profileRepository
                .findByTenantIdAndUserEmail(tenantId, email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        }

        return findDocument(profile, documentId).getOriginalName();
    }

    private MemberProfile.ProfileDocument findDocument(MemberProfile profile, String documentId) {
        return profile.getDocuments().stream()
            .filter(d -> d.getId().equals(documentId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    private void requireOrgAdmin() {
        if (!"ORG_ADMIN".equals(TenantContext.getRole())) {
            throw new RuntimeException("Access denied. Organisation admin only.");
        }
    }
}

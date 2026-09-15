package com.saas.Dashboard.repository;

import com.saas.Dashboard.entity.MemberProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MemberProfileRepository extends MongoRepository<MemberProfile, String> {
    Optional<MemberProfile> findByTenantIdAndUserEmail(String tenantId, String userEmail);
    List<MemberProfile> findAllByTenantId(String tenantId);
    boolean existsByTenantIdAndUserEmail(String tenantId, String userEmail);
}

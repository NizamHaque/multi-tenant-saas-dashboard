package com.saas.Dashboard.repository;

import com.saas.Dashboard.entity.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface TenantRepository extends MongoRepository<Tenant, String> {
    Optional<Tenant> findBySubdomain(String subdomain);
    boolean existsByName(String name);
    boolean existsBySubdomain(String subdomain);
}
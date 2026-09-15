package com.saas.Dashboard.security;

public class TenantContext {

    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();
    private static final ThreadLocal<String> currentRole = new ThreadLocal<>();
    private static final ThreadLocal<String> currentEmail = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getTenantId() {
        return currentTenant.get();
    }

    public static void setRole(String role) {
        currentRole.set(role);
    }

    public static String getRole() {
        return currentRole.get();
    }

    public static void setEmail(String email) {
        currentEmail.set(email);
    }

    public static String getEmail() {
        return currentEmail.get();
    }

    public static void clear() {
        currentTenant.remove();
        currentRole.remove();
        currentEmail.remove();
    }
}
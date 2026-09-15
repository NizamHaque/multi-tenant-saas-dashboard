package com.saas.Dashboard.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String address;
    private String dateOfBirth;
    private String education;
    private String designation;
    private String department;
}

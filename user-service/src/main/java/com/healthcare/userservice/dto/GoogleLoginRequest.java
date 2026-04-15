package com.healthcare.userservice.dto;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String token;
    private String role;
}

package com.atob.atobapp.dto;

import java.time.LocalDateTime;

public class ApiErrorDTO {
    public int status;
    public String error;
    public String message;
    public String path;
    public LocalDateTime timestamp;

    public ApiErrorDTO(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }
}

package com.meta.project.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standardized error response model for API error messages.
 * Provides consistent structure for all error responses returned by the application.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponsee {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    /**
     * Creates an error response with the current timestamp.
     */
    public static ErrorResponsee of(int status, String error, String message, String path) {
        return ErrorResponsee.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }
}
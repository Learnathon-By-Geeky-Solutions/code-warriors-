package com.meta.user.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private boolean enabled;
    private Map<String, List<String>> attributes;
}
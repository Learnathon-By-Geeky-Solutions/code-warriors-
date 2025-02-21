package com.meta.office.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeDTO {

    private String id;

//    @NotBlank(message = "Name is required")
    private String name;

//    @NotBlank(message = "Physical address is required")
    private String physicalAddress;

    private String helpCenterNumber;

//    @Email(message = "Invalid email format")
//    @NotBlank(message = "Email is required")
    private String email;

    private String logoUrl;
    private String websiteUrl;
    private String description;
    private String officePolicy;
}

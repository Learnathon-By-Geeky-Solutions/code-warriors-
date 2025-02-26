package com.meta.office.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Office {
    @Id
    private String id;

    private String name;

    @Column(length = 9999)
    private String physicalAddress;

    private String helpCenterNumber;

    private String email;

    private String logoUrl;

    private String websiteUrl;

    @Column(length = 99999)
    private String description;

    @Column(length = 99999)
    private String officePolicy;
}

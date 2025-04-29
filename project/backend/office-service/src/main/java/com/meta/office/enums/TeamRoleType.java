package com.meta.office.enums;

import com.meta.office.exceptions.InvalidRoleException;

public enum TeamRoleType {

    // Leadership Roles
    TEAM_LEADER(201, "Team Leader"),
    PRODUCT_OWNER(202, "Product Owner"),
    SCRUM_MASTER(203, "Scrum Master"),
    PROJECT_MANAGER(204, "Project Manager"),
    PROGRAM_MANAGER(205, "Program Manager"),
    DELIVERY_MANAGER(206, "Delivery Manager"),

    // Technical Roles
    DEVELOPER(207, "Developer"),
    ARCHITECT(208, "Architect"),
    QA_ENGINEER(209, "QA Engineer"),
    DEVOPS_ENGINEER(210, "DevOps Engineer"),
    DATA_ENGINEER(211, "Data Engineer"),
    CLOUD_ENGINEER(212, "Cloud Engineer"),
    SECURITY_ENGINEER(213, "Security Engineer"),
    NETWORK_ENGINEER(214, "Network Engineer"),
    SYSTEM_ADMIN(215, "System Admin"),
    DATABASE_ADMIN(216, "Database Admin"),

    // Creative and Analytical Roles
    UX_DESIGNER(217, "UX Designer"),
    UI_DESIGNER(218, "UI Designer"),
    GRAPHIC_DESIGNER(219, "Graphic Designer"),
    DATA_SCIENTIST(220, "Data Scientist"),
    BUSINESS_ANALYST(221, "Business Analyst"),
    RESEARCH_ANALYST(222, "Research Analyst"),

    // Support and Infrastructure Roles
    TECHNICAL_WRITER(223, "Technical Writer"),
    TRAINER(224, "Trainer"),
    SECURITY_SPECIALIST(225, "Security Specialist"),
    CUSTOMER_SUPPORT(226, "Customer Support"),
    HELP_DESK_SUPPORT(227, "Help Desk Support"),
    IT_SUPPORT_ENGINEER(228, "IT Support Engineer"),

    // Operations and Maintenance Roles
    SITE_RELIABILITY_ENGINEER(229, "Site Reliability Engineer"),
    OPERATIONS_MANAGER(230, "Operations Manager"),
    INCIDENT_MANAGER(231, "Incident Manager"),
    CONFIGURATION_MANAGER(232, "Configuration Manager"),
    RELEASE_MANAGER(233, "Release Manager"),
    SERVICE_DELIVERY_MANAGER(234, "Service Delivery Manager"),

    // Content and Marketing Roles
    CONTENT_WRITER(235, "Content Writer"),
    COPYWRITER(236, "Copywriter"),
    MARKETING_MANAGER(237, "Marketing Manager"),
    SEO_SPECIALIST(238, "SEO Specialist"),
    SOCIAL_MEDIA_MANAGER(239, "Social Media Manager"),
    DIGITAL_MARKETING_MANAGER(240, "Digital Marketing Manager"),

    // Financial and Legal Roles
    FINANCIAL_ANALYST(241, "Financial Analyst"),
    ACCOUNTANT(242, "Accountant"),
    AUDITOR(243, "Auditor"),
    LEGAL_ADVISOR(244, "Legal Advisor"),
    COMPLIANCE_OFFICER(245, "Compliance Officer"),

    // Administrative Roles
    ADMIN_ASSISTANT(246, "Administrative Assistant"),
    OFFICE_MANAGER(247, "Office Manager"),
    EXECUTIVE_ASSISTANT(248, "Executive Assistant"),

    // Sales and Business Development Roles
    SALES_MANAGER(249, "Sales Manager"),
    BUSINESS_DEVELOPMENT_MANAGER(250, "Business Development Manager"),
    ACCOUNT_MANAGER(251, "Account Manager"),
    CUSTOMER_RELATIONSHIP_MANAGER(252, "Customer Relationship Manager"),

    // Human Resources Roles
    HR_MANAGER(253, "HR Manager"),
    RECRUITER(254, "Recruiter"),
    TALENT_ACQUISITION_SPECIALIST(255, "Talent Acquisition Specialist"),
    TRAINING_COORDINATOR(256, "Training Coordinator"),

    // Product and Innovation Roles
    PRODUCT_MANAGER(257, "Product Manager"),
    INNOVATION_MANAGER(258, "Innovation Manager"),
    UX_RESEARCHER(259, "UX Researcher"),

    // Logistics and Supply Chain Roles
    LOGISTICS_MANAGER(260, "Logistics Manager"),
    SUPPLY_CHAIN_MANAGER(261, "Supply Chain Manager"),
    INVENTORY_MANAGER(262, "Inventory Manager"),

    // Specialized Roles
    AI_ENGINEER(263, "AI Engineer"),
    MACHINE_LEARNING_ENGINEER(264, "Machine Learning Engineer"),
    BLOCKCHAIN_DEVELOPER(265, "Blockchain Developer"),
    IOT_ENGINEER(266, "IoT Engineer"),
    ROBOTICS_ENGINEER(267, "Robotics Engineer"),

    // Education and Training Roles
    EDUCATION_SPECIALIST(268, "Education Specialist"),
    E_LEARNING_DESIGNER(269, "E-Learning Designer"),
    INSTRUCTIONAL_DESIGNER(270, "Instructional Designer"),

    // Creative Arts Roles
    VIDEO_PRODUCER(271, "Video Producer"),
    SOUND_ENGINEER(272, "Sound Engineer"),
    ANIMATOR(273, "Animator"),

    // Healthcare Roles
    MEDICAL_WRITER(274, "Medical Writer"),
    HEALTHCARE_ANALYST(275, "Healthcare Analyst"),
    PHARMACOVIGILANCE_SPECIALIST(276, "Pharmacovigilance Specialist"),

    // Miscellaneous Roles
    INTERN(277, "Intern"),
    CONSULTANT(278, "Consultant"),
    FREELANCER(279, "Freelancer"),
    CONTRACTOR(280, "Contractor"),
    VENDOR_MANAGER(281, "Vendor Manager"),
    PARTNER_RELATIONSHIP_MANAGER(282, "Partner Relationship Manager");

    private final Integer id;
    private final String name;

    TeamRoleType(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public static TeamRoleType fromId(Integer id) {
        for (TeamRoleType role : TeamRoleType.values()) {
            if (role.getId().equals(id)) {
                return role;
            }
        }
        throw new InvalidRoleException(id);
    }

}

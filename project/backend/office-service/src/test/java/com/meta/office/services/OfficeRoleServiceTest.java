package com.meta.office.services;

import com.meta.office.config.TestContainersConfig;
import com.meta.office.dtos.OfficeDTO;
import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.enums.OfficeRoleType;
import com.meta.office.exceptions.InvalidRoleException;
import com.meta.office.repositories.OfficeRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@Import(TestContainersConfig.class)
@ActiveProfiles("test")
class OfficeRoleServiceTest {

    @Autowired
    private OfficeRoleService officeRoleService;

    @Autowired
    private OfficeService officeService;

    @Autowired
    private OfficeRoleRepository officeRoleRepository;

    private OfficeDTO testOffice;
    private String testUserId;

    @BeforeEach
    void setUp() {
        officeRoleRepository.deleteAll();
        testUserId = UUID.randomUUID().toString();
        
        OfficeDTO officeDTO = new OfficeDTO();
        officeDTO.setName("Test Office");
        officeDTO.setPhysicalAddress("Test Address");
        testOffice = officeService.createOffice(officeDTO);
    }

    @Test
    void assignRole_ShouldAssignRoleSuccessfully() {
        // Arrange
        String memberId = UUID.randomUUID().toString();
        OfficeRoleDTO roleDTO = new OfficeRoleDTO();
        roleDTO.setOfficeId(testOffice.getId());
        roleDTO.setMemberId(memberId);
        roleDTO.setRoleId(OfficeRoleType.EMPLOYEE.getId());

        // Act
        OfficeRoleDTO assignedRole = officeRoleService.assignRole(roleDTO);

        // Assert
        assertNotNull(assignedRole);
        assertEquals(roleDTO.getOfficeId(), assignedRole.getOfficeId());
        assertEquals(roleDTO.getMemberId(), assignedRole.getMemberId());
        assertEquals(OfficeRoleType.EMPLOYEE.getName(), assignedRole.getRoleName());
    }

    @Test
    void getRolesByOffice_ShouldReturnAllOfficeRoles() {
        // Arrange
        String memberId = UUID.randomUUID().toString();
        OfficeRoleDTO roleDTO = new OfficeRoleDTO();
        roleDTO.setOfficeId(testOffice.getId());
        roleDTO.setMemberId(memberId);
        roleDTO.setRoleId(OfficeRoleType.EMPLOYEE.getId());
        officeRoleService.assignRole(roleDTO);

        // Act
        List<OfficeRoleDTO> officeRoles = officeRoleService.getRolesByOffice(testOffice.getId());

        // Assert
        assertThat(officeRoles).hasSizeGreaterThanOrEqualTo(1);
        assertThat(officeRoles).extracting("officeId")
                .containsOnly(testOffice.getId());
    }

    @Test
    void hasMemberRole_ShouldReturnTrue_WhenRoleExists() {
        // Arrange
        String memberId = UUID.randomUUID().toString();
        OfficeRoleDTO roleDTO = new OfficeRoleDTO();
        roleDTO.setOfficeId(testOffice.getId());
        roleDTO.setMemberId(memberId);
        roleDTO.setRoleId(OfficeRoleType.EMPLOYEE.getId());
        officeRoleService.assignRole(roleDTO);

        // Act & Assert
        assertTrue(officeRoleService.hasMemberRole(
            memberId,
            OfficeRoleType.EMPLOYEE,
            testOffice.getId()
        ));
    }

    @Test
    void assignRole_ShouldThrowException_WhenInvalidRole() {
        // Arrange
        OfficeRoleDTO roleDTO = new OfficeRoleDTO();
        roleDTO.setOfficeId(testOffice.getId());
        roleDTO.setMemberId(UUID.randomUUID().toString());
        roleDTO.setRoleId(999); // Invalid role ID

        // Act & Assert
        assertThrows(InvalidRoleException.class, () ->
            officeRoleService.assignRole(roleDTO)
        );
    }
} 
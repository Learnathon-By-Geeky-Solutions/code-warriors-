package com.meta.office.services;

import com.meta.office.dtos.OfficeDTO;
import com.meta.office.exceptions.OfficeNotFoundException;
import com.meta.office.repositories.OfficeRepository;
import com.meta.office.utils.JwtUtil;
import com.meta.office.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.annotation.DirtiesContext;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext
class OfficeServiceTest extends BaseIntegrationTest {

    @Autowired
    private OfficeService officeService;

    @Autowired
    private OfficeRepository officeRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    private String testUserId;

    @BeforeEach
    void setUp() {
        officeRepository.deleteAll();
        testUserId = UUID.randomUUID().toString();
        when(jwtUtil.getUserIdFromToken()).thenReturn(testUserId);
    }

    private OfficeDTO createTestOfficeDTO() {
        OfficeDTO officeDTO = new OfficeDTO();
        officeDTO.setName("Test Office");
        officeDTO.setPhysicalAddress("123 Test St");
        officeDTO.setHelpCenterNumber("123-456-7890");
        officeDTO.setEmail("test@office.com");
        return officeDTO;
    }

    @Test
    void createOffice_ShouldCreateOfficeAndAssignAdminRole() {
        // Arrange
        OfficeDTO officeDTO = createTestOfficeDTO();

        // Act
        OfficeDTO createdOffice = officeService.createOffice(officeDTO);

        // Assert
        assertNotNull(createdOffice.getId());
        assertEquals(officeDTO.getName(), createdOffice.getName());
        assertEquals(officeDTO.getPhysicalAddress(), createdOffice.getPhysicalAddress());
        assertTrue(officeService.canAlterOfficeById(testUserId, createdOffice.getId()));
    }

    @Test
    void getOffice_ShouldReturnOffice() {
        // Arrange
        OfficeDTO officeDTO = officeService.createOffice(createTestOfficeDTO());

        // Act
        OfficeDTO retrievedOffice = officeService.getOffice(officeDTO.getId());

        // Assert
        assertEquals(officeDTO.getId(), retrievedOffice.getId());
        assertEquals(officeDTO.getName(), retrievedOffice.getName());
    }

    @Test
    void updateOffice_ShouldUpdateOfficeDetails() {
        // Arrange
        OfficeDTO originalOffice = officeService.createOffice(createTestOfficeDTO());
        OfficeDTO updateDTO = new OfficeDTO();
        updateDTO.setName("Updated Office");
        updateDTO.setPhysicalAddress("456 Updated St");

        // Act
        OfficeDTO updatedOffice = officeService.updateOffice(originalOffice.getId(), updateDTO);

        // Assert
        assertEquals("Updated Office", updatedOffice.getName());
        assertEquals("456 Updated St", updatedOffice.getPhysicalAddress());
    }

    @Test
    void deleteOffice_ShouldRemoveOffice() {
        // Arrange
        OfficeDTO officeDTO = officeService.createOffice(createTestOfficeDTO());

        // Act
        officeService.deleteOffice(officeDTO.getId());

        // Assert
        assertThrows(OfficeNotFoundException.class, () -> 
            officeService.getOffice(officeDTO.getId())
        );
    }

    @Test
    void addOfficePolicy_ShouldUpdateOfficePolicy() {
        // Arrange
        OfficeDTO officeDTO = officeService.createOffice(createTestOfficeDTO());
        String policy = "New office policy";

        // Act
        OfficeDTO updatedOffice = officeService.addOfficePolicy(officeDTO.getId(), policy);

        // Assert
        assertEquals(policy, updatedOffice.getOfficePolicy());
    }
} 
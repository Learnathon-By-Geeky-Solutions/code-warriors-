package com.meta.office.services.impl;

import com.meta.office.dtos.OfficeDTO;
import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.entities.Office;
import com.meta.office.entities.OfficeRole;
import com.meta.office.enums.OfficeRoleType;
import com.meta.office.exceptions.OfficeNotFoundException;
import com.meta.office.repositories.OfficeRepository;
import com.meta.office.repositories.OfficeRoleRepository;
import com.meta.office.services.OfficeRoleService;
import com.meta.office.services.OfficeService;
import com.meta.office.utils.JwtUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OfficeServiceImpl implements OfficeService {

    private final OfficeRepository officeRepository;
    private final ModelMapper modelMapper;
    private final OfficeRoleService officeRoleService;
    private final JwtUtil jwtUtil;
    private final OfficeRoleRepository officeRoleRepository;

    @Autowired
    public OfficeServiceImpl(OfficeRepository officeRepository, ModelMapper modelMapper, OfficeRoleService officeRoleService, JwtUtil jwtUtil, OfficeRoleRepository officeRoleRepository) {
        this.officeRepository = officeRepository;
        this.modelMapper = modelMapper;
        this.officeRoleService = officeRoleService;
        this.jwtUtil = jwtUtil;
        this.officeRoleRepository = officeRoleRepository;
    }

    @Override
    public OfficeDTO createOffice(OfficeDTO officeDTO) {
        String randomId = UUID.randomUUID().toString();  // Generating a random id for the office
        officeDTO.setId(randomId);
        Office office = modelMapper.map(officeDTO, Office.class);
        Office savedOffice = officeRepository.save(office);

        // Assign the creator of the office as an admin
        String creatorId = jwtUtil.getUserIdFromToken();
        if (creatorId != null) {
            OfficeRoleDTO officeRoleDTO = new OfficeRoleDTO();
            officeRoleDTO.setOfficeId(savedOffice.getId());
            officeRoleDTO.setMemberId(creatorId);
            officeRoleDTO.setRoleId(OfficeRoleType.ADMIN.getId());
            officeRoleService.assignRole(officeRoleDTO);
        }

        return modelMapper.map(savedOffice, OfficeDTO.class);
    }

    @Override
    public OfficeDTO getOffice(String id) {
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new OfficeNotFoundException(id));
        return modelMapper.map(office, OfficeDTO.class);
    }

    @Override
    public OfficeDTO updateOffice(String id, OfficeDTO officeDTO) {
        Office existingOffice = officeRepository.findById(id)
                .orElseThrow(() -> new OfficeNotFoundException(id));

        existingOffice.setName(officeDTO.getName());
        existingOffice.setPhysicalAddress(officeDTO.getPhysicalAddress());
        existingOffice.setHelpCenterNumber(officeDTO.getHelpCenterNumber());
        existingOffice.setEmail(officeDTO.getEmail());
        existingOffice.setLogoUrl(officeDTO.getLogoUrl());
        existingOffice.setWebsiteUrl(officeDTO.getWebsiteUrl());
        existingOffice.setDescription(officeDTO.getDescription());

        Office updatedOffice = officeRepository.save(existingOffice);
        return modelMapper.map(updatedOffice, OfficeDTO.class);
    }

    @Override
    public void deleteOffice(String id) {
        if (!officeRepository.existsById(id)) {
            throw new OfficeNotFoundException(id);
        }
        officeRepository.deleteById(id);
    }

    @Override
    public List<OfficeDTO> getAllOffices() {
        List<Office> offices = officeRepository.findAll();
        return offices.stream()
                .map(office -> modelMapper.map(office, OfficeDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<OfficeDTO> getOfficesByUserId() {
        String userId = jwtUtil.getUserIdFromToken();
        System.out.println("Getting office of User ID: " + userId +" THis is from OfficeServiceImpl");
        if (userId == null) {
            throw new RuntimeException("Unauthorized: User ID not found in token.");
        }

        List<OfficeRoleDTO> roles = officeRoleService.getRolesByMember(userId);
        List<String> officeIds = roles.stream()
                .map(OfficeRoleDTO::getOfficeId)
                .distinct()
                .collect(Collectors.toList());

        List<Office> offices = officeRepository.findAllById(officeIds);
        return offices.stream()
                .map(office -> modelMapper.map(office, OfficeDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void leaveOffice(String officeId) {
        String userId = jwtUtil.getUserIdFromToken();
        if (userId == null) {
            throw new RuntimeException("Unauthorized: User ID not found in token.");
        }
        removeUserFromOffice(userId, officeId);
    }

    @Override
    public void removeUserFromOffice(String userId, String officeId) {
        // Verify office exists
        if (!officeRepository.existsById(officeId)) {
            throw new OfficeNotFoundException(officeId);
        }

        // Find all roles for this user in this office and delete them
        List<OfficeRole> userRoles = officeRoleRepository.findByMemberIdAndOfficeId(userId, officeId)
                .stream()
                .collect(Collectors.toList());
        officeRoleRepository.deleteAll(userRoles);
    }

    @Override
    public void deleteOfficeWithRoles(String officeId) {
        // Verify office exists
        if (!officeRepository.existsById(officeId)) {
            throw new OfficeNotFoundException(officeId);
        }

        // Delete all roles associated with this office
        List<OfficeRole> officeRoles = officeRoleRepository.findByOfficeId(officeId);
        officeRoleRepository.deleteAll(officeRoles);

        // Delete the office
        officeRepository.deleteById(officeId);
    }

    @Override
    public boolean canAlterOfficeByToken(String officeId) {
        String userId = jwtUtil.getUserIdFromToken();
        if (userId == null) {
            return false;
        }
        return canAlterOfficeById(userId, officeId);
    }

    @Override
    public boolean canAlterOfficeById(String userId, String officeId) {
        // Check if user has admin role
        boolean isAdmin = officeRoleService.hasMemberRole(userId, OfficeRoleType.ADMIN, officeId);
        if (isAdmin) {
            return true;
        }

        // Check if user has moderator role
        boolean isModerator = officeRoleService.hasMemberRole(userId, OfficeRoleType.MODERATOR, officeId);
        return isModerator;
    }

    @Override
    public OfficeDTO addOfficePolicy(String officeId, String policy) {
        // Validate that the user has admin role
        String userId = jwtUtil.getUserIdFromToken();
        if (userId == null) {
            throw new RuntimeException("Unauthorized: User ID not found in token.");
        }

        // Check if user has admin role for this office
        if (!officeRoleService.hasMemberRole(userId, OfficeRoleType.ADMIN, officeId)) {
            throw new RuntimeException("Unauthorized: Only admins can add office policy.");
        }

        // Find the office
        Office office = officeRepository.findById(officeId)
                .orElseThrow(() -> new OfficeNotFoundException(officeId));

        // Set the office policy
        office.setOfficePolicy(policy);

        // Save the updated office
        Office updatedOffice = officeRepository.save(office);

        // Convert and return the updated office
        return modelMapper.map(updatedOffice, OfficeDTO.class);
    }

}

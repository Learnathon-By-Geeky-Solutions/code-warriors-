package com.meta.office.services.impl;

import com.meta.office.dtos.OfficeRoleDTO;
import com.meta.office.entities.OfficeRole;
import com.meta.office.enums.OfficeRoleType;
import com.meta.office.exceptions.InvalidRoleException;
import com.meta.office.exceptions.OfficeNotFoundException;
import com.meta.office.repositories.OfficeRoleRepository;
import com.meta.office.repositories.OfficeRepository;
import com.meta.office.services.OfficeRoleService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfficeRoleServiceImpl implements OfficeRoleService {

    private final OfficeRoleRepository officeRoleRepository;
    private final OfficeRepository officeRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public OfficeRoleServiceImpl(OfficeRoleRepository officeRoleRepository,
                                 OfficeRepository officeRepository,
                                 ModelMapper modelMapper) {
        this.officeRoleRepository = officeRoleRepository;
        this.officeRepository = officeRepository;
        this.modelMapper = modelMapper;
    }

    private void validateRole(Integer roleId) {
        try {
            OfficeRoleType.fromId(roleId);
        } catch (InvalidRoleException e) {
            throw new InvalidRoleException(roleId);
        }
    }

    private OfficeRoleDTO enrichWithRoleName(OfficeRoleDTO dto) {
        OfficeRoleType officeRoleType = OfficeRoleType.fromId(dto.getRoleId());
        dto.setRoleName(officeRoleType.getName());
        return dto;
    }

    private void validateOffice(String officeId) {
        if (!officeRepository.existsById(officeId)) {
            throw new OfficeNotFoundException(officeId);
        }
    }

    @Override
    public OfficeRoleDTO assignRole(OfficeRoleDTO officeRoleDTO) {
        validateRole(officeRoleDTO.getRoleId());
        validateOffice(officeRoleDTO.getOfficeId());

        OfficeRole officeRole = modelMapper.map(officeRoleDTO, OfficeRole.class);
        OfficeRole savedRole = officeRoleRepository.save(officeRole);
        return enrichWithRoleName(modelMapper.map(savedRole, OfficeRoleDTO.class));
    }

    @Override
    public List<OfficeRoleDTO> getRolesByOffice(String officeId) {
        validateOffice(officeId);
        List<OfficeRole> roles = officeRoleRepository.findByOfficeId(officeId);
        return roles.stream()
                .map(role -> enrichWithRoleName(modelMapper.map(role, OfficeRoleDTO.class)))
                .collect(Collectors.toList());
    }

    @Override
    public List<OfficeRoleDTO> getRolesByMember(String memberId) {
        List<OfficeRole> roles = officeRoleRepository.findByMemberId(memberId);
        return roles.stream()
                .map(role -> enrichWithRoleName(modelMapper.map(role, OfficeRoleDTO.class)))
                .collect(Collectors.toList());
    }

    @Override
    public List<OfficeRoleDTO> getMembersByRole(OfficeRoleType officeRoleType, String officeId) {
        validateOffice(officeId);
        List<OfficeRole> roles = officeRoleRepository.findByRoleIdAndOfficeId(officeRoleType.getId(), officeId);
        return roles.stream()
                .map(role -> enrichWithRoleName(modelMapper.map(role, OfficeRoleDTO.class)))
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasMemberRole(String memberId, OfficeRoleType officeRoleType, String officeId) {
        return officeRoleRepository.findByMemberIdAndOfficeId(memberId, officeId)
                .map(role -> role.getRoleId().equals(officeRoleType.getId()))
                .orElse(false);
    }
}

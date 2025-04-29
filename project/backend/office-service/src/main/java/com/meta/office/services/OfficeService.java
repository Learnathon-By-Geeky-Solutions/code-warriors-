package com.meta.office.services;

import com.meta.office.dtos.OfficeDTO;

import java.util.List;

public interface OfficeService {
    OfficeDTO createOffice(OfficeDTO officeDTO);
    OfficeDTO getOffice(String id);
    OfficeDTO updateOffice(String id, OfficeDTO officeDTO);
    void deleteOffice(String id);
    List<OfficeDTO> getAllOffices();
    List<OfficeDTO> getOfficesByUserId();
    void leaveOffice(String officeId);
    void removeUserFromOffice(String userId, String officeId);
    void deleteOfficeWithRoles(String officeId);
    boolean canAlterOfficeByToken(String officeId);
    boolean canAlterOfficeById(String userId, String officeId);
    OfficeDTO addOfficePolicy(String officeId, String policy);

}

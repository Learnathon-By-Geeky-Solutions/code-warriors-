package com.meta.office.repositories;

import com.meta.office.entities.OfficeRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OfficeRoleRepository extends JpaRepository<OfficeRole, Long> {
    List<OfficeRole> findByOfficeId(String officeId);
    List<OfficeRole> findByMemberId(String memberId);
    Optional<OfficeRole> findByMemberIdAndOfficeId(String memberId, String officeId);
    List<OfficeRole> findByRoleIdAndOfficeId(Integer roleId, String officeId);
}

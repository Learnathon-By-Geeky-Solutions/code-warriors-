package com.meta.office.controllers;

import com.meta.office.dtos.OfficeDTO;
import com.meta.office.services.OfficeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/os/v1/office")
public class OfficeController {
    private final OfficeService officeService;

    @Autowired
    public OfficeController(OfficeService officeService) {
        this.officeService = officeService;
    }

    @PostMapping
    public ResponseEntity<OfficeDTO> createOffice(@RequestBody OfficeDTO officeDTO) {
        return ResponseEntity.ok(officeService.createOffice(officeDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficeDTO> getOffice(@PathVariable String id) {
        return ResponseEntity.ok(officeService.getOffice(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfficeDTO> updateOffice(@PathVariable String id, @RequestBody OfficeDTO officeDTO) {
        return ResponseEntity.ok(officeService.updateOffice(id, officeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffice(@PathVariable String id) {
        officeService.deleteOffice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<OfficeDTO>> getAllOffices() {
        return ResponseEntity.ok(officeService.getAllOffices());
    }

    @GetMapping("/user")
    public ResponseEntity<List<OfficeDTO>> getOfficesByUserId() {
        return ResponseEntity.ok(officeService.getOfficesByUserId());
    }

    @PostMapping("/{officeId}/leave")
    public ResponseEntity<Void> leaveOffice(@PathVariable String officeId) {
        officeService.leaveOffice(officeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{officeId}/users/{userId}")
    public ResponseEntity<Void> removeUserFromOffice(
            @PathVariable String officeId,
            @PathVariable String userId) {
        officeService.removeUserFromOffice(userId, officeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{officeId}/with-roles")
    public ResponseEntity<Void> deleteOfficeWithRoles(@PathVariable String officeId) {
        officeService.deleteOfficeWithRoles(officeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{officeId}/can-alter")
    public ResponseEntity<Boolean> canAlterOfficeByToken(@PathVariable String officeId) {
        return ResponseEntity.ok(officeService.canAlterOfficeByToken(officeId));
    }

    @GetMapping("/{officeId}/users/{userId}/can-alter")
    public ResponseEntity<Boolean> canAlterOfficeById(
            @PathVariable String officeId,
            @PathVariable String userId) {
        return ResponseEntity.ok(officeService.canAlterOfficeById(userId, officeId));
    }

    @PostMapping("/{officeId}/policy")
    public ResponseEntity<OfficeDTO> addOfficePolicy(
            @PathVariable String officeId,
            @RequestBody String policy) {
        return ResponseEntity.ok(officeService.addOfficePolicy(officeId, policy));
    }

}

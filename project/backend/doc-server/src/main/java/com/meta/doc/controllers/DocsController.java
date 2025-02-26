package com.meta.doc.controllers;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.services.DocsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ds/v1/docs")
public class DocsController {

    private final DocsService docsService;

    @Autowired
    public DocsController(DocsService docsService) {
        this.docsService = docsService;
    }

    // Existing Endpoints

    @PostMapping
    public ResponseEntity<DocsDTO> createDoc(@RequestBody DocsDTO doc) {
        DocsDTO createdDoc = docsService.saveDocs(doc);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDoc);
    }

    @GetMapping
    public ResponseEntity<List<DocsDTO>> getAllDocs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy) {
        // Implement pagination and sorting in service layer if not already done
        // For simplicity, returning all docs
        return ResponseEntity.ok(docsService.getAllDocs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocsDTO> getDocById(@PathVariable String id) {
        return ResponseEntity.ok(docsService.getDocsById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocsDTO> updateDoc(@PathVariable String id, @RequestBody DocsDTO doc) {
        return ResponseEntity.ok(docsService.updateDocs(id, doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoc(@PathVariable String id) {
        docsService.deleteDocsById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<DocsDTO>> getDocsByTeamId(@PathVariable String teamId) {
        return ResponseEntity.ok(docsService.getDocsByTeamId(teamId));
    }

    @GetMapping("/office/{officeId}")
    public ResponseEntity<List<DocsDTO>> getDocsByOfficeId(@PathVariable String officeId) {
        return ResponseEntity.ok(docsService.getDocsByOfficeId(officeId));
    }

    // Additional Endpoints

    /**
     * Get all root documents where parent is null.
     */
    @GetMapping("/roots")
    public ResponseEntity<List<DocsDTO>> getRootDocs() {
        return ResponseEntity.ok(docsService.getRootDocs());
    }

    /**
     * Get all child documents of a specific parent.
     *
     * @param parentId ID of the parent document.
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<DocsDTO>> getChildDocs(@PathVariable String parentId) {
        return ResponseEntity.ok(docsService.getChildDocs(parentId));
    }

    /**
     * Get the entire hierarchy starting from a root document.
     *
     * @param rootId ID of the root document.
     */
    @GetMapping("/hierarchy/{rootId}")
    public ResponseEntity<DocsDTO> getDocHierarchy(@PathVariable String rootId) {
        return ResponseEntity.ok(docsService.getDocHierarchy(rootId));
    }

    /**
     * Move a document to a new parent.
     *
     * @param id          ID of the document to move.
     * @param newParentId ID of the new parent document.
     */
    @PostMapping("/{id}/move")
    public ResponseEntity<DocsDTO> moveDoc(
            @PathVariable String id,
            @RequestParam String newParentId) {
        return ResponseEntity.ok(docsService.moveDoc(id, newParentId));
    }

    /**
     * Search documents by title with optional parentId filter.
     *
     * @param query    Search query string.
     * @param parentId (Optional) ID of the parent document to filter search within.
     */
    @GetMapping("/search")
    public ResponseEntity<List<DocsDTO>> searchDocs(
            @RequestParam String query,
            @RequestParam(required = false) String parentId) {
        return ResponseEntity.ok(docsService.searchDocs(query, parentId));
    }

    @GetMapping("/{id}/grandparent")
    public ResponseEntity<String> getGrandparentId(@PathVariable String id) {
        return ResponseEntity.ok(docsService.getGrandparentId(id));
    }

}

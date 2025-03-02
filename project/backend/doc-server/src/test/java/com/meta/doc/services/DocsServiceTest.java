package com.meta.doc.services;

import com.meta.doc.BaseIntegrationTest;
import com.meta.doc.dtos.DocsDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DocsServiceTest extends BaseIntegrationTest {

    @Autowired
    private DocsService docsService;

    private DocsDTO rootDoc;

    @BeforeEach
    void setUp() {
        // Create a root document
        DocsDTO doc = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Root Doc",
            "Root Content",
            null,
            null,
            0
        );
        rootDoc = docsService.saveDocs(doc);
    }

    

    @Test
    void shouldGetAllDocs() {
        List<DocsDTO> allDocs = docsService.getAllDocs();
        assertFalse(allDocs.isEmpty());
        assertTrue(allDocs.stream().anyMatch(doc -> doc.getId().equals(rootDoc.getId())));
    }

    @Test
    void shouldUpdateDoc() {
        String updatedTitle = "Updated Title";
        String updatedContent = "Updated Content";
        
        DocsDTO updateRequest = new DocsDTO(
            rootDoc.getId(),
            rootDoc.getTeamId(),
            rootDoc.getOfficeId(),
            updatedTitle,
            updatedContent,
            rootDoc.getParentId(),
            rootDoc.getRootGrandparentId(),
            rootDoc.getLevel()
        );

        DocsDTO updatedDoc = docsService.updateDocs(rootDoc.getId(), updateRequest);
        assertEquals(updatedTitle, updatedDoc.getTitle());
        assertEquals(updatedContent, updatedDoc.getContent());
    }

    @Test
    void shouldDeleteDoc() {
        docsService.deleteDocsById(rootDoc.getId());
        assertThrows(RuntimeException.class, () -> docsService.getDocsById(rootDoc.getId()));
    }

    @Test
    void shouldGetRootAndChildDocs() {
        // Get root docs
        List<DocsDTO> rootDocs = docsService.getRootDocs();
        assertFalse(rootDocs.isEmpty());
        assertTrue(rootDocs.stream().anyMatch(doc -> doc.getId().equals(rootDoc.getId())));

        // Create a child document
        DocsDTO childDoc = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Child Doc",
            "Child Content",
            rootDoc.getId(),
            null,
            0
        );
        DocsDTO savedChildDoc = docsService.saveDocs(childDoc);

        // Get child docs
        List<DocsDTO> childDocs = docsService.getChildDocs(rootDoc.getId());
        assertEquals(1, childDocs.size());
        assertEquals(savedChildDoc.getId(), childDocs.get(0).getId());
    }

    @Test
    void shouldGetDocHierarchy() {
        // Create a child document
        DocsDTO childDoc = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Child Doc",
            "Child Content",
            rootDoc.getId(),
            null,
            0
        );
        docsService.saveDocs(childDoc);

        // Get hierarchy
        DocsDTO hierarchy = docsService.getDocHierarchy(rootDoc.getId());
        assertNotNull(hierarchy);
        assertEquals(rootDoc.getId(), hierarchy.getId());
    }

    @Test
    void shouldMoveDoc() {
        // Create a new parent
        DocsDTO newParent = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "New Parent",
            "New Parent Content",
            null,
            null,
            0
        );
        DocsDTO savedNewParent = docsService.saveDocs(newParent);

        // Create a doc to move
        DocsDTO docToMove = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Doc to Move",
            "Content",
            rootDoc.getId(),
            null,
            0
        );
        DocsDTO savedDocToMove = docsService.saveDocs(docToMove);

        // Move the doc
        DocsDTO movedDoc = docsService.moveDoc(savedDocToMove.getId(), savedNewParent.getId());
        assertEquals(savedNewParent.getId(), movedDoc.getParentId());
    }

    @Test
    void shouldSearchDocs() {
        List<DocsDTO> searchResults = docsService.searchDocs("Root", null);
        assertFalse(searchResults.isEmpty());
        assertTrue(searchResults.stream().anyMatch(doc -> doc.getTitle().contains("Root")));
    }

    @Test
    void shouldGetDocsByTeamAndOffice() {
        List<DocsDTO> teamDocs = docsService.getDocsByTeamId("team1");
        assertFalse(teamDocs.isEmpty());

        List<DocsDTO> officeDocs = docsService.getDocsByOfficeId("office1");
        assertFalse(officeDocs.isEmpty());
    }

    @Test
    void shouldGetGrandparentId() {
        // Create hierarchy: root -> parent -> child
        DocsDTO parent = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Parent",
            "Parent Content",
            rootDoc.getId(),
            null,
            0
        );
        DocsDTO savedParent = docsService.saveDocs(parent);

        DocsDTO child = new DocsDTO(
            UUID.randomUUID().toString(),
            "team1",
            "office1",
            "Child",
            "Child Content",
            savedParent.getId(),
            null,
            0
        );
        DocsDTO savedChild = docsService.saveDocs(child);

        String grandparentId = docsService.getGrandparentId(savedChild.getId());
        assertEquals(rootDoc.getId(), grandparentId);
    }
} 
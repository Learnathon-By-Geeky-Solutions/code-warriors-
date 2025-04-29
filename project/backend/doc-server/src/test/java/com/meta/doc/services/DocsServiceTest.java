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
        DocsDTO doc = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Root Doc")
                .content("Root Content")
                .level(0)
                .build();
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

        DocsDTO updateRequest = DocsDTO.builder()
                .id(rootDoc.getId())
                .teamId(rootDoc.getTeamId())
                .officeId(rootDoc.getOfficeId())
                .title(updatedTitle)
                .content(updatedContent)
                .parentId(rootDoc.getParentId())
                .rootGrandparentId(rootDoc.getRootGrandparentId())
                .level(rootDoc.getLevel())
                .build();

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
        DocsDTO childDoc = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Child Doc")
                .content("Child Content")
                .parentId(rootDoc.getId())
                .level(0)
                .build();
        DocsDTO savedChildDoc = docsService.saveDocs(childDoc);

        // Get child docs
        List<DocsDTO> childDocs = docsService.getChildDocs(rootDoc.getId());
        assertEquals(1, childDocs.size());
        assertEquals(savedChildDoc.getId(), childDocs.get(0).getId());
    }

    @Test
    void shouldGetDocHierarchy() {
        // Create a child document
        DocsDTO childDoc = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Child Doc")
                .content("Child Content")
                .parentId(rootDoc.getId())
                .level(0)
                .build();
        docsService.saveDocs(childDoc);

        // Get hierarchy
        DocsDTO hierarchy = docsService.getDocHierarchy(rootDoc.getId());
        assertNotNull(hierarchy);
        assertEquals(rootDoc.getId(), hierarchy.getId());
    }

    @Test
    void shouldMoveDoc() {
        // Create a new parent
        DocsDTO newParent = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("New Parent")
                .content("New Parent Content")
                .level(0)
                .build();
        DocsDTO savedNewParent = docsService.saveDocs(newParent);

        // Create a doc to move
        DocsDTO docToMove = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Doc to Move")
                .content("Content")
                .parentId(rootDoc.getId())
                .level(0)
                .build();
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
        DocsDTO parent = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Parent")
                .content("Parent Content")
                .parentId(rootDoc.getId())
                .level(0)
                .build();
        DocsDTO savedParent = docsService.saveDocs(parent);

        DocsDTO child = DocsDTO.builder()
                .id(UUID.randomUUID().toString())
                .teamId("team1")
                .officeId("office1")
                .title("Child")
                .content("Child Content")
                .parentId(savedParent.getId())
                .level(0)
                .build();
        DocsDTO savedChild = docsService.saveDocs(child);

        String grandparentId = docsService.getGrandparentId(savedChild.getId());
        assertEquals(rootDoc.getId(), grandparentId);
    }
}
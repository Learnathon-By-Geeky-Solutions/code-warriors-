package com.meta.doc.services;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.entities.Docs;

import java.util.List;

public interface DocsService {

    DocsDTO saveDocs(DocsDTO docsDTO);

    List<DocsDTO> getAllDocs();

    DocsDTO getDocsById(String id);

    DocsDTO updateDocs(String id, DocsDTO docsDTO);

    void deleteDocsById(String id);

    List<DocsDTO> getRootDocs();

    List<DocsDTO> getChildDocs(String parentId);

    DocsDTO getDocHierarchy(String rootId);

    DocsDTO moveDoc(String id, String newParentId);

    List<DocsDTO> searchDocs(String query, String parentId);

    List<DocsDTO> getDocsByTeamId(String teamId);

    List<DocsDTO> getDocsByOfficeId(String officeId);
    String getGrandparentId(String docId);

    DocsDTO convertToDTO(Docs retrievedDoc);
}

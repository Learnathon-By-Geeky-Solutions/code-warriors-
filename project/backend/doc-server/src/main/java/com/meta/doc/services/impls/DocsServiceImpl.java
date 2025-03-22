package com.meta.doc.services.impls;

import com.meta.doc.dtos.DocsDTO;
import com.meta.doc.entities.Docs;
import com.meta.doc.mapper.DocsMapper;
import com.meta.doc.repositories.DocsRepo;
import com.meta.doc.services.DocsService;
import com.meta.doc.services.RedisService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

/**
 * Implementation of DocsService for managing document operations.
 */
@Service
@Transactional(readOnly = true)
public class DocsServiceImpl implements DocsService {

    private final DocsRepo docsRepository;
    private final RedisService redisService;
    private static final long CACHE_TTL = 3600;

    /**
     * Constructor-based dependency injection.
     * @param docsRepository The repository for document persistence.
     * @param redisService The service for caching documents.
     */
    public DocsServiceImpl(DocsRepo docsRepository, RedisService redisService) {
        this.docsRepository = docsRepository;
        this.redisService = redisService;
    }

    @Override
    @Transactional
    public DocsDTO saveDocs(DocsDTO docsDTO) {
        Docs docs = DocsMapper.toEntity(docsDTO);

        // Generate UUID for new documents
        if (docs.getId() == null || docs.getId().isEmpty()) {
            docs.setId(UUID.randomUUID().toString());
        }

        if (docsDTO.getParentId() != null) {
            Docs parent = docsRepository.findById(docsDTO.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent not found: " + docsDTO.getParentId()));
            docs.setParent(parent);
            docs.setRootGrandparentId(parent.getRootGrandparentId());
        }

        Docs savedDocs = docsRepository.save(docs);

        if (docsDTO.getParentId() == null) {
            savedDocs.setRootGrandparentId(savedDocs.getId());
            savedDocs = docsRepository.save(savedDocs);
        }

        DocsDTO savedDocsDTO = DocsMapper.toDto(savedDocs, 0);
        redisService.set("doc:" + savedDocs.getId(), savedDocsDTO, CACHE_TTL);

        return DocsMapper.toDto(savedDocs, 0);
    }

    @Override
    public List<DocsDTO> getAllDocs() {
        String cacheKey = "docs:all";
        List<DocsDTO> cachedDocs = redisService.get(cacheKey, List.class);
        if (cachedDocs != null) {
            return cachedDocs;
        }
        List<DocsDTO> docs = DocsMapper.toDtoList(docsRepository.findAll());
        redisService.set(cacheKey, docs, CACHE_TTL);
        return docs;
    }

    @Override
    public DocsDTO getDocsById(String id) {
        DocsDTO cachedDoc = redisService.get("doc:" + id, DocsDTO.class);
        if (cachedDoc != null) {
            return cachedDoc;
        }

        DocsDTO doc = DocsMapper.toDto(findDocsById(id), 0);
        redisService.set("doc:" + id, doc, CACHE_TTL);

        return doc;
    }

    @Override
    @Transactional
    public DocsDTO updateDocs(String id, DocsDTO docsDTO) {
        Docs existingDocs = findDocsById(id);
        existingDocs.setTitle(docsDTO.getTitle());
        existingDocs.setContent(docsDTO.getContent());

        Docs savedDocs = docsRepository.save(existingDocs);
        DocsDTO updatedDoc = DocsMapper.toDto(savedDocs, 0);

        // Update cache
        redisService.set("doc:" + id, updatedDoc, CACHE_TTL);

        return updatedDoc;
    }

    @Override
    @Transactional
    public void deleteDocsById(String id) {
        Docs docs = findDocsById(id);
        if (docs.getParent() != null) {
            docs.getParent().removeChild(docs);
        }
        docsRepository.delete(docs);
        // Remove from cache
        redisService.delete("doc:" + id);
    }

    @Override
    public List<DocsDTO> getRootDocs() {
        return DocsMapper.toDtoList(docsRepository.findByParentIsNull());
    }

    @Override
    public List<DocsDTO> getChildDocs(String parentId) {
        Docs parent = findDocsById(parentId);
        return DocsMapper.toDtoList(parent.getChildren());
    }

    @Override
    public DocsDTO getDocHierarchy(String rootId) {
        Docs root = findDocsById(rootId);
        return buildHierarchy(root, 0);
    }

    @Override
    @Transactional
    public DocsDTO moveDoc(String id, String newParentId) {
        Docs doc = findDocsById(id);
        Docs newParent = findDocsById(newParentId);

        if (isCircularReference(newParent, id)) {
            throw new IllegalArgumentException("Cannot move document to its own descendant");
        }

        if (doc.getParent() != null) {
            doc.getParent().removeChild(doc);
        }
        newParent.addChild(doc);
        return DocsMapper.toDto(docsRepository.save(doc), 0);
    }

    @Override
    public List<DocsDTO> searchDocs(String query, String parentId) {
        List<Docs> results;
        if (parentId != null) {
            results = docsRepository.findByTitleContainingIgnoreCaseAndRootGrandparentId(query, parentId);
        } else {
            results = docsRepository.findByTitleContainingIgnoreCase(query);
        }
        return DocsMapper.toDtoList(results);
    }

    @Override
    public List<DocsDTO> getDocsByTeamId(String teamId) {
        return DocsMapper.toDtoList(docsRepository.findByTeamId(teamId));
    }

    @Override
    public List<DocsDTO> getDocsByOfficeId(String officeId) {
        return DocsMapper.toDtoList(docsRepository.findByOfficeId(officeId));
    }

    private Docs findDocsById(String id) {
        return docsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));
    }

    private DocsDTO buildHierarchy(Docs doc, int level) {
        DocsDTO dto = DocsMapper.toDto(doc, level);
        if (!doc.getChildren().isEmpty()) {
            dto.setChildren(doc.getChildren().stream()
                    .map(child -> buildHierarchy(child, level + 1))
                    .toList());
        }
        return dto;
    }

    private boolean isCircularReference(Docs newParent, String docId) {
        while (newParent != null) {
            if (newParent.getId().equals(docId)) {
                return true;
            }
            newParent = newParent.getParent();
        }
        return false;
    }

    @Override
    public String getGrandparentId(String docId) {
        Docs doc = findDocsById(docId); // Helper method to fetch the document
        return doc.getRootGrandparentId();
    }
}

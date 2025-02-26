package com.meta.doc.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class Docs {

    @Id
    private String id; // UUID will be set at the service layer

    private String teamId;

    private String officeId;

    private String title;

    @Lob
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Docs parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Docs> children = new ArrayList<>();

    @Column(name = "root_grandparent_id")
    private String rootGrandparentId;

    @Version
    private Long version;

    @PrePersist
    @PreUpdate
    private void updateRootGrandparent() {
        if (parent == null) {
            rootGrandparentId = id;
        } else if (parent.getParent() == null) {
            rootGrandparentId = parent.getId();
        } else {
            rootGrandparentId = parent.getRootGrandparentId();
        }
    }

    public void addChild(Docs child) {
        children.add(child);
        child.setParent(this);
        child.updateRootGrandparent();
    }

    public void removeChild(Docs child) {
        children.remove(child);
        child.setParent(null);
        child.setRootGrandparentId(null);
    }
}

package com.meta.project.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@ToString(exclude = {"board", "boardList", "comments", "todos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "cards")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class Card {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private String id;

    private String title;
    private String description;

    @Column(name = "card_order")
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id")
    private BoardList boardList;

    @ElementCollection
    @CollectionTable(
            name = "card_labels",
            joinColumns = @JoinColumn(name = "card_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"card_id", "label"})
    )
    @Column(name = "label", nullable = false)
    private Set<String> labels = new HashSet<>();

    @ElementCollection
    @CollectionTable(
            name = "card_links",
            joinColumns = @JoinColumn(name = "card_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"card_id", "link"})
    )
    @Column(name = "link", nullable = false)
    private Set<String> links = new HashSet<>();

    @ElementCollection
    @CollectionTable(
            name = "card_tracked_times",
            joinColumns = @JoinColumn(name = "card_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"card_id", "tracked_time"})
    )
    @Column(name = "tracked_time", nullable = false)
    private Set<String> trackedTimes = new HashSet<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Todo> todos = new ArrayList<>();

    private String userId;
    private LocalDateTime dateTo;
    private Boolean isCompleted = false;
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "card_members",
            joinColumns = @JoinColumn(name = "card_id")
    )
    @Column(name = "user_id")
    private Set<String> members = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

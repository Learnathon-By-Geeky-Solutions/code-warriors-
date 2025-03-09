package com.meta.project.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a list within a board.
 * This class maps to the 'board_list' table in the database and contains details
 * such as the list's title, order within the board, and its associated cards.
 */
@Getter
@Setter
@ToString(exclude = {"board", "cards"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class BoardList {

    /**
     * Unique identifier for the board list.
     * Generated using UUID strategy.
     */
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private String id;

    /**
     * Title of the board list.
     */
    private String title;

    /**
     * Order of the list within the board.
     */
    @Column(name = "list_order")
    private Integer order;

    /**
     * Board to which this list belongs.
     * Uses lazy fetching to avoid unnecessary loading.
     * JsonBackReference to handle bidirectional relationship with Board.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    @JsonBackReference("board-lists")
    private Board board;


    /**
     * Set of cards associated with this list.
     * Uses cascade type ALL and orphan removal to manage card lifecycle.
     * JsonManagedReference to handle bidirectional relationship with Card.
     */
    @OneToMany(mappedBy = "boardList", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("list-cards")
    private Set<Card> cards = new HashSet<>();
    /**
     * Timestamp indicating when the list was created.
     */
    private LocalDateTime createdAt;
    /**
     * Timestamp indicating when the list was last updated.
     */
    private LocalDateTime updatedAt;


    /**
     * Pre-persist lifecycle callback to set creation and update timestamps.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Pre-update lifecycle callback to update the update timestamp.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

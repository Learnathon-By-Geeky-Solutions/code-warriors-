package com.meta.project.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@ToString(exclude = {"board", "cards"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class BoardList extends BaseEntity {

    private String title;

    @Column(name = "list_order")
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    @JsonBackReference("board-lists")
    private Board board;

    @OneToMany(mappedBy = "boardList", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("list-cards")
    private Set<Card> cards = new HashSet<>();
}
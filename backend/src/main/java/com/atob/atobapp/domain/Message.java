package com.atob.atobapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Message {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private ChatConversation conversation;

    private String senderId;

    @Enumerated(EnumType.STRING)
    private ParticipantRole senderRole;

    @Column(length = 2000, nullable = false)
    private String content;

    private LocalDateTime sentAt;

    private boolean read;
}

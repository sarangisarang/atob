package com.atob.atobapp.dto;

import java.time.LocalDateTime;

public class ConversationResponseDTO {
    public String id;
    public String shippingId;
    public String otherParticipantId;
    public String otherParticipantName;
    public String otherParticipantRole;
    public boolean active;
    public LocalDateTime updatedAt;
    public String lastMessage;
    public LocalDateTime lastMessageAt;
    public long unreadCount;
}

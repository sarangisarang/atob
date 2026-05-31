package com.atob.atobapp.dto;

import java.time.LocalDateTime;

public class MessageResponseDTO {
    public String id;
    public String conversationId;
    public String senderId;
    public String senderRole;
    public String content;
    public LocalDateTime sentAt;
    public boolean read;
    public boolean mine;
}

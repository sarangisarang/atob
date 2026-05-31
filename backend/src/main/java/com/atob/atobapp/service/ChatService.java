package com.atob.atobapp.service;

import com.atob.atobapp.dto.ConversationResponseDTO;
import com.atob.atobapp.dto.MessageResponseDTO;

import java.util.List;

public interface ChatService {
    List<ConversationResponseDTO> getConversations(String callerEmail);
    List<MessageResponseDTO> getMessages(String callerEmail, String conversationId);
    MessageResponseDTO sendMessage(String callerEmail, String conversationId, String content);
    void markAsRead(String callerEmail, String conversationId);
    void createConversationForShipping(String customerId, String driverId, String shippingId);
}

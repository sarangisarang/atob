package com.atob.atobapp.service;

import com.atob.atobapp.domain.*;
import com.atob.atobapp.dto.ConversationResponseDTO;
import com.atob.atobapp.dto.MessageResponseDTO;
import com.atob.atobapp.exceptions.ForbiddenException;
import com.atob.atobapp.exceptions.BadRequestException;
import com.atob.atobapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired private ChatConversationRepository conversationRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private JdbcTemplate jdbc;

    private record CallerInfo(String id, ParticipantRole role) {}

    private CallerInfo resolve(String email) {
        Customer customer = customerRepository.findAllByEmail(email);
        if (customer != null) return new CallerInfo(customer.getId(), ParticipantRole.CUSTOMER);
        Carrier carrier = driverRepository.findAllByEmail(email);
        if (carrier != null) return new CallerInfo(carrier.getId(), ParticipantRole.DRIVER);
        throw new ForbiddenException("Not a chat participant: " + email);
    }

    private ChatConversation getConversationForCaller(String conversationId, CallerInfo caller) {
        if (caller.role() == ParticipantRole.CUSTOMER) {
            return conversationRepository.findByIdAndCustomerId(conversationId, caller.id())
                    .orElseThrow(() -> new ForbiddenException("Conversation not found or access denied"));
        } else {
            return conversationRepository.findByIdAndDriverId(conversationId, caller.id())
                    .orElseThrow(() -> new ForbiddenException("Conversation not found or access denied"));
        }
    }

    @Override
    public List<ConversationResponseDTO> getConversations(String callerEmail) {
        CallerInfo caller = resolve(callerEmail);
        List<ChatConversation> conversations;
        if (caller.role() == ParticipantRole.CUSTOMER) {
            conversations = conversationRepository.findByCustomerId(caller.id());
        } else {
            conversations = conversationRepository.findByDriverId(caller.id());
        }
        return conversations.stream().map(conv -> toConvDTO(conv, caller)).collect(Collectors.toList());
    }

    private ConversationResponseDTO toConvDTO(ChatConversation conv, CallerInfo caller) {
        ConversationResponseDTO dto = new ConversationResponseDTO();
        dto.id = conv.getId();
        dto.shippingId = conv.getShippingId();
        dto.active = conv.isActive();
        dto.updatedAt = conv.getUpdatedAt();

        if (caller.role() == ParticipantRole.CUSTOMER) {
            dto.otherParticipantRole = "DRIVER";
            dto.otherParticipantId = conv.getDriverId();
            Carrier carrier = driverRepository.findById(conv.getDriverId()).orElse(null);
            if (carrier != null) {
                dto.otherParticipantName = carrier.getFirstName() + " " + carrier.getLastName();
            }
        } else {
            dto.otherParticipantRole = "CUSTOMER";
            dto.otherParticipantId = conv.getCustomerId();
            Customer customer = customerRepository.findById(conv.getCustomerId()).orElse(null);
            if (customer != null) {
                dto.otherParticipantName = customer.getFirstName() + " " + customer.getLastName();
            }
        }

        List<Message> lastMsgs = messageRepository.findLastMessages(conv.getId(), PageRequest.of(0, 1));
        if (!lastMsgs.isEmpty()) {
            Message last = lastMsgs.get(0);
            dto.lastMessage = last.getContent();
            dto.lastMessageAt = last.getSentAt();
        }

        dto.unreadCount = messageRepository.countUnread(conv.getId(), caller.id(), caller.role());

        return dto;
    }

    @Override
    public List<MessageResponseDTO> getMessages(String callerEmail, String conversationId) {
        CallerInfo caller = resolve(callerEmail);
        getConversationForCaller(conversationId, caller);
        messageRepository.markMessagesAsRead(conversationId, caller.id(), caller.role());
        return messageRepository.findByConversationId(conversationId).stream()
                .map(m -> toMsgDTO(m, caller))
                .collect(Collectors.toList());
    }

    @Override
    public MessageResponseDTO sendMessage(String callerEmail, String conversationId, String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Message content cannot be empty");
        }
        if (content.length() > 2000) {
            throw new BadRequestException("Message too long (max 2000 characters)");
        }
        CallerInfo caller = resolve(callerEmail);
        ChatConversation conv = getConversationForCaller(conversationId, caller);

        Message msg = new Message();
        msg.setId(UUID.randomUUID().toString());
        msg.setConversation(conv);
        msg.setSenderId(caller.id());
        msg.setSenderRole(caller.role());
        msg.setContent(content);
        msg.setSentAt(LocalDateTime.now());
        msg.setRead(false);
        Message saved = messageRepository.save(msg);

        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        return toMsgDTO(saved, caller);
    }

    @Override
    public void markAsRead(String callerEmail, String conversationId) {
        CallerInfo caller = resolve(callerEmail);
        getConversationForCaller(conversationId, caller);
        messageRepository.markMessagesAsRead(conversationId, caller.id(), caller.role());
    }

    @Override
    public void createConversationForShipping(String customerId, String driverId, String shippingId) {
        // Fast-path guard: skip the INSERT entirely if we already know the row exists.
        // The ON CONFLICT below handles any race that slips through the guard.
        if (conversationRepository.findByShippingId(shippingId).isPresent()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        // ON CONFLICT (shipping_id) DO NOTHING makes this idempotent even under concurrent requests.
        // A racing thread receives 0 rows-affected instead of a DataIntegrityViolationException,
        // so the outer assignCarrier transaction is never rolled back by a duplicate-key error.
        jdbc.update(
                "INSERT INTO chat_conversation" +
                "(id, customer_id, driver_id, shipping_id, active, created_at, updated_at)" +
                " VALUES (?, ?, ?, ?, true, ?, ?)" +
                " ON CONFLICT (shipping_id) DO NOTHING",
                UUID.randomUUID().toString(), customerId, driverId, shippingId,
                Timestamp.valueOf(now), Timestamp.valueOf(now));
    }

    private MessageResponseDTO toMsgDTO(Message m, CallerInfo caller) {
        MessageResponseDTO dto = new MessageResponseDTO();
        dto.id = m.getId();
        dto.conversationId = m.getConversation().getId();
        dto.senderId = m.getSenderId();
        dto.senderRole = m.getSenderRole() != null ? m.getSenderRole().name() : null;
        dto.content = m.getContent();
        dto.sentAt = m.getSentAt();
        dto.read = m.isRead();
        dto.mine = m.getSenderId() != null
                && m.getSenderRole() != null
                && m.getSenderId().equals(caller.id())
                && m.getSenderRole() == caller.role();
        return dto;
    }
}

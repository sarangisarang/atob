package com.atob.atobapp.repository;

import com.atob.atobapp.domain.Message;
import com.atob.atobapp.domain.ParticipantRole;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.sentAt ASC")
    List<Message> findByConversationId(@Param("conversationId") String conversationId);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :convId ORDER BY m.sentAt DESC")
    List<Message> findLastMessages(@Param("convId") String convId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND (m.senderId != :callerId OR m.senderRole != :callerRole) AND m.read = false")
    long countUnread(@Param("conversationId") String conversationId, @Param("callerId") String callerId, @Param("callerRole") ParticipantRole callerRole);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.read = true WHERE m.conversation.id = :conversationId AND (m.senderId != :callerId OR m.senderRole != :callerRole) AND m.read = false")
    void markMessagesAsRead(@Param("conversationId") String conversationId, @Param("callerId") String callerId, @Param("callerRole") ParticipantRole callerRole);
}

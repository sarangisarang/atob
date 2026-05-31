package com.atob.atobapp.controler;

import com.atob.atobapp.dto.ConversationResponseDTO;
import com.atob.atobapp.dto.MessageResponseDTO;
import com.atob.atobapp.dto.SendMessageRequestDTO;
import com.atob.atobapp.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/conversations")
    public List<ConversationResponseDTO> getConversations(Principal principal) {
        return chatService.getConversations(principal.getName());
    }

    @GetMapping("/conversations/{id}/messages")
    public List<MessageResponseDTO> getMessages(
            @PathVariable String id,
            Principal principal) {
        return chatService.getMessages(principal.getName(), id);
    }

    @PostMapping("/conversations/{id}/messages")
    public MessageResponseDTO sendMessage(
            @PathVariable String id,
            @RequestBody SendMessageRequestDTO body,
            Principal principal) {
        return chatService.sendMessage(principal.getName(), id, body.content);
    }

    @PatchMapping("/conversations/{id}/read")
    public void markAsRead(@PathVariable String id, Principal principal) {
        chatService.markAsRead(principal.getName(), id);
    }
}

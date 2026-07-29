package com.Accountancy.app.services;

import com.Accountancy.app.dto.ContactMessageDTO;
import com.Accountancy.app.entities.ContactMessage;
import com.Accountancy.app.repositories.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactMessageService {
    private final ContactMessageRepository repo;

    public void save(ContactMessageDTO.ContactMessageRequest req) {
        ContactMessage msg = new ContactMessage();
        msg.setName(req.getName());
        msg.setEmail(req.getEmail());
        msg.setSubject(req.getSubject());
        msg.setMessage(req.getMessage());
        repo.save(msg);
    }

    public List<ContactMessage> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
    public void markRead(Long id) {
        repo.findById(id).ifPresent(m -> { m.setRead(true); repo.save(m); });
    }

    public long countUnread() {
        return repo.countByIsReadFalse();
    }
}
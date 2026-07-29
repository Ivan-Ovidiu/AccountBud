package com.Accountancy.app.repositories;

import com.Accountancy.app.entities.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    long countByIsReadFalse();
}

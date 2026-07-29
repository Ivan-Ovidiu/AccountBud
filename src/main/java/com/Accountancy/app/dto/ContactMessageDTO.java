package com.Accountancy.app.dto;

import lombok.Getter;
import lombok.Setter;

public class ContactMessageDTO {

    @Getter
    @Setter
    public static class ContactMessageRequest {
        private String name;
        private String email;
        private String subject;
        private String message;
    }
}
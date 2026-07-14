package com.lastmile.deliverytracker.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    public void sendSms(String phoneNumber, String message) {
        log.info("[SMS Dispatch Log] Sending SMS to phone: {} | Content: {}", phoneNumber, message);
    }
}

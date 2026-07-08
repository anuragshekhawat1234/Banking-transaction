package com.bank.transaction.dto;

import com.bank.transaction.entity.AccountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String holderName;
    private String email;
    private BigDecimal balance;
    private AccountType accountType;
    private LocalDateTime createdAt;
}

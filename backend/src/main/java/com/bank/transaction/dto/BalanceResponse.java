package com.bank.transaction.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BalanceResponse {
    private String accountNumber;
    private String holderName;
    private BigDecimal balance;
}

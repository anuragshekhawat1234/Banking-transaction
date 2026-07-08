package com.bank.transaction.service;

import com.bank.transaction.dto.TransactionRequest;
import com.bank.transaction.dto.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionService {
    TransactionResponse deposit(TransactionRequest request);
    TransactionResponse withdraw(TransactionRequest request);
    Page<TransactionResponse> getTransactionHistory(String accountNumber, Pageable pageable);
}

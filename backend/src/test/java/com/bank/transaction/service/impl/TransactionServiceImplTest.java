package com.bank.transaction.service.impl;

import com.bank.transaction.dto.TransactionRequest;
import com.bank.transaction.dto.TransactionResponse;
import com.bank.transaction.entity.Account;
import com.bank.transaction.entity.Transaction;
import com.bank.transaction.entity.TransactionType;
import com.bank.transaction.exception.AccountNotFoundException;
import com.bank.transaction.exception.InsufficientBalanceException;
import com.bank.transaction.exception.InvalidAmountException;
import com.bank.transaction.repository.AccountRepository;
import com.bank.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TransactionServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void deposit_Success() {
        String accountNumber = "1234567890";
        TransactionRequest request = TransactionRequest.builder()
                .accountNumber(accountNumber)
                .amount(new BigDecimal("150.00"))
                .description("Freelance reward")
                .build();

        Account account = Account.builder()
                .id(1L)
                .accountNumber(accountNumber)
                .balance(new BigDecimal("500.00"))
                .build();

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenReturn(account);

        Transaction savedTransaction = Transaction.builder()
                .id(10L)
                .account(account)
                .type(TransactionType.DEPOSIT)
                .amount(new BigDecimal("150.00"))
                .balanceAfter(new BigDecimal("650.00"))
                .description("Freelance reward")
                .build();
                
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponse response = transactionService.deposit(request);

        assertNotNull(response);
        assertEquals(TransactionType.DEPOSIT, response.getType());
        assertEquals(new BigDecimal("150.00"), response.getAmount());
        assertEquals(new BigDecimal("650.00"), response.getBalanceAfter());

        verify(accountRepository, times(1)).save(account);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void deposit_NegativeAmount_ThrowsException() {
        TransactionRequest request = TransactionRequest.builder()
                .accountNumber("1234567890")
                .amount(new BigDecimal("-50.00"))
                .build();

        Account account = Account.builder()
                .accountNumber("1234567890")
                .balance(new BigDecimal("500.00"))
                .build();

        when(accountRepository.findByAccountNumber("1234567890")).thenReturn(Optional.of(account));

        assertThrows(InvalidAmountException.class, () -> transactionService.deposit(request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void withdraw_Success() {
        String accountNumber = "1234567890";
        TransactionRequest request = TransactionRequest.builder()
                .accountNumber(accountNumber)
                .amount(new BigDecimal("200.00"))
                .description("ATM Cash")
                .build();

        Account account = Account.builder()
                .id(1L)
                .accountNumber(accountNumber)
                .balance(new BigDecimal("500.00"))
                .build();

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenReturn(account);

        Transaction savedTransaction = Transaction.builder()
                .id(11L)
                .account(account)
                .type(TransactionType.WITHDRAWAL)
                .amount(new BigDecimal("200.00"))
                .balanceAfter(new BigDecimal("300.00"))
                .description("ATM Cash")
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponse response = transactionService.withdraw(request);

        assertNotNull(response);
        assertEquals(TransactionType.WITHDRAWAL, response.getType());
        assertEquals(new BigDecimal("200.00"), response.getAmount());
        assertEquals(new BigDecimal("300.00"), response.getBalanceAfter());

        verify(accountRepository, times(1)).save(account);
    }

    @Test
    void withdraw_InsufficientBalance_ThrowsException() {
        String accountNumber = "1234567890";
        TransactionRequest request = TransactionRequest.builder()
                .accountNumber(accountNumber)
                .amount(new BigDecimal("600.00"))
                .build();

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .balance(new BigDecimal("500.00"))
                .build();

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        assertThrows(InsufficientBalanceException.class, () -> transactionService.withdraw(request));
        verify(accountRepository, never()).save(any(Account.class));
    }
}

package com.bank.transaction.service.impl;

import com.bank.transaction.dto.AccountCreateRequest;
import com.bank.transaction.dto.AccountResponse;
import com.bank.transaction.dto.BalanceResponse;
import com.bank.transaction.entity.Account;
import com.bank.transaction.entity.AccountType;
import com.bank.transaction.exception.AccountNotFoundException;
import com.bank.transaction.exception.DuplicateAccountException;
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

class AccountServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AccountServiceImpl accountService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createAccount_Success() {
        AccountCreateRequest request = AccountCreateRequest.builder()
                .holderName("John Doe")
                .email("john.doe@example.com")
                .initialDeposit(new BigDecimal("500.00"))
                .accountType(AccountType.SAVINGS)
                .build();

        when(accountRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(accountRepository.existsByAccountNumber(any())).thenReturn(false);

        Account savedAccount = Account.builder()
                .id(1L)
                .accountNumber("1234567890")
                .holderName(request.getHolderName())
                .email(request.getEmail())
                .balance(request.getInitialDeposit())
                .accountType(request.getAccountType())
                .build();

        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        AccountResponse response = accountService.createAccount(request);

        assertNotNull(response);
        assertEquals("1234567890", response.getAccountNumber());
        assertEquals("John Doe", response.getHolderName());
        assertEquals(new BigDecimal("500.00"), response.getBalance());

        verify(accountRepository, times(1)).save(any(Account.class));
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    void createAccount_DuplicateEmail_ThrowsException() {
        AccountCreateRequest request = AccountCreateRequest.builder()
                .holderName("John Doe")
                .email("john.doe@example.com")
                .initialDeposit(new BigDecimal("500.00"))
                .accountType(AccountType.SAVINGS)
                .build();

        when(accountRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(DuplicateAccountException.class, () -> accountService.createAccount(request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void getBalance_Success() {
        String accountNumber = "1234567890";
        Account account = Account.builder()
                .accountNumber(accountNumber)
                .holderName("John Doe")
                .balance(new BigDecimal("1000.00"))
                .build();

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        BalanceResponse response = accountService.getBalance(accountNumber);

        assertNotNull(response);
        assertEquals(accountNumber, response.getAccountNumber());
        assertEquals(new BigDecimal("1000.00"), response.getBalance());
    }

    @Test
    void getBalance_NotFound_ThrowsException() {
        String accountNumber = "1234567890";
        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> accountService.getBalance(accountNumber));
    }
}

package com.bank.transaction.service.impl;

import com.bank.transaction.dto.AccountCreateRequest;
import com.bank.transaction.dto.AccountResponse;
import com.bank.transaction.dto.BalanceResponse;
import com.bank.transaction.entity.Account;
import com.bank.transaction.entity.Transaction;
import com.bank.transaction.entity.TransactionType;
import com.bank.transaction.exception.AccountNotFoundException;
import com.bank.transaction.exception.DuplicateAccountException;
import com.bank.transaction.exception.InvalidAmountException;
import com.bank.transaction.repository.AccountRepository;
import com.bank.transaction.repository.TransactionRepository;
import com.bank.transaction.service.AccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final Random random = new Random();

    public AccountServiceImpl(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public AccountResponse createAccount(AccountCreateRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateAccountException("An account with email " + request.getEmail() + " already exists.");
        }

        if (request.getInitialDeposit() == null || request.getInitialDeposit().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidAmountException("Initial deposit cannot be negative.");
        }

        String accountNumber = generateUniqueAccountNumber();

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .holderName(request.getHolderName())
                .email(request.getEmail())
                .balance(request.getInitialDeposit())
                .accountType(request.getAccountType())
                .build();

        Account savedAccount = accountRepository.save(account);

        // Record initial deposit transaction if amount is greater than zero
        if (request.getInitialDeposit().compareTo(BigDecimal.ZERO) > 0) {
            Transaction transaction = Transaction.builder()
                    .account(savedAccount)
                    .type(TransactionType.DEPOSIT)
                    .amount(request.getInitialDeposit())
                    .balanceAfter(request.getInitialDeposit())
                    .description("Initial Deposit")
                    .build();
            transactionRepository.save(transaction);
        }

        return mapToAccountResponse(savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public BalanceResponse getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account with number " + accountNumber + " not found."));

        return BalanceResponse.builder()
                .accountNumber(account.getAccountNumber())
                .holderName(account.getHolderName())
                .balance(account.getBalance())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountDetails(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account with number " + accountNumber + " not found."));

        return mapToAccountResponse(account);
    }

    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            // Generate a 10-digit random number
            long number = 1000000000L + (long) (random.nextDouble() * 9000000000L);
            accountNumber = String.valueOf(number);
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountResponse mapToAccountResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .holderName(account.getHolderName())
                .email(account.getEmail())
                .balance(account.getBalance())
                .accountType(account.getAccountType())
                .createdAt(account.getCreatedAt())
                .build();
    }
}

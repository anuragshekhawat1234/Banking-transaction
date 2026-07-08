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
import com.bank.transaction.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionServiceImpl(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public TransactionResponse deposit(TransactionRequest request) {
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account with number " + request.getAccountNumber() + " not found."));

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Deposit amount must be greater than zero.");
        }

        account.setBalance(account.getBalance().add(amount));
        Account savedAccount = accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .account(savedAccount)
                .type(TransactionType.DEPOSIT)
                .amount(amount)
                .balanceAfter(savedAccount.getBalance())
                .description(request.getDescription() == null || request.getDescription().trim().isEmpty() 
                        ? "Deposit" : request.getDescription().trim())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        return mapToTransactionResponse(savedTransaction);
    }

    @Override
    public TransactionResponse withdraw(TransactionRequest request) {
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account with number " + request.getAccountNumber() + " not found."));

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Withdrawal amount must be greater than zero.");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance. Current balance is " + account.getBalance());
        }

        account.setBalance(account.getBalance().subtract(amount));
        Account savedAccount = accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .account(savedAccount)
                .type(TransactionType.WITHDRAWAL)
                .amount(amount)
                .balanceAfter(savedAccount.getBalance())
                .description(request.getDescription() == null || request.getDescription().trim().isEmpty() 
                        ? "Withdrawal" : request.getDescription().trim())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        return mapToTransactionResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactionHistory(String accountNumber, Pageable pageable) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account with number " + accountNumber + " not found."));

        Page<Transaction> transactions = transactionRepository.findByAccountOrderByTimestampDesc(account, pageable);
        return transactions.map(this::mapToTransactionResponse);
    }

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .accountNumber(transaction.getAccount().getAccountNumber())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .balanceAfter(transaction.getBalanceAfter())
                .description(transaction.getDescription())
                .timestamp(transaction.getTimestamp())
                .build();
    }
}

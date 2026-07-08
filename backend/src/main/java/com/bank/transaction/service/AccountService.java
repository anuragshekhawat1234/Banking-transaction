package com.bank.transaction.service;

import com.bank.transaction.dto.AccountCreateRequest;
import com.bank.transaction.dto.AccountResponse;
import com.bank.transaction.dto.BalanceResponse;

public interface AccountService {
    AccountResponse createAccount(AccountCreateRequest request);
    BalanceResponse getBalance(String accountNumber);
    AccountResponse getAccountDetails(String accountNumber);
}

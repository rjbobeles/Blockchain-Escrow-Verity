//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Escrow.sol";

contract SmartEscrow is AccessControl {
  address public _owner;
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); 

  mapping(string => address) public transactions;
  mapping(address => string) public transactions_id;

  event escrowTransactionCreated(string transaction_id, address escrowContract, address seller);
  event escrowTransactionOveridden(string transaction_id, address escrowContract);

  constructor() {
    _owner = msg.sender; 
    _setupRole(ADMIN_ROLE, _owner);
  }

  modifier txNotExist (string memory transactionId) {
    require(transactions[transactionId] == address(0), "Transaction exists");
    _;
  }

  modifier txExist (string memory transactionId) {
    require(transactions[transactionId] != address(0), "Transaction does not exist");
    _;
  }

  function createEscrowTransaction (string memory transactionId, address seller, uint amount) public txNotExist(transactionId) {
    Escrow et = new Escrow(seller, amount);
    transactions[transactionId] = address(et);
    transactions_id[address(et)] = transactionId;
    emit escrowTransactionCreated(transactionId, address(et), seller);
  }

  function overrideTransaction (string memory transactionId, uint action) public onlyRole(ADMIN_ROLE) txExist(transactionId) {
    Escrow et = Escrow(transactions[transactionId]);
    et.overrideRelease(action);
    emit escrowTransactionOveridden(transactionId, transactions[transactionId]);
  }
}
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Escrow is AccessControl {
  address private _middleman;
  bytes32 public constant MIDDLEMAN_ROLE = keccak256("MIDDLEMAN_ROLE"); 

  enum EscrowStatus { pending, paid, released, refunded, cancelled }
  enum ReleaseType { none, release, refund, cancel }

  event buyerJoined(address Buyer);
  event balanceRefunded();
  event balanceReleased();
  event transactionOverridden();

  struct EscrowInfo {
    address payable buyer;
    address payable seller;
    uint amount;

    EscrowStatus escrowStatus;
  }
  EscrowInfo public escrowInfo;

  modifier isJoinable () {
    require(escrowInfo.escrowStatus == EscrowStatus.pending, "This transaction is already active");
    require(escrowInfo.buyer == address(0), "Transaction already has a buyer");
    require(msg.value == escrowInfo.amount, "Invalid amount provided");
    _;
  }

  modifier isBuyer() {
    require(msg.sender == escrowInfo.buyer, "You are not the buyer");
    _;
  }

  modifier isCorrectAmount() {
    require(address(this).balance == 0, "Invalid A");
    require(address(this).balance != escrowInfo.amount);
    _;
  }

  modifier isSeller() {
    require(msg.sender == escrowInfo.seller, "You are not the seller");
    _;
  }

  modifier isNotSeller() {
    require(msg.sender != escrowInfo.seller, "You are the seller in this transaction");
    _;
  }

  modifier isPayable() {
    require(escrowInfo.escrowStatus == EscrowStatus.paid, "This transaction is not yet paid");
    require(escrowInfo.escrowStatus != EscrowStatus.refunded, "This transaction has been refunded");
    require(escrowInfo.escrowStatus != EscrowStatus.released, "This transaction has been released");
    require(escrowInfo.escrowStatus != EscrowStatus.cancelled, "This transaction has been cancelled");
    _;
  }

  constructor (address seller, uint amount) {  
    escrowInfo.seller = payable(seller);
    escrowInfo.amount = amount;

    _middleman = msg.sender;
    _setupRole(MIDDLEMAN_ROLE, _middleman);
  }

  function join() public payable isJoinable isNotSeller {
    escrowInfo.buyer = payable(msg.sender);
    escrowInfo.escrowStatus = EscrowStatus.paid;
    emit buyerJoined(msg.sender);
  }

  function release() public isBuyer isPayable {
    uint amount = address(this).balance;
    
    (bool success, ) = payable(escrowInfo.seller).call{ value: amount }("");
    require(success, "Transfer failed.");

    escrowInfo.escrowStatus = EscrowStatus.released;
    emit balanceReleased();
  }

  function refund() public isSeller isPayable {
    uint amount = address(this).balance;

    (bool success, ) = payable(escrowInfo.buyer).call{ value: amount }("");
    require(success, "Transfer failed.");

    escrowInfo.escrowStatus = EscrowStatus.refunded;
    emit balanceRefunded();
  }

  function overrideRelease(uint action) public onlyRole(MIDDLEMAN_ROLE) isPayable {
    ReleaseType rt = ReleaseType(action);
    uint amount = address(this).balance;

    if(rt == ReleaseType.cancel) {
      (bool success, ) = payable(escrowInfo.buyer).call{ value: amount }("");
      require(success, "Transfer failed.");

      escrowInfo.escrowStatus = EscrowStatus.cancelled;
      emit transactionOverridden();
      emit balanceReleased();
    } 
    else if (rt == ReleaseType.refund) {
      (bool success, ) = payable(escrowInfo.buyer).call{ value: amount }("");
      require(success, "Transfer failed.");

      escrowInfo.escrowStatus = EscrowStatus.refunded;
      emit transactionOverridden();
      emit balanceRefunded();
    }
    else if (rt == ReleaseType.release) {
      (bool success, ) = payable(escrowInfo.seller).call{ value: amount }("");
      require(success, "Transfer failed.");

      escrowInfo.escrowStatus = EscrowStatus.released;
      emit transactionOverridden();
      emit balanceReleased();
    }
    else revert("An invalid option was provided.");
  }
}
/* eslint-disable camelcase */
/* eslint-disable node/no-missing-import */

import chai, { expect } from "chai";
import crypto from "crypto";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { v4 as uuid } from "uuid";

import { SmartEscrow__factory, Escrow__factory } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(solidity);

const provider = ethers.provider;

describe("Smart Contract Tests", () => {
  let signers: SignerWithAddress[];
  let SMART_ESCROW_ADDR: string;

  const tx1 = `0x${crypto.createHash("sha256").update(`${uuid()}`).digest("hex")}`;

  before(async () => {
    signers = await ethers.getSigners();

    expect(signers).to.not.be.null;
    expect(signers).to.not.be.undefined;
  });

  describe("Smart Escrow Contract", () => {
    it("should deploy smart contract", async () => {
      const escrow = new SmartEscrow__factory(signers[0]);
      const escrowContract = await escrow.deploy();
      SMART_ESCROW_ADDR = escrowContract.address;

      expect(escrowContract).to.not.be.undefined;
      expect(escrowContract).to.not.be.null;
    });

    it("should create a new escrow transaction", async () => {
      const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
      await expect(escrow.createEscrowTransaction(tx1, signers[1].address, 2000000)).to.not.be.reverted;
    });

    it("should get escrow address of tx1 from transaction_id", async () => {
      const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
      const ethAddr = await escrow.transactions(tx1);

      expect(ethAddr).to.not.be.undefined;
      expect(ethAddr).to.not.be.null;
    });

    it("should get transaction_id of tx1 from escrow address", async () => {
      const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
      const ethAddr = await escrow.transactions(tx1);
      const txId = await escrow.transactions_id(ethAddr);

      expect(ethAddr).to.not.be.undefined;
      expect(ethAddr).to.not.be.null;
      expect(txId).to.not.be.undefined;
      expect(txId).to.not.be.null;
      expect(txId).to.equal(tx1);
    });
  });

  describe("Escrow Contract", () => {
    describe("Transaction Information", () => {
      let tx1Addr: string;

      before("should get contract address from SmartEscrow", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        const ethAddr = await escrow.transactions(tx1);
        tx1Addr = ethAddr;

        expect(ethAddr).to.not.be.undefined;
        expect(ethAddr).to.not.be.null;
      });

      it("should get transaction information as admin", async () => {
        const escrow = new Escrow__factory(signers[0]).attach(tx1Addr);
        const escrowInfo = await escrow.escrowInfo();

        expect(escrowInfo).to.not.be.undefined;
        expect(escrowInfo).to.not.be.null;
        expect(escrowInfo.escrowStatus).to.equal(0);
        expect(escrowInfo.amount.toString()).to.equal("2000000");
      });

      it("should get transaction information as seller", async () => {
        const escrow = new Escrow__factory(signers[1]).attach(tx1Addr);
        const escrowInfo = await escrow.escrowInfo();

        expect(escrowInfo).to.not.be.undefined;
        expect(escrowInfo).to.not.be.null;
        expect(escrowInfo.escrowStatus).to.equal(0);
        expect(escrowInfo.amount.toString()).to.equal("2000000");
      });

      it("should get transaction information as nobody", async () => {
        const escrow = new Escrow__factory(signers[2]).attach(tx1Addr);
        const escrowInfo = await escrow.escrowInfo();

        expect(escrowInfo).to.not.be.undefined;
        expect(escrowInfo).to.not.be.null;
        expect(escrowInfo.escrowStatus).to.equal(0);
        expect(escrowInfo.amount.toString()).to.equal("2000000");
      });
    });

    describe("Success Scenario - Buyer release to Seller", () => {
      const tx = `0x${crypto.createHash("sha256").update(`${uuid()}`).digest("hex")}`;
      let txAddr: string;

      before("it should create a transaction", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        await expect(escrow.createEscrowTransaction(tx, signers[1].address, 2000000)).to.not.be.reverted;
      });

      before("it should fetch tx address", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        const ethAddr = await escrow.transactions(tx);
        txAddr = ethAddr;

        expect(ethAddr).to.not.be.undefined;
        expect(ethAddr).to.not.be.null;
      });

      before("it should join transaction with eth deduction", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.join({ value: 2000000 });
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.greaterThan(parseInt(newBal.toString()));
        await expect((await provider.getBalance(txAddr)).toString()).to.equal("2000000");
      });

      it("should release the money to seller", async () => {
        const currBal = await signers[1].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.release();
        const newBal = await signers[1].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.lessThan(parseInt(newBal.toString()));
      });
    });

    describe("Success Scenario - Seller release to Buyer", () => {
      const tx = `0x${crypto.createHash("sha256").update(`${uuid()}`).digest("hex")}`;
      let txAddr: string;

      before("it should create a transaction", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        await expect(escrow.createEscrowTransaction(tx, signers[1].address, 2000000)).to.not.be.reverted;
      });

      before("it should fetch tx address", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        const ethAddr = await escrow.transactions(tx);
        txAddr = ethAddr;

        expect(ethAddr).to.not.be.undefined;
        expect(ethAddr).to.not.be.null;
      });

      before("it should join transaction with eth deduction", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.join({ value: 2000000 });
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.greaterThan(parseInt(newBal.toString()));
        await expect((await provider.getBalance(txAddr)).toString()).to.equal("2000000");
      });

      it("should refund the money to buyer", async () => {
        const currBal = await signers[1].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.release();
        const newBal = await signers[1].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.lessThan(parseInt(newBal.toString()));
      });
    });

    describe("Success Scenario - Mediator cancel transaction", () => {
      const tx = `0x${crypto.createHash("sha256").update(`${uuid()}`).digest("hex")}`;
      let txAddr: string;

      before("it should create a transaction", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        await expect(escrow.createEscrowTransaction(tx, signers[1].address, 2000000)).to.not.be.reverted;
      });

      before("it should fetch tx address", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        const ethAddr = await escrow.transactions(tx);
        txAddr = ethAddr;

        expect(ethAddr).to.not.be.undefined;
        expect(ethAddr).to.not.be.null;
      });

      before("it should join transaction with eth deduction", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.join({ value: 2000000 });
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.greaterThan(parseInt(newBal.toString()));
        await expect((await provider.getBalance(txAddr)).toString()).to.equal("2000000");
      });

      it("should have admin refund the money to buyer", async () => {
        const currBal = await signers[1].getBalance();
        const escrow = new SmartEscrow__factory(signers[0]).attach(SMART_ESCROW_ADDR);
        await escrow.overrideTransaction(tx, 1);
        const newBal = await signers[1].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.lessThan(parseInt(newBal.toString()));
      });
    });

    describe("Success Scenario - Mediator release transaction to Seller", () => {
      const tx = `0x${crypto.createHash("sha256").update(`${uuid()}`).digest("hex")}`;
      let txAddr: string;

      before("it should create a transaction", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        await expect(escrow.createEscrowTransaction(tx, signers[1].address, 2000000)).to.not.be.reverted;
      });

      before("it should fetch tx address", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        const ethAddr = await escrow.transactions(tx);
        txAddr = ethAddr;

        expect(ethAddr).to.not.be.undefined;
        expect(ethAddr).to.not.be.null;
      });

      before("it should join transaction with eth deduction", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.join({ value: 2000000 });
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.greaterThan(parseInt(newBal.toString()));
        await expect((await provider.getBalance(txAddr)).toString()).to.equal("2000000");
      });

      it("should have admin refund the money to seller", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new SmartEscrow__factory(signers[0]).attach(SMART_ESCROW_ADDR);
        await escrow.overrideTransaction(tx, 3);
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.lessThan(parseInt(newBal.toString()));
      });
    });

    describe("Success Scenario - Mediator refund transaction to Buyer", () => {
      const tx = `0x${crypto.createHash("sha256").update(`${uuid()}`).digest("hex")}`;
      let txAddr: string;

      before("it should create a transaction", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        await expect(escrow.createEscrowTransaction(tx, signers[1].address, 2000000)).to.not.be.reverted;
      });

      before("it should fetch tx address", async () => {
        const escrow = new SmartEscrow__factory(signers[1]).attach(SMART_ESCROW_ADDR);
        const ethAddr = await escrow.transactions(tx);
        txAddr = ethAddr;

        expect(ethAddr).to.not.be.undefined;
        expect(ethAddr).to.not.be.null;
      });

      before("it should join transaction with eth deduction", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new Escrow__factory(signers[2]).attach(txAddr);
        await escrow.join({ value: 2000000 });
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.greaterThan(parseInt(newBal.toString()));
        await expect((await provider.getBalance(txAddr)).toString()).to.equal("2000000");
      });

      it("should have admin refund the money to buyer", async () => {
        const currBal = await signers[2].getBalance();
        const escrow = new SmartEscrow__factory(signers[0]).attach(SMART_ESCROW_ADDR);
        await escrow.overrideTransaction(tx, 2);
        const newBal = await signers[2].getBalance();

        expect(currBal).to.not.be.undefined;
        expect(currBal).to.not.be.null;
        expect(newBal).to.not.be.undefined;
        expect(newBal).to.not.be.null;
        expect(parseInt(currBal.toString())).to.be.lessThan(parseInt(newBal.toString()));
      });
    });
  });
});

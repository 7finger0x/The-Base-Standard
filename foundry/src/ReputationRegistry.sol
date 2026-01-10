// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ECDSA} from "solady/utils/ECDSA.sol";
import {EIP712} from "solady/utils/EIP712.sol";
import {Ownable} from "solady/auth/Ownable.sol";

contract ReputationRegistry is Ownable, EIP712 {
    using ECDSA for bytes32;

    error CannotLinkSelf();
    error AlreadyLinked();
    error NotLinked();
    error InvalidSignature();
    error DeadlineExpired();
    error ArrayLengthMismatch();

    mapping(address => address) public walletLinks;
    mapping(address => address[]) private _linkedWallets;
    mapping(address => uint256) public reputationScores;
    mapping(address => uint256) public nonces;

    bytes32 constant LINK_TYPEHASH = keccak256(
        "LinkWallet(address main,address secondary,uint256 nonce,uint256 deadline)"
    );

    constructor() {
        _initializeOwner(msg.sender);
    }

    function _domainNameAndVersion() internal pure override returns (string memory, string memory) {
        return ("BaseRank", "1");
    }

    function linkWallet(address secondary, uint256 deadline, bytes calldata signature) external {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (secondary == msg.sender) revert CannotLinkSelf();
        if (walletLinks[secondary] != address(0)) revert AlreadyLinked();

        bytes32 structHash = keccak256(abi.encode(
            LINK_TYPEHASH,
            msg.sender,
            secondary,
            nonces[secondary]++,
            deadline
        ));
        
        bytes32 digest = _hashTypedData(structHash);
        address signer = ECDSA.recover(digest, signature);
        
        if (signer != secondary) revert InvalidSignature();

        walletLinks[secondary] = msg.sender;
        _linkedWallets[msg.sender].push(secondary);
    }

    function unlinkWallet(address secondary) external {
        if (walletLinks[secondary] != msg.sender) revert NotLinked();
        delete walletLinks[secondary];
        address[] storage wallets = _linkedWallets[msg.sender];
        for (uint256 i = 0; i < wallets.length; i++) {
            if (wallets[i] == secondary) {
                wallets[i] = wallets[wallets.length - 1];
                wallets.pop();
                break;
            }
        }
    }

    function getLinkedWallets(address main) external view returns (address[] memory) {
        return _linkedWallets[main];
    }

    function updateScore(address user, uint256 score) public onlyOwner {
        reputationScores[user] = score;
    }

    function batchUpdateScores(address[] calldata users, uint256[] calldata scores) external onlyOwner {
        if (users.length != scores.length) revert ArrayLengthMismatch();
        for (uint256 i = 0; i < users.length; i++) {
            updateScore(users[i], scores[i]);
        }
    }

    function reputationTiers(address user) external view returns (string memory) {
        uint256 score = reputationScores[user];
        if (score >= 1000) return "BASED";
        if (score >= 850) return "Gold";
        if (score >= 500) return "Silver";
        if (score >= 100) return "Bronze";
        return "Novice";
    }

    function getAggregatedScore(address user) external view returns (uint256 total) {
        total = reputationScores[user];
        address[] memory secondaries = _linkedWallets[user];
        for (uint256 i = 0; i < secondaries.length; i++) {
            total += reputationScores[secondaries[i]];
        }
    }
    
    function hashTypedData(bytes32 structHash) external view returns (bytes32) {
        return _hashTypedData(structHash);
    }
}

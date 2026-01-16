// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ECDSA} from "solady/utils/ECDSA.sol";
import {EIP712} from "solady/utils/EIP712.sol";
import {Ownable} from "solady/auth/Ownable.sol";

/**
 * @title AutomationCompatibleInterface
 * @notice Minimal interface for Chainlink Automation
 */
interface AutomationCompatibleInterface {
    /**
     * @notice method that is simulated by the keepers to see if any work actually
     * needs to be performed. This method does does not actually need to be
     * executable, and since it is only ever simulated it can consume lots of gas.
     */
    function checkUpkeep(bytes calldata checkData)
        external
        view
        returns (bool upkeepNeeded, bytes memory performData);

    /**
     * @notice method that is actually executed by the keepers, via the registry.
     * The data returned by the checkUpkeep simulation will be passed into
     * this method to actually be executed.
     */
    function performUpkeep(bytes calldata performData) external;
}

contract ReputationRegistry is Ownable, EIP712, AutomationCompatibleInterface {
    using ECDSA for bytes32;

    error CannotLinkSelf();
    error AlreadyLinked();
    error NotLinked();
    error InvalidSignature();
    error DeadlineExpired();
    error ArrayLengthMismatch();
    error UpkeepNotNeeded();
    error UnauthorizedUpkeep();

    mapping(address => address) public walletLinks;
    mapping(address => address[]) private _linkedWallets;
    mapping(address => uint256) public reputationScores;
    mapping(address => uint256) public nonces;
    
    // Chainlink Automation state
    address[] public pendingUpdates;
    mapping(address => bool) public needsUpdate;
    address public automationRegistry; // Set by owner after deployment

    bytes32 constant LINK_TYPEHASH = keccak256(
        "LinkWallet(address main,address secondary,uint256 nonce,uint256 deadline)"
    );

    constructor() {
        _initializeOwner(msg.sender);
    }

    function _domainNameAndVersion() internal pure override returns (string memory, string memory) {
        return ("The Base Standard", "1");
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

    // Chainlink Automation functions

    /**
     * @notice Set the Chainlink Automation Registry address
     * @param registry The address of the Chainlink Automation Registry
     */
    function setAutomationRegistry(address registry) external onlyOwner {
        automationRegistry = registry;
    }

    /**
     * @notice Mark an address as needing a score update
     * @param user The address that needs an update
     */
    function markForUpdate(address user) external onlyOwner {
        if (!needsUpdate[user]) {
            needsUpdate[user] = true;
            pendingUpdates.push(user);
        }
    }

    /**
     * @notice Batch mark addresses for update
     * @param users Array of addresses that need updates
     */
    function batchMarkForUpdate(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            if (!needsUpdate[users[i]]) {
                needsUpdate[users[i]] = true;
                pendingUpdates.push(users[i]);
            }
        }
    }

    /**
     * @notice Check if upkeep is needed (called by Chainlink Automation)
     * @param checkData Optional data to check (unused)
     * @return upkeepNeeded Whether upkeep is needed
     * @return performData Encoded addresses that need updates
     */
    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = pendingUpdates.length > 0;
        performData = abi.encode(pendingUpdates);
        return (upkeepNeeded, performData);
    }

    /**
     * @notice Perform upkeep (called by Chainlink Automation)
     * @param performData Encoded addresses to update (from checkUpkeep)
     */
    function performUpkeep(bytes calldata performData) external override {
        // In production, verify msg.sender is Chainlink Automation Registry
        // For now, allow owner or configured registry
        if (automationRegistry != address(0)) {
            require(msg.sender == automationRegistry, "UnauthorizedUpkeep");
        } else {
            // During setup, allow owner to test
            require(msg.sender == owner(), "UnauthorizedUpkeep");
        }

        address[] memory addresses = abi.decode(performData, (address[]));
        
        if (addresses.length == 0) {
            revert UpkeepNotNeeded();
        }

        // Clear pending updates (they'll be processed off-chain and updated via batchUpdateScores)
        // In a full implementation, you'd fetch scores from an oracle or API here
        delete pendingUpdates;
        
        // Clear needsUpdate flags for processed addresses
        for (uint256 i = 0; i < addresses.length; i++) {
            needsUpdate[addresses[i]] = false;
        }
    }

    /**
     * @notice Get pending updates count
     * @return count Number of pending updates
     */
    function getPendingUpdatesCount() external view returns (uint256) {
        return pendingUpdates.length;
    }

    /**
     * @notice Get pending updates (for off-chain processing)
     * @return addresses Array of addresses pending update
     */
    function getPendingUpdates() external view returns (address[] memory) {
        return pendingUpdates;
    }
}

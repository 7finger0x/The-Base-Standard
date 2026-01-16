// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    ReputationRegistry public registry;
    
    uint256 public mainKey = 0xA11CE;
    uint256 public secKey = 0xB0B;
    
    address public mainWallet;
    address public secWallet;

    bytes32 constant LINK_TYPEHASH = keccak256(
        "LinkWallet(address main,address secondary,uint256 nonce,uint256 deadline)"
    );

    function setUp() public {
        // Just deploy. The constructor handles init automatically now.
        registry = new ReputationRegistry();
        
        mainWallet = vm.addr(mainKey);
        secWallet = vm.addr(secKey);
    }

    function _signLinkWallet(
        address main,
        address secondary,
        uint256 nonce,
        uint256 deadline,
        uint256 privateKey
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(abi.encode(
            LINK_TYPEHASH,
            main,
            secondary,
            nonce,
            deadline
        ));
        
        bytes32 digest = registry.hashTypedData(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        
        return abi.encodePacked(r, s, v);
    }

    function test_LinkWallet() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);

        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        assertEq(registry.walletLinks(secWallet), mainWallet);
    }

    function test_RevertWhen_LinkSelf() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, mainWallet, 0, deadline, mainKey);

        vm.prank(mainWallet);
        vm.expectRevert(ReputationRegistry.CannotLinkSelf.selector);
        registry.linkWallet(mainWallet, deadline, signature);
    }

    function test_TierCalculation() public {
        registry.updateScore(mainWallet, 1000);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("BASED"));
    }

    // ========== Wallet Linking Tests ==========

    function test_LinkWallet_EmitsNoEvent() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);

        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        // Verify link was created
        assertEq(registry.walletLinks(secWallet), mainWallet);
        address[] memory linked = registry.getLinkedWallets(mainWallet);
        assertEq(linked.length, 1);
        assertEq(linked[0], secWallet);
    }

    function test_RevertWhen_DeadlineExpired() public {
        uint256 deadline = block.timestamp - 1;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);

        vm.prank(mainWallet);
        vm.expectRevert(ReputationRegistry.DeadlineExpired.selector);
        registry.linkWallet(secWallet, deadline, signature);
    }

    function test_RevertWhen_AlreadyLinked() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);

        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        // Try to link again
        uint256 newDeadline = block.timestamp + 2 hours;
        bytes memory newSignature = _signLinkWallet(mainWallet, secWallet, 1, newDeadline, secKey);

        vm.prank(mainWallet);
        vm.expectRevert(ReputationRegistry.AlreadyLinked.selector);
        registry.linkWallet(secWallet, newDeadline, newSignature);
    }

    function test_RevertWhen_InvalidSignature_WrongSigner() public {
        uint256 deadline = block.timestamp + 1 hours;
        // Sign with mainKey instead of secKey
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, mainKey);

        vm.prank(mainWallet);
        vm.expectRevert(ReputationRegistry.InvalidSignature.selector);
        registry.linkWallet(secWallet, deadline, signature);
    }

    function test_RevertWhen_InvalidSignature_WrongNonce() public {
        uint256 deadline = block.timestamp + 1 hours;
        // Use nonce 5 instead of 0
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 5, deadline, secKey);

        vm.prank(mainWallet);
        vm.expectRevert(ReputationRegistry.InvalidSignature.selector);
        registry.linkWallet(secWallet, deadline, signature);
    }

    function test_LinkMultipleWallets() public {
        uint256 thirdKey = 0xCA7;
        address thirdWallet = vm.addr(thirdKey);

        uint256 deadline = block.timestamp + 1 hours;

        // Link first wallet
        bytes memory sig1 = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, sig1);

        // Link second wallet
        bytes memory sig2 = _signLinkWallet(mainWallet, thirdWallet, 0, deadline, thirdKey);
        vm.prank(mainWallet);
        registry.linkWallet(thirdWallet, deadline, sig2);

        address[] memory linked = registry.getLinkedWallets(mainWallet);
        assertEq(linked.length, 2);
        assertEq(linked[0], secWallet);
        assertEq(linked[1], thirdWallet);
    }

    function test_NonceIncrementsAfterLink() public {
        uint256 deadline = block.timestamp + 1 hours;

        assertEq(registry.nonces(secWallet), 0);

        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        assertEq(registry.nonces(secWallet), 1);
    }

    // ========== Wallet Unlinking Tests ==========

    function test_UnlinkWallet() public {
        // First link
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        // Then unlink
        vm.prank(mainWallet);
        registry.unlinkWallet(secWallet);

        assertEq(registry.walletLinks(secWallet), address(0));
        address[] memory linked = registry.getLinkedWallets(mainWallet);
        assertEq(linked.length, 0);
    }

    function test_RevertWhen_UnlinkNotLinked() public {
        vm.prank(mainWallet);
        vm.expectRevert(ReputationRegistry.NotLinked.selector);
        registry.unlinkWallet(secWallet);
    }

    function test_RevertWhen_UnlinkFromWrongWallet() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        // Try to unlink from different wallet
        address wrongWallet = vm.addr(0xBAD);
        vm.prank(wrongWallet);
        vm.expectRevert(ReputationRegistry.NotLinked.selector);
        registry.unlinkWallet(secWallet);
    }

    function test_UnlinkMiddleWallet() public {
        uint256 secondKey = 0xCA7;
        uint256 thirdKey = 0xDA8;
        address secondWallet = vm.addr(secondKey);
        address thirdWallet = vm.addr(thirdKey);

        uint256 deadline = block.timestamp + 1 hours;

        // Link three wallets
        bytes memory sig1 = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, sig1);

        bytes memory sig2 = _signLinkWallet(mainWallet, secondWallet, 0, deadline, secondKey);
        vm.prank(mainWallet);
        registry.linkWallet(secondWallet, deadline, sig2);

        bytes memory sig3 = _signLinkWallet(mainWallet, thirdWallet, 0, deadline, thirdKey);
        vm.prank(mainWallet);
        registry.linkWallet(thirdWallet, deadline, sig3);

        // Unlink the middle one
        vm.prank(mainWallet);
        registry.unlinkWallet(secondWallet);

        address[] memory linked = registry.getLinkedWallets(mainWallet);
        assertEq(linked.length, 2);
        // Array should contain secWallet and thirdWallet but not secondWallet
        assertTrue(linked[0] == secWallet || linked[1] == secWallet);
        assertTrue(linked[0] == thirdWallet || linked[1] == thirdWallet);
    }

    // ========== Score Update Tests ==========

    function test_UpdateScore() public {
        registry.updateScore(mainWallet, 500);
        assertEq(registry.reputationScores(mainWallet), 500);
    }

    function test_UpdateScore_Overwrite() public {
        registry.updateScore(mainWallet, 500);
        registry.updateScore(mainWallet, 700);
        assertEq(registry.reputationScores(mainWallet), 700);
    }

    function test_RevertWhen_UpdateScore_NotOwner() public {
        vm.prank(mainWallet);
        vm.expectRevert(Ownable.Unauthorized.selector);
        registry.updateScore(secWallet, 500);
    }

    function test_BatchUpdateScores() public {
        address[] memory users = new address[](3);
        uint256[] memory scores = new uint256[](3);

        users[0] = mainWallet;
        users[1] = secWallet;
        users[2] = vm.addr(0xCA7);

        scores[0] = 100;
        scores[1] = 200;
        scores[2] = 300;

        registry.batchUpdateScores(users, scores);

        assertEq(registry.reputationScores(mainWallet), 100);
        assertEq(registry.reputationScores(secWallet), 200);
        assertEq(registry.reputationScores(vm.addr(0xCA7)), 300);
    }

    function test_RevertWhen_BatchUpdateScores_ArrayLengthMismatch() public {
        address[] memory users = new address[](2);
        uint256[] memory scores = new uint256[](3);

        vm.expectRevert(ReputationRegistry.ArrayLengthMismatch.selector);
        registry.batchUpdateScores(users, scores);
    }

    function test_RevertWhen_BatchUpdateScores_NotOwner() public {
        address[] memory users = new address[](1);
        uint256[] memory scores = new uint256[](1);

        users[0] = mainWallet;
        scores[0] = 100;

        vm.prank(mainWallet);
        vm.expectRevert(Ownable.Unauthorized.selector);
        registry.batchUpdateScores(users, scores);
    }

    // ========== Tier Calculation Tests ==========

    function test_TierCalculation_Novice() public {
        registry.updateScore(mainWallet, 50);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Novice"));
    }

    function test_TierCalculation_Bronze() public {
        registry.updateScore(mainWallet, 100);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Bronze"));
    }

    function test_TierCalculation_Silver() public {
        registry.updateScore(mainWallet, 500);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Silver"));
    }

    function test_TierCalculation_Gold() public {
        registry.updateScore(mainWallet, 850);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Gold"));
    }

    function test_TierCalculation_BoundaryBronze() public {
        registry.updateScore(mainWallet, 99);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Novice"));

        registry.updateScore(mainWallet, 100);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Bronze"));
    }

    function test_TierCalculation_BoundarySilver() public {
        registry.updateScore(mainWallet, 499);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Bronze"));

        registry.updateScore(mainWallet, 500);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Silver"));
    }

    function test_TierCalculation_BoundaryGold() public {
        registry.updateScore(mainWallet, 849);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Silver"));

        registry.updateScore(mainWallet, 850);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Gold"));
    }

    function test_TierCalculation_BoundaryBased() public {
        registry.updateScore(mainWallet, 999);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Gold"));

        registry.updateScore(mainWallet, 1000);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("BASED"));
    }

    function test_TierCalculation_Zero() public {
        registry.updateScore(mainWallet, 0);
        assertEq(keccak256(bytes(registry.reputationTiers(mainWallet))), keccak256("Novice"));
    }

    // ========== Aggregated Score Tests ==========

    function test_GetAggregatedScore_SingleWallet() public {
        registry.updateScore(mainWallet, 500);
        assertEq(registry.getAggregatedScore(mainWallet), 500);
    }

    function test_GetAggregatedScore_WithLinkedWallet() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        registry.updateScore(mainWallet, 500);
        registry.updateScore(secWallet, 300);

        assertEq(registry.getAggregatedScore(mainWallet), 800);
    }

    function test_GetAggregatedScore_MultipleLinkedWallets() public {
        uint256 thirdKey = 0xCA7;
        address thirdWallet = vm.addr(thirdKey);

        uint256 deadline = block.timestamp + 1 hours;

        bytes memory sig1 = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, sig1);

        bytes memory sig2 = _signLinkWallet(mainWallet, thirdWallet, 0, deadline, thirdKey);
        vm.prank(mainWallet);
        registry.linkWallet(thirdWallet, deadline, sig2);

        registry.updateScore(mainWallet, 500);
        registry.updateScore(secWallet, 300);
        registry.updateScore(thirdWallet, 200);

        assertEq(registry.getAggregatedScore(mainWallet), 1000);
    }

    function test_GetAggregatedScore_AfterUnlink() public {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory signature = _signLinkWallet(mainWallet, secWallet, 0, deadline, secKey);
        vm.prank(mainWallet);
        registry.linkWallet(secWallet, deadline, signature);

        registry.updateScore(mainWallet, 500);
        registry.updateScore(secWallet, 300);

        assertEq(registry.getAggregatedScore(mainWallet), 800);

        // Unlink
        vm.prank(mainWallet);
        registry.unlinkWallet(secWallet);

        assertEq(registry.getAggregatedScore(mainWallet), 500);
    }

    // ========== EIP-712 Tests ==========

    function test_HashTypedData_Consistency() public {
        bytes32 structHash = keccak256(abi.encode(
            LINK_TYPEHASH,
            mainWallet,
            secWallet,
            0,
            block.timestamp + 1 hours
        ));

        bytes32 hash1 = registry.hashTypedData(structHash);
        bytes32 hash2 = registry.hashTypedData(structHash);

        assertEq(hash1, hash2);
    }

    function test_HashTypedData_DifferentForDifferentInputs() public {
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 structHash1 = keccak256(abi.encode(
            LINK_TYPEHASH,
            mainWallet,
            secWallet,
            0,
            deadline
        ));

        bytes32 structHash2 = keccak256(abi.encode(
            LINK_TYPEHASH,
            mainWallet,
            secWallet,
            1, // Different nonce
            deadline
        ));

        bytes32 hash1 = registry.hashTypedData(structHash1);
        bytes32 hash2 = registry.hashTypedData(structHash2);

        bool hashesDifferent = hash1 != hash2;
        assertTrue(hashesDifferent);
    }

    // ========== Chainlink Automation Tests ==========

    function test_SetAutomationRegistry() public {
        address mockRegistry = address(0x1234);
        registry.setAutomationRegistry(mockRegistry);
        assertEq(registry.automationRegistry(), mockRegistry);
    }

    function test_RevertWhen_SetAutomationRegistry_NotOwner() public {
        address mockRegistry = address(0x1234);
        vm.prank(mainWallet);
        vm.expectRevert(Ownable.Unauthorized.selector);
        registry.setAutomationRegistry(mockRegistry);
    }

    function test_MarkForUpdate() public {
        registry.markForUpdate(mainWallet);
        assertTrue(registry.needsUpdate(mainWallet));
        assertEq(registry.getPendingUpdatesCount(), 1);
        
        address[] memory pending = registry.getPendingUpdates();
        assertEq(pending.length, 1);
        assertEq(pending[0], mainWallet);
    }

    function test_MarkForUpdate_DoesNotDuplicate() public {
        registry.markForUpdate(mainWallet);
        registry.markForUpdate(mainWallet); // Should not add duplicate
        assertEq(registry.getPendingUpdatesCount(), 1);
    }

    function test_BatchMarkForUpdate() public {
        address[] memory users = new address[](3);
        users[0] = mainWallet;
        users[1] = secWallet;
        users[2] = vm.addr(0xCA7);

        registry.batchMarkForUpdate(users);
        assertEq(registry.getPendingUpdatesCount(), 3);
        assertTrue(registry.needsUpdate(mainWallet));
        assertTrue(registry.needsUpdate(secWallet));
        assertTrue(registry.needsUpdate(users[2]));
    }

    function test_RevertWhen_MarkForUpdate_NotOwner() public {
        vm.prank(mainWallet);
        vm.expectRevert(Ownable.Unauthorized.selector);
        registry.markForUpdate(secWallet);
    }

    function test_CheckUpkeep_ReturnsFalse_WhenNoPendingUpdates() public {
        (bool upkeepNeeded, bytes memory performData) = registry.checkUpkeep("");
        assertFalse(upkeepNeeded);
        // performData will contain encoded empty array (not truly empty)
        address[] memory decoded = abi.decode(performData, (address[]));
        assertEq(decoded.length, 0);
    }

    function test_CheckUpkeep_ReturnsTrue_WhenPendingUpdates() public {
        registry.markForUpdate(mainWallet);
        registry.markForUpdate(secWallet);

        (bool upkeepNeeded, bytes memory performData) = registry.checkUpkeep("");
        assertTrue(upkeepNeeded);
        
        address[] memory decoded = abi.decode(performData, (address[]));
        assertEq(decoded.length, 2);
        assertEq(decoded[0], mainWallet);
        assertEq(decoded[1], secWallet);
    }

    function test_PerformUpkeep_AsOwner_WhenRegistryNotSet() public {
        registry.markForUpdate(mainWallet);
        registry.markForUpdate(secWallet);

        // Owner can perform upkeep when registry not set (for testing)
        registry.performUpkeep(abi.encode(registry.getPendingUpdates()));

        assertEq(registry.getPendingUpdatesCount(), 0);
        assertFalse(registry.needsUpdate(mainWallet));
        assertFalse(registry.needsUpdate(secWallet));
    }

    function test_PerformUpkeep_AsAutomationRegistry() public {
        address mockRegistry = address(0x1234);
        registry.setAutomationRegistry(mockRegistry);
        registry.markForUpdate(mainWallet);

        address[] memory pending = registry.getPendingUpdates();
        bytes memory performData = abi.encode(pending);

        vm.prank(mockRegistry);
        registry.performUpkeep(performData);

        assertEq(registry.getPendingUpdatesCount(), 0);
        assertFalse(registry.needsUpdate(mainWallet));
    }

    function test_RevertWhen_PerformUpkeep_NotAuthorized() public {
        address mockRegistry = address(0x1234);
        registry.setAutomationRegistry(mockRegistry);
        registry.markForUpdate(mainWallet);

        address[] memory pending = registry.getPendingUpdates();
        bytes memory performData = abi.encode(pending);

        vm.prank(mainWallet); // Not owner or registry
        vm.expectRevert(); // Expect any revert (error format may vary)
        registry.performUpkeep(performData);
    }

    function test_RevertWhen_PerformUpkeep_EmptyAddresses() public {
        bytes memory emptyData = abi.encode(new address[](0));
        vm.expectRevert(ReputationRegistry.UpkeepNotNeeded.selector);
        registry.performUpkeep(emptyData);
    }

    function test_GetPendingUpdates() public {
        registry.markForUpdate(mainWallet);
        registry.markForUpdate(secWallet);
        registry.markForUpdate(vm.addr(0xCA7));

        address[] memory pending = registry.getPendingUpdates();
        assertEq(pending.length, 3);
    }

    function test_GetPendingUpdatesCount() public {
        assertEq(registry.getPendingUpdatesCount(), 0);
        
        registry.markForUpdate(mainWallet);
        assertEq(registry.getPendingUpdatesCount(), 1);
        
        registry.markForUpdate(secWallet);
        assertEq(registry.getPendingUpdatesCount(), 2);
    }

    function test_PerformUpkeep_ClearsPendingUpdates() public {
        registry.markForUpdate(mainWallet);
        registry.markForUpdate(secWallet);
        assertEq(registry.getPendingUpdatesCount(), 2);

        address[] memory pending = registry.getPendingUpdates();
        registry.performUpkeep(abi.encode(pending));

        assertEq(registry.getPendingUpdatesCount(), 0);
        address[] memory empty = registry.getPendingUpdates();
        assertEq(empty.length, 0);
    }

    function test_AutomationFlow_Complete() public {
        // 1. Mark addresses for update
        registry.markForUpdate(mainWallet);
        registry.markForUpdate(secWallet);
        
        // 2. Check upkeep
        (bool upkeepNeeded, bytes memory performData) = registry.checkUpkeep("");
        assertTrue(upkeepNeeded);
        
        // 3. Perform upkeep (as owner, since registry not set)
        registry.performUpkeep(performData);
        
        // 4. Verify cleanup
        assertEq(registry.getPendingUpdatesCount(), 0);
        assertFalse(registry.needsUpdate(mainWallet));
        assertFalse(registry.needsUpdate(secWallet));
        
        // 5. Check upkeep again (should return false)
        (upkeepNeeded, performData) = registry.checkUpkeep("");
        assertFalse(upkeepNeeded);
    }
}

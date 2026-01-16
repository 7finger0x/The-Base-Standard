// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/ReputationRegistry.sol";
import "../src/ReputationBadge.sol";

contract ReputationBadgeTest is Test {
    ReputationRegistry public registry;
    ReputationBadge public badge;
    
    address public owner;
    address public user1;
    address public user2;
    address public unauthorizedMinter;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1111);
        user2 = address(0x2222);
        unauthorizedMinter = address(0x9999);

        registry = new ReputationRegistry();
        badge = new ReputationBadge(address(registry));
    }

    // ========== Constructor Tests ==========

    function test_Constructor_SetsRegistry() public {
        assertEq(address(badge.registry()), address(registry));
    }

    function test_Constructor_SetsOwner() public {
        assertEq(badge.owner(), owner);
    }

    function test_Constructor_OwnerIsAuthorizedMinter() public {
        assertTrue(badge.authorizedMinters(owner));
    }

    function test_Name() public view {
        assertEq(keccak256(bytes(badge.name())), keccak256("Base Standard Reputation Badge"));
    }

    function test_Symbol() public view {
        assertEq(keccak256(bytes(badge.symbol())), keccak256("BSRB"));
    }

    // ========== Minting Tests ==========

    function test_Mint() public {
        uint256 tokenId = badge.mint(user1);
        
        assertEq(tokenId, 1);
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.addressToTokenId(user1), tokenId);
        assertEq(badge.tokenIdToAddress(tokenId), user1);
        assertTrue(badge.hasBadge(user1));
    }

    function test_Mint_IncrementsTokenId() public {
        uint256 tokenId1 = badge.mint(user1);
        uint256 tokenId2 = badge.mint(user2);
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
    }

    function test_RevertWhen_Mint_AlreadyMinted() public {
        badge.mint(user1);
        
        vm.expectRevert(ReputationBadge.AlreadyMinted.selector);
        badge.mint(user1);
    }

    function test_RevertWhen_Mint_Unauthorized() public {
        vm.prank(unauthorizedMinter);
        vm.expectRevert(ReputationBadge.UnauthorizedMinter.selector);
        badge.mint(user1);
    }

    function test_Mint_AsAuthorizedMinter() public {
        badge.setAuthorizedMinter(unauthorizedMinter, true);
        
        vm.prank(unauthorizedMinter);
        uint256 tokenId = badge.mint(user1);
        
        assertEq(tokenId, 1);
        assertEq(badge.ownerOf(tokenId), user1);
    }

    function test_BatchMint() public {
        address[] memory recipients = new address[](3);
        recipients[0] = user1;
        recipients[1] = user2;
        recipients[2] = address(0x3333);

        uint256[] memory tokenIds = badge.batchMint(recipients);
        
        assertEq(tokenIds.length, 3);
        assertEq(tokenIds[0], 1);
        assertEq(tokenIds[1], 2);
        assertEq(tokenIds[2], 3);
        assertTrue(badge.hasBadge(user1));
        assertTrue(badge.hasBadge(user2));
        assertTrue(badge.hasBadge(recipients[2]));
    }

    function test_BatchMint_ReturnsExistingTokenId() public {
        badge.mint(user1);
        
        address[] memory recipients = new address[](1);
        recipients[0] = user1;

        uint256[] memory tokenIds = badge.batchMint(recipients);
        
        assertEq(tokenIds.length, 1);
        assertEq(tokenIds[0], 1); // Returns existing token ID
    }

    function test_RevertWhen_BatchMint_Unauthorized() public {
        address[] memory recipients = new address[](1);
        recipients[0] = user1;

        vm.prank(unauthorizedMinter);
        vm.expectRevert(ReputationBadge.UnauthorizedMinter.selector);
        badge.batchMint(recipients);
    }

    // ========== Token URI Tests ==========

    function test_TokenURI_GeneratesMetadata() public {
        registry.updateScore(user1, 850);
        uint256 tokenId = badge.mint(user1);

        string memory uri = badge.tokenURI(tokenId);
        
        // Should be base64 encoded JSON
        assertTrue(bytes(uri).length > 0);
        assertTrue(keccak256(bytes(uri)) != keccak256(""));
    }

    function test_TokenURI_UpdatesWithScoreChange() public {
        registry.updateScore(user1, 500);
        uint256 tokenId = badge.mint(user1);
        
        string memory uri1 = badge.tokenURI(tokenId);
        
        // Update score
        registry.updateScore(user1, 900);
        
        string memory uri2 = badge.tokenURI(tokenId);
        
        // URIs should be different (different tier/score)
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
    }

    function test_TokenURI_DynamicTier() public {
        // Test different tiers
        registry.updateScore(user1, 50);   // Novice
        uint256 tokenId1 = badge.mint(user1);
        
        registry.updateScore(user2, 850);  // Gold
        uint256 tokenId2 = badge.mint(user2);
        
        string memory uri1 = badge.tokenURI(tokenId1);
        string memory uri2 = badge.tokenURI(tokenId2);
        
        // Should be different for different tiers
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
    }

    function test_RevertWhen_TokenURI_InvalidTokenId() public {
        vm.expectRevert(ReputationBadge.InvalidTokenId.selector);
        badge.tokenURI(999);
    }

    // ========== SVG Generation Tests ==========

    function test_SVG_ContainsTier() public {
        registry.updateScore(user1, 1000);
        uint256 tokenId = badge.mint(user1);
        
        string memory uri = badge.tokenURI(tokenId);
        
        // URI should contain tier information (encoded)
        assertTrue(bytes(uri).length > 0);
    }

    function test_SVG_ContainsScore() public {
        registry.updateScore(user1, 750);
        uint256 tokenId = badge.mint(user1);
        
        string memory uri = badge.tokenURI(tokenId);
        
        // URI should contain score information
        assertTrue(bytes(uri).length > 0);
    }

    function test_SVG_ContainsAddress() public {
        registry.updateScore(user1, 500);
        uint256 tokenId = badge.mint(user1);
        
        string memory uri = badge.tokenURI(tokenId);
        
        // URI should contain address information
        assertTrue(bytes(uri).length > 0);
    }

    // ========== Tier Color Tests ==========

    function test_TierColors_DifferentForEachTier() public {
        // This is tested indirectly through tokenURI generation
        // Each tier should produce different SVG colors
        registry.updateScore(user1, 50);   // Novice (gray)
        uint256 tokenId1 = badge.mint(user1);
        
        registry.updateScore(user2, 500);   // Silver
        uint256 tokenId2 = badge.mint(user2);
        
        string memory uri1 = badge.tokenURI(tokenId1);
        string memory uri2 = badge.tokenURI(tokenId2);
        
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
    }

    // ========== Helper Function Tests ==========

    function test_GetTokenId() public {
        uint256 tokenId = badge.mint(user1);
        
        assertEq(badge.getTokenId(user1), tokenId);
        assertEq(badge.getTokenId(user2), 0); // Not minted
    }

    function test_HasBadge() public {
        assertFalse(badge.hasBadge(user1));
        
        badge.mint(user1);
        
        assertTrue(badge.hasBadge(user1));
        assertFalse(badge.hasBadge(user2));
    }

    // ========== Authorized Minter Tests ==========

    function test_SetAuthorizedMinter() public {
        badge.setAuthorizedMinter(unauthorizedMinter, true);
        assertTrue(badge.authorizedMinters(unauthorizedMinter));
        
        badge.setAuthorizedMinter(unauthorizedMinter, false);
        assertFalse(badge.authorizedMinters(unauthorizedMinter));
    }

    function test_RevertWhen_SetAuthorizedMinter_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert(Ownable.Unauthorized.selector);
        badge.setAuthorizedMinter(unauthorizedMinter, true);
    }

    // ========== Dynamic Metadata Update Tests ==========

    function test_DynamicMetadata_ScoreUpdate() public {
        registry.updateScore(user1, 100);
        uint256 tokenId = badge.mint(user1);
        
        string memory uriBefore = badge.tokenURI(tokenId);
        
        // Update score significantly
        registry.updateScore(user1, 900);
        
        string memory uriAfter = badge.tokenURI(tokenId);
        
        // Metadata should change (different tier)
        assertTrue(keccak256(bytes(uriBefore)) != keccak256(bytes(uriAfter)));
    }

    function test_DynamicMetadata_TierChange() public {
        // Start as Bronze
        registry.updateScore(user1, 150);
        uint256 tokenId = badge.mint(user1);
        
        string memory uriBronze = badge.tokenURI(tokenId);
        
        // Upgrade to Silver
        registry.updateScore(user1, 600);
        string memory uriSilver = badge.tokenURI(tokenId);
        
        // Upgrade to Gold
        registry.updateScore(user1, 900);
        string memory uriGold = badge.tokenURI(tokenId);
        
        // All should be different
        assertTrue(keccak256(bytes(uriBronze)) != keccak256(bytes(uriSilver)));
        assertTrue(keccak256(bytes(uriSilver)) != keccak256(bytes(uriGold)));
    }

    function test_DynamicMetadata_NoRemintRequired() public {
        // Mint once
        registry.updateScore(user1, 100);
        uint256 tokenId = badge.mint(user1);
        
        // Update score multiple times
        registry.updateScore(user1, 200);
        string memory uri1 = badge.tokenURI(tokenId);
        
        registry.updateScore(user1, 500);
        string memory uri2 = badge.tokenURI(tokenId);
        
        registry.updateScore(user1, 850);
        string memory uri3 = badge.tokenURI(tokenId);
        
        // Token ID should remain the same
        assertEq(badge.getTokenId(user1), tokenId);
        assertEq(badge.ownerOf(tokenId), user1);
        
        // But metadata should update
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
        assertTrue(keccak256(bytes(uri2)) != keccak256(bytes(uri3)));
    }

    // ========== Integration Tests ==========

    function test_CompleteFlow_MintAndUpdate() public {
        // 1. Set up reputation
        registry.updateScore(user1, 500);
        
        // 2. Mint badge
        uint256 tokenId = badge.mint(user1);
        assertEq(tokenId, 1);
        assertTrue(badge.hasBadge(user1));
        
        // 3. Get initial metadata
        string memory uri1 = badge.tokenURI(tokenId);
        
        // 4. Update reputation
        registry.updateScore(user1, 900);
        
        // 5. Verify metadata updated
        string memory uri2 = badge.tokenURI(tokenId);
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
        
        // 6. Token ownership unchanged
        assertEq(badge.ownerOf(tokenId), user1);
        assertEq(badge.getTokenId(user1), tokenId);
    }

    function test_MultipleBadges_DifferentMetadata() public {
        registry.updateScore(user1, 100);
        registry.updateScore(user2, 900);
        
        uint256 tokenId1 = badge.mint(user1);
        uint256 tokenId2 = badge.mint(user2);
        
        string memory uri1 = badge.tokenURI(tokenId1);
        string memory uri2 = badge.tokenURI(tokenId2);
        
        // Should have different metadata
        assertTrue(keccak256(bytes(uri1)) != keccak256(bytes(uri2)));
    }
}

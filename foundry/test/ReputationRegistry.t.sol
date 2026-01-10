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
}

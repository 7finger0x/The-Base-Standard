// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";
import {ReputationBadge} from "../src/ReputationBadge.sol";

contract DeployBadge is Script {
    function run() public {
        // Start broadcast
        vm.startBroadcast();

        // Get registry address from environment or deploy new one
        address registryAddress = vm.envOr("REPUTATION_REGISTRY_ADDRESS", address(0));
        
        ReputationRegistry registry;
        if (registryAddress == address(0)) {
            console.log("Deploying new ReputationRegistry...");
            registry = new ReputationRegistry();
            console.log("ReputationRegistry deployed at:", address(registry));
        } else {
            console.log("Using existing ReputationRegistry at:", registryAddress);
            registry = ReputationRegistry(registryAddress);
        }

        // Deploy ReputationBadge
        console.log("Deploying ReputationBadge...");
        ReputationBadge badge = new ReputationBadge(address(registry));
        console.log("ReputationBadge deployed at:", address(badge));
        console.log("Owner:", badge.owner());

        // Set authorized minter if provided
        address authorizedMinter = vm.envOr("BADGE_AUTHORIZED_MINTER", address(0));
        if (authorizedMinter != address(0)) {
            badge.setAuthorizedMinter(authorizedMinter, true);
            console.log("Authorized minter set to:", authorizedMinter);
        } else {
            console.log("NOTE: Set BADGE_AUTHORIZED_MINTER environment variable to configure minter");
        }

        vm.stopBroadcast();
    }
}

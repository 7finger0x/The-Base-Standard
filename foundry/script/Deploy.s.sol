// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";

contract Deploy is Script {
    function run() public {
        // Start broadcast without arguments to use the --private-key flag
        vm.startBroadcast();

        ReputationRegistry registry = new ReputationRegistry();

        // Log deployment info
        console.log("ReputationRegistry deployed at:", address(registry));
        console.log("Owner:", registry.owner());

        // If Chainlink Automation Registry address is provided, set it
        address automationRegistry = vm.envOr("CHAINLINK_AUTOMATION_REGISTRY", address(0));
        if (automationRegistry != address(0)) {
            registry.setAutomationRegistry(automationRegistry);
            console.log("Automation Registry set to:", automationRegistry);
        } else {
            console.log("NOTE: Set CHAINLINK_AUTOMATION_REGISTRY environment variable to configure automation");
        }

        vm.stopBroadcast();
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {ReputationRegistry} from "../src/ReputationRegistry.sol";

contract Deploy is Script {
    function run() public {
        // Start broadcast without arguments to use the --private-key flag
        vm.startBroadcast();

        new ReputationRegistry();

        vm.stopBroadcast();
    }
}
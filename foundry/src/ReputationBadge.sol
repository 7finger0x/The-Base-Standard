// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "solady/tokens/ERC721.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {LibString} from "solady/utils/LibString.sol";
import {Base64} from "solady/utils/Base64.sol";
import "./ReputationRegistry.sol";

/**
 * @title ReputationBadge
 * @notice ERC721 NFT that represents on-chain reputation badges
 * @dev Dynamic SVG generation based on current reputation score
 */
contract ReputationBadge is ERC721, Ownable {
    using LibString for uint256;

    error InvalidTokenId();
    error AlreadyMinted();
    error UnauthorizedMinter();

    ReputationRegistry public registry;
    mapping(address => uint256) public addressToTokenId;
    mapping(uint256 => address) public tokenIdToAddress;
    mapping(address => bool) public authorizedMinters;
    uint256 public nextTokenId = 1;

    constructor(address _registry) {
        _initializeOwner(msg.sender);
        registry = ReputationRegistry(_registry);
        authorizedMinters[msg.sender] = true;
    }

    function name() public pure override returns (string memory) {
        return "Base Standard Reputation Badge";
    }

    function symbol() public pure override returns (string memory) {
        return "BSRB";
    }

    /**
     * @notice Mint a badge for an address
     * @param to The address to mint the badge to
     * @return tokenId The token ID of the minted badge
     */
    function mint(address to) external returns (uint256) {
        if (!authorizedMinters[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedMinter();
        }
        if (addressToTokenId[to] != 0) {
            revert AlreadyMinted();
        }

        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        addressToTokenId[to] = tokenId;
        tokenIdToAddress[tokenId] = to;

        return tokenId;
    }

    /**
     * @notice Batch mint badges
     * @param recipients Array of addresses to mint to
     * @return tokenIds Array of minted token IDs
     */
    function batchMint(address[] calldata recipients) external returns (uint256[] memory) {
        if (!authorizedMinters[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedMinter();
        }

        uint256[] memory tokenIds = new uint256[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            address to = recipients[i];
            if (addressToTokenId[to] == 0) {
                uint256 tokenId = nextTokenId++;
                _mint(to, tokenId);
                addressToTokenId[to] = tokenId;
                tokenIdToAddress[tokenId] = to;
                tokenIds[i] = tokenId;
            } else {
                tokenIds[i] = addressToTokenId[to]; // Return existing token ID
            }
        }
        return tokenIds;
    }

    /**
     * @notice Set authorized minter
     * @param minter Address to authorize
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
    }

    /**
     * @notice Get token URI with dynamic SVG based on current reputation
     * @param tokenId The token ID
     * @return JSON metadata URI with base64 encoded SVG
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (tokenIdToAddress[tokenId] == address(0)) {
            revert InvalidTokenId();
        }

        address owner = tokenIdToAddress[tokenId];
        uint256 score = registry.reputationScores(owner);
        string memory tier = registry.reputationTiers(owner);

        string memory svg = generateBadgeSVG(owner, score, tier);
        string memory base64Svg = Base64.encode(bytes(svg));

        string memory json = string(abi.encodePacked(
            '{"name":"Reputation Badge #',
            tokenId.toString(),
            '","description":"On-chain reputation badge for The Base Standard. Dynamic metadata updates with reputation changes.","image":"data:image/svg+xml;base64,',
            base64Svg,
            '","attributes":[{"trait_type":"Tier","value":"',
            tier,
            '"},{"trait_type":"Score","value":',
            score.toString(),
            '},{"trait_type":"Address","value":"',
            _addressToString(owner),
            '"}]}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    /**
     * @notice Generate SVG badge based on reputation
     * @param owner The badge owner address
     * @param score The reputation score
     * @param tier The reputation tier
     * @return SVG string
     */
    function generateBadgeSVG(address owner, uint256 score, string memory tier)
        internal
        pure
        returns (string memory)
    {
        string memory color = getTierColor(tier);
        string memory addressStr = _addressToString(owner);

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
            '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:',
            color,
            ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:',
            _darkenColor(color),
            ';stop-opacity:1" />',
            '</linearGradient></defs>',
            '<rect width="512" height="512" rx="64" fill="url(#grad)"/>',
            '<circle cx="256" cy="200" r="80" fill="rgba(255,255,255,0.2)"/>',
            '<text x="256" y="210" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">',
            tier,
            '</text>',
            '<text x="256" y="320" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Score: ',
            score.toString(),
            '</text>',
            '<text x="256" y="360" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle">',
            addressStr,
            '</text>',
            '<text x="256" y="450" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">The Base Standard</text>',
            '</svg>'
        ));
    }

    /**
     * @notice Get tier color
     * @param tier The tier name
     * @return Hex color code
     */
    function getTierColor(string memory tier) internal pure returns (string memory) {
        bytes memory tierBytes = bytes(tier);
        if (keccak256(tierBytes) == keccak256(bytes("LEGEND"))) return "#FFD700";
        if (keccak256(tierBytes) == keccak256(bytes("BASED"))) return "#00FFFF";
        if (keccak256(tierBytes) == keccak256(bytes("BUILDER"))) return "#FF6B6B";
        if (keccak256(tierBytes) == keccak256(bytes("RESIDENT"))) return "#4ECDC4";
        return "#95A5A6"; // TOURIST
    }

    /**
     * @notice Darken color for gradient (simple implementation)
     */
    function _darkenColor(string memory color) internal pure returns (string memory) {
        bytes memory colorBytes = bytes(color);
        if (keccak256(colorBytes) == keccak256(bytes("#FFD700"))) return "#B8860B";
        if (keccak256(colorBytes) == keccak256(bytes("#00FFFF"))) return "#008B8B";
        if (keccak256(colorBytes) == keccak256(bytes("#FF6B6B"))) return "#CC5555";
        if (keccak256(colorBytes) == keccak256(bytes("#4ECDC4"))) return "#3A9992";
        return "#6C7A7A"; // Dark gray
    }

    /**
     * @notice Convert address to string
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @notice Get badge token ID for an address
     * @param owner The address to check
     * @return tokenId The token ID (0 if not minted)
     */
    function getTokenId(address owner) external view returns (uint256) {
        return addressToTokenId[owner];
    }

    /**
     * @notice Check if address has a badge
     * @param owner The address to check
     * @return hasBadge Whether the address has a badge
     */
    function hasBadge(address owner) external view returns (bool) {
        return addressToTokenId[owner] != 0;
    }
}

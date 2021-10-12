pragma solidity ^0.8.0;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

// We inherit the contract we imported. This means we'll have access
// to the inherited contract's methods.
contract MyEpicNFT is ERC721URIStorage {
  // Magic given to us by OpenZeppelin to help us keep track of tokenIds.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

    // We split the SVG at the part where it asks for the background color.
  string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
  string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

  string[] firstWords = ["Brave", "Breakable", "Bright", "Busy", "Calm", "Careful"];
  string[] secondWords = ["Vucic", "Nikolic", "Dejanovic", "Tadic", "Markovic", "Mihailovic"];
  string[] thirdWords = ["Hamburger", "Beer", "Pizza", "Burek", "Rakija", "Cevapi"];
  
  string[] colors = ["red", "#08C2A8", "black", "yellow", "blue", "green"];

  uint256 public constant MINT_LIMIT = 50;

  event NewEpicNFTMinted(address sender, uint256 tokenId);
  // We need to pass the name of our NFTs token and it's symbol.
  constructor() ERC721 ("SquareNFT", "SQUARE") {
    console.log("This is my NFT contract. Woah!");
  }

  function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
      uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));

      rand = rand % firstWords.length;
      return firstWords[rand];
  }
  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
      uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));

      rand = rand % firstWords.length;
      return secondWords[rand];
  }
  function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
      uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));

      rand = rand % firstWords.length;
      return thirdWords[rand];
  }
  function random(string memory input) internal pure returns (uint256) {
      return uint256(keccak256(abi.encodePacked(input)));
  }
  // Same old stuff, pick a random color.
  function pickRandomColor(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("COLOR", Strings.toString(tokenId))));
    rand = rand % colors.length;
    return colors[rand];
  }
  function getTotalNFTsMintedSoFar() public view returns(uint256) {
      return _tokenIds.current();
  }
  function getLimitNFTs() public view returns(uint256) {
      return MINT_LIMIT;
  }

  // A function our user will hit to get their NFT.
  function makeAnEpicNFT() public {
    require(_tokenIds.current() < MINT_LIMIT);
    // Get the current tokenId, this starts at 0.
    uint256 newItemId = _tokenIds.current();

    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory third = pickRandomThirdWord(newItemId);
    string memory combinedWord = string(abi.encodePacked(first, second, third));
    
    // Add the random color in.
    string memory randomColor = pickRandomColor(newItemId);
    string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, combinedWord, "</text></svg>"));

    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    // We set the title of our NFT as the generated word.
                    combinedWord,
                    '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );

    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");

     // Actually mint the NFT to the sender using msg.sender.
    _safeMint(msg.sender, newItemId);

    // Set the NFTs data.
    _setTokenURI(newItemId, finalTokenUri);

    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }
}
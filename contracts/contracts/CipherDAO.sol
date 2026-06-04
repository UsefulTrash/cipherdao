// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract CipherDAO {
    struct Proposal { string title; string desc; uint256 yesVotes; uint256 noVotes; uint256 endAt; bool executed; }
    address public owner;
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public voted;
    constructor() { owner = msg.sender; }
    receive() external payable {}
    function propose(string calldata title, string calldata desc, uint256 duration) external returns (uint256) {
        proposals.push(Proposal(title, desc, 0, 0, block.timestamp + duration, false));
        return proposals.length - 1;
    }
    function vote(uint256 id, bool yes) external {
        require(!voted[id][msg.sender], "voted");
        require(block.timestamp < proposals[id].endAt, "ended");
        voted[id][msg.sender] = true;
        if (yes) proposals[id].yesVotes++; else proposals[id].noVotes++;
    }
    function execute(uint256 id) external {
        Proposal storage p = proposals[id];
        require(!p.executed && block.timestamp >= p.endAt, "not ready");
        p.executed = true;
    }
    function getProposal(uint256 id) external view returns (Proposal memory) { return proposals[id]; }
    function totalProposals() external view returns (uint256) { return proposals.length; }
}
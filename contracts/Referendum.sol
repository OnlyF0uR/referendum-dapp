// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract Referendum {
    // Proposal model
    struct Proposal {
        uint id;
        string titel;
        string description;
        uint voteCount; // To prevent extra loops
    }

    struct Vote {
        uint id;
        uint proposal;
        address voter;
    }

    mapping(uint => Proposal) public proposals;
    mapping(uint => Vote) public votes;

    uint public proposalCount;
    uint public voteCount;

    event votedEvent(uint indexed _proposalId);

    constructor () public {
        addProposal("Freedom must be reinstantiated.", "Due to the recent events the human race is no longer a free species, this proposal must set the species free again.");
        addProposal("Rights must be reasigned.", "Humans simply lost their rights, voting in favour of this proposal means human rights must be reinstantiated.");
    }

    function addProposal(string memory _name, string memory _desc) private {
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, _name, _desc, 0);
    }

    function checkVote(uint _pId) public view returns (bool res) {
        for (uint i = 0; i < voteCount; i++) {
            if (votes[i].proposal == _pId) {
                if (votes[i].voter == msg.sender) {
                    return true;
                }
            }  
        }
        return false;
    }

    function vote (uint _proposalId) public {
        // Prevent voting for unexistent proposal
        require(_proposalId > 0 && _proposalId <= proposalCount);
        // Ensure the user has not voted before
        require(!checkVote(_proposalId));

        // Increment the vote count
        proposals[_proposalId].voteCount++;

        voteCount++;
        votes[voteCount] = Vote(voteCount, _proposalId, msg.sender);

        emit votedEvent(_proposalId);
    }
}


/*
    Referendum.deployed().then(function(i) { app = i })
    web3.eth.getAccounts().then(function(acc){ accounts = acc })
*/
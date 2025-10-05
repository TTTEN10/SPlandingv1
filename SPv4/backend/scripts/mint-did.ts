import { ethers } from "hardhat";
import { DIDRegistry } from "../typechain-types";

async function main() {
    console.log("🪙 Starting DID minting process...");

    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("❌ Usage: npx hardhat run scripts/mint-did.ts --network <network> -- <did> <document>");
        console.log("📝 Example: npx hardhat run scripts/mint-did.ts --network localhost -- 'did:safepsy:user123' '{\"@context\":\"https://www.w3.org/ns/did/v1\",\"id\":\"did:safepsy:user123\"}'");
        process.exit(1);
    }

    const [did, document] = args;
    
    // Validate inputs
    if (!did || !document) {
        console.log("❌ Error: DID and document are required");
        process.exit(1);
    }

    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("📝 Minting DID with account:", signer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");

    // Get contract address from environment or use default
    const contractAddress = process.env.DID_REGISTRY_ADDRESS;
    if (!contractAddress) {
        console.log("❌ Error: DID_REGISTRY_ADDRESS environment variable not set");
        console.log("💡 Set it to the deployed DIDRegistry contract address");
        process.exit(1);
    }

    console.log("🔗 Using DIDRegistry at:", contractAddress);

    // Connect to the contract
    const DIDRegistryFactory = await ethers.getContractFactory("DIDRegistry");
    const didRegistry = DIDRegistryFactory.attach(contractAddress) as DIDRegistry;

    // Verify contract is accessible
    try {
        const owner = await didRegistry.owner();
        console.log("✅ Contract accessible, owner:", owner);
    } catch (error) {
        console.log("❌ Error: Cannot access contract at address:", contractAddress);
        console.log("💡 Make sure the contract is deployed and the address is correct");
        process.exit(1);
    }

    // Check if DID already exists
    try {
        const existingDidHash = await didRegistry.getDIDHash(did);
        if (existingDidHash !== ethers.ZeroHash) {
            console.log("⚠️  Warning: DID already exists with hash:", existingDidHash);
            console.log("🔄 Attempting to update existing DID...");
            
            // Update existing DID
            const tx = await didRegistry.updateDID(existingDidHash, document);
            console.log("📤 Update transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ DID updated successfully!");
            console.log("📊 Gas used:", receipt?.gasUsed.toString());
            
            return;
        }
    } catch (error) {
        // DID doesn't exist, continue with creation
        console.log("📝 DID doesn't exist, creating new one...");
    }

    // Create the DID
    console.log("\n🪙 Creating DID...");
    console.log("📋 DID:", did);
    console.log("📄 Document:", document);

    try {
        const tx = await didRegistry.createDID(did, document);
        console.log("📤 Transaction sent:", tx.hash);
        console.log("⏳ Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("✅ DID created successfully!");
        console.log("📊 Gas used:", receipt?.gasUsed.toString());

        // Get the DID hash
        const didHash = await didRegistry.getDIDHash(did);
        console.log("🔗 DID Hash:", didHash);

        // Get DID details
        const didDoc = await didRegistry.getDID(didHash);
        console.log("\n📋 DID Details:");
        console.log("=" .repeat(40));
        console.log("DID:", didDoc.did);
        console.log("Owner:", didDoc.owner);
        console.log("Created At:", new Date(Number(didDoc.createdAt) * 1000).toISOString());
        console.log("Updated At:", new Date(Number(didDoc.updatedAt) * 1000).toISOString());
        console.log("Active:", didDoc.isActive);
        console.log("Controllers:", didDoc.controllers.length);
        console.log("=" .repeat(40));

        // Display transaction details
        if (receipt) {
            console.log("\n📊 Transaction Details:");
            console.log("Block Number:", receipt.blockNumber);
            console.log("Block Hash:", receipt.blockHash);
            console.log("Transaction Hash:", receipt.hash);
            console.log("Gas Used:", receipt.gasUsed.toString());
            console.log("Effective Gas Price:", ethers.formatUnits(receipt.gasPrice || 0, "gwei"), "gwei");
        }

    } catch (error: any) {
        console.log("❌ Error creating DID:");
        if (error.message) {
            console.log("Message:", error.message);
        }
        if (error.code) {
            console.log("Code:", error.code);
        }
        if (error.reason) {
            console.log("Reason:", error.reason);
        }
        process.exit(1);
    }

    console.log("\n🎯 Next Steps:");
    console.log("1. Use the DID hash to store data with store-data.ts script");
    console.log("2. Add controllers if needed");
    console.log("3. Update your application with the new DID");

    console.log("\n🎉 DID minting completed successfully!");
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Minting failed:");
        console.error(error);
        process.exit(1);
    });

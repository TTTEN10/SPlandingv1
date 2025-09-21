import { ethers } from "hardhat";
import { DIDStorage } from "../typechain-types";

async function main() {
    console.log("💾 Starting data storage process...");

    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log("❌ Usage: npx hardhat run scripts/store-data.ts --network <network> -- <didHash> <dataType> <dataHash> [isEncrypted]");
        console.log("📝 Example: npx hardhat run scripts/store-data.ts --network localhost -- '0x123...' 'profile' '0x456...' true");
        process.exit(1);
    }

    const [didHash, dataType, dataHash, isEncryptedStr] = args;
    const isEncrypted = isEncryptedStr === 'true' || isEncryptedStr === '1';
    
    // Validate inputs
    if (!didHash || !dataType || !dataHash) {
        console.log("❌ Error: DID hash, data type, and data hash are required");
        process.exit(1);
    }

    // Validate hex strings
    if (!ethers.isHexString(didHash) || !ethers.isHexString(dataHash)) {
        console.log("❌ Error: DID hash and data hash must be valid hex strings");
        process.exit(1);
    }

    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("📝 Storing data with account:", signer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");

    // Get contract address from environment or use default
    const contractAddress = process.env.DID_STORAGE_ADDRESS;
    if (!contractAddress) {
        console.log("❌ Error: DID_STORAGE_ADDRESS environment variable not set");
        console.log("💡 Set it to the deployed DIDStorage contract address");
        process.exit(1);
    }

    console.log("🔗 Using DIDStorage at:", contractAddress);

    // Connect to the contract
    const DIDStorageFactory = await ethers.getContractFactory("DIDStorage");
    const didStorage = DIDStorageFactory.attach(contractAddress) as DIDStorage;

    // Verify contract is accessible
    try {
        const owner = await didStorage.owner();
        console.log("✅ Contract accessible, owner:", owner);
    } catch (error) {
        console.log("❌ Error: Cannot access contract at address:", contractAddress);
        console.log("💡 Make sure the contract is deployed and the address is correct");
        process.exit(1);
    }

    // Check if data already exists
    try {
        const dataExists = await didStorage.dataExists(didHash, dataType);
        if (dataExists) {
            console.log("⚠️  Warning: Data already exists for this DID and data type");
            console.log("🔄 Attempting to update existing data...");
            
            // Update existing data
            const tx = await didStorage.updateData(didHash, dataType, dataHash);
            console.log("📤 Update transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            console.log("✅ Data updated successfully!");
            console.log("📊 Gas used:", receipt?.gasUsed.toString());
            
            return;
        }
    } catch (error) {
        // Data doesn't exist, continue with creation
        console.log("📝 Data doesn't exist, creating new entry...");
    }

    // Store the data
    console.log("\n💾 Storing data...");
    console.log("🔗 DID Hash:", didHash);
    console.log("📋 Data Type:", dataType);
    console.log("🔐 Data Hash:", dataHash);
    console.log("🔒 Encrypted:", isEncrypted);

    try {
        const tx = await didStorage.storeData(didHash, dataType, dataHash, isEncrypted);
        console.log("📤 Transaction sent:", tx.hash);
        console.log("⏳ Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("✅ Data stored successfully!");
        console.log("📊 Gas used:", receipt?.gasUsed.toString());

        // Get stored data details
        const storedData = await didStorage.getData(didHash, dataType);
        console.log("\n💾 Stored Data Details:");
        console.log("=" .repeat(40));
        console.log("Data Hash:", storedData.dataHash);
        console.log("Data Type:", storedData.dataType);
        console.log("Timestamp:", new Date(Number(storedData.timestamp) * 1000).toISOString());
        console.log("Encrypted:", storedData.isEncrypted);
        console.log("Authorized Accessors:", storedData.authorizedAccessors.length);
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
        console.log("❌ Error storing data:");
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
    console.log("1. Grant access to other users if needed");
    console.log("2. Update your application with the stored data reference");
    console.log("3. Consider implementing data encryption on the client side");

    console.log("\n🎉 Data storage completed successfully!");
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Data storage failed:");
        console.error(error);
        process.exit(1);
    });

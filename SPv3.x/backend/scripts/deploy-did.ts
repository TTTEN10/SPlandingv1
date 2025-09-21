import { ethers } from "hardhat";
import { DIDRegistry, DIDStorage } from "../typechain-types";

async function main() {
    console.log("🚀 Starting DID contracts deployment...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Deploy DIDRegistry
    console.log("\n📋 Deploying DIDRegistry...");
    const DIDRegistryFactory = await ethers.getContractFactory("DIDRegistry");
    const didRegistry = await DIDRegistryFactory.deploy();
    await didRegistry.waitForDeployment();
    
    const didRegistryAddress = await didRegistry.getAddress();
    console.log("✅ DIDRegistry deployed to:", didRegistryAddress);

    // Deploy DIDStorage
    console.log("\n💾 Deploying DIDStorage...");
    const DIDStorageFactory = await ethers.getContractFactory("DIDStorage");
    const didStorage = await DIDStorageFactory.deploy(didRegistryAddress);
    await didStorage.waitForDeployment();
    
    const didStorageAddress = await didStorage.getAddress();
    console.log("✅ DIDStorage deployed to:", didStorageAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    const registryOwner = await didRegistry.owner();
    const storageOwner = await didStorage.owner();
    const storageRegistry = await didStorage.didRegistry();
    
    console.log("📋 DIDRegistry owner:", registryOwner);
    console.log("💾 DIDStorage owner:", storageOwner);
    console.log("🔗 DIDStorage registry address:", storageRegistry);
    
    // Verify addresses match
    if (registryOwner === deployer.address && storageOwner === deployer.address && storageRegistry === didRegistryAddress) {
        console.log("✅ All verifications passed!");
    } else {
        console.log("❌ Verification failed!");
        process.exit(1);
    }

    // Display deployment summary
    console.log("\n📊 Deployment Summary:");
    console.log("=" .repeat(50));
    console.log("Network:", await ethers.provider.getNetwork().then(n => n.name));
    console.log("Deployer:", deployer.address);
    console.log("DIDRegistry:", didRegistryAddress);
    console.log("DIDStorage:", didStorageAddress);
    console.log("Gas used:", "Check transaction receipts for details");
    console.log("=" .repeat(50));

    // Save deployment info
    const deploymentInfo = {
        network: await ethers.provider.getNetwork().then(n => n.name),
        chainId: await ethers.provider.getNetwork().then(n => n.chainId),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            DIDRegistry: {
                address: didRegistryAddress,
                transactionHash: didRegistry.deploymentTransaction()?.hash
            },
            DIDStorage: {
                address: didStorageAddress,
                transactionHash: didStorage.deploymentTransaction()?.hash
            }
        }
    };

    console.log("\n💾 Deployment info saved:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Instructions for next steps
    console.log("\n🎯 Next Steps:");
    console.log("1. Update your frontend/backend with the new contract addresses");
    console.log("2. Run 'npx hardhat verify --network <network> <contract_address>' to verify contracts");
    console.log("3. Test the contracts using the mint-did.ts and store-data.ts scripts");
    console.log("4. Update your environment variables with the new addresses");

    console.log("\n🎉 Deployment completed successfully!");
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });

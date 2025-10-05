// Export TypeChain types - using namespace imports to avoid conflicts
import * as DIDRegistryTypes from './contracts/DIDRegistry';
import * as DIDStorageTypes from './contracts/DIDStorage';
import * as IDIDRegistryTypes from './contracts/interfaces/IDIDRegistry';
import * as IDIDStorageTypes from './contracts/interfaces/IDIDStorage';

export { DIDRegistryTypes, DIDStorageTypes, IDIDRegistryTypes, IDIDStorageTypes };

// Re-export specific types we need
export type DIDDocument = IDIDRegistryTypes.IDIDRegistry.DIDDocumentStructOutput;
export type StoredData = IDIDStorageTypes.IDIDStorage.StoredDataStructOutput;

// Export common types
export * from './common';

// Export privacy utilities
export * from './privacy';

// Export ABIs
import DIDRegistryABI from '../abis/DIDRegistry.json';
import DIDStorageABI from '../abis/DIDStorage.json';

export const ABIs = {
  DIDRegistry: DIDRegistryABI,
  DIDStorage: DIDStorageABI,
} as const;

// Export contract addresses (to be set during deployment)
export const CONTRACT_ADDRESSES = {
  DIDRegistry: process.env.DID_REGISTRY_ADDRESS || '',
  DIDStorage: process.env.DID_STORAGE_ADDRESS || '',
} as const;

// Event types for indexing
export interface DIDEvent {
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  timestamp: number;
}

export interface DIDCreatedEvent extends DIDEvent {
  type: 'DIDCreated';
  didHash: string;
  owner: string;
  did: string;
}

export interface DIDUpdatedEvent extends DIDEvent {
  type: 'DIDUpdated';
  didHash: string;
  newDocument: string;
}

export interface DIDRevokedEvent extends DIDEvent {
  type: 'DIDRevoked';
  didHash: string;
}

export interface DIDTransferredEvent extends DIDEvent {
  type: 'DIDTransferred';
  didHash: string;
  newOwner: string;
}

export interface ControllerAddedEvent extends DIDEvent {
  type: 'ControllerAdded';
  didHash: string;
  controller: string;
}

export interface ControllerRemovedEvent extends DIDEvent {
  type: 'ControllerRemoved';
  didHash: string;
  controller: string;
}

export interface DataStoredEvent extends DIDEvent {
  type: 'DataStored';
  didHash: string;
  dataType: string;
  dataHash: string;
}

export interface DataUpdatedEvent extends DIDEvent {
  type: 'DataUpdated';
  didHash: string;
  dataType: string;
  newDataHash: string;
}

export interface DataDeletedEvent extends DIDEvent {
  type: 'DataDeleted';
  didHash: string;
  dataType: string;
}

export interface AccessGrantedEvent extends DIDEvent {
  type: 'AccessGranted';
  didHash: string;
  accessor: string;
  dataType: string;
}

export interface AccessRevokedEvent extends DIDEvent {
  type: 'AccessRevoked';
  didHash: string;
  accessor: string;
  dataType: string;
}

export type AllDIDEvents = 
  | DIDCreatedEvent
  | DIDUpdatedEvent
  | DIDRevokedEvent
  | DIDTransferredEvent
  | ControllerAddedEvent
  | ControllerRemovedEvent
  | DataStoredEvent
  | DataUpdatedEvent
  | DataDeletedEvent
  | AccessGrantedEvent
  | AccessRevokedEvent;
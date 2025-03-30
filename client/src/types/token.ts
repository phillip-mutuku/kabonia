export enum TokenStatus {
  AVAILABLE = 'available',
  LISTED = 'listed',
  TRANSFERRING = 'transferring',
  MINTED = 'minted',
  RETIRED = 'retired'
}

export interface Token {
  _id: string;
  tokenId: string;
  name: string;
  projectId: string;
  projectName: string;
  owner: string;
  amount: number;
  price: number;
  currentPrice: number;
  carbonOffset: number;
  status: TokenStatus;
  image?: string;
  projectType: string;
  location: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  seller: string;
}

export interface CreateTokenInput {
  projectId: string;
  name: string;
  symbol: string;
  initialSupply: number;
  decimals?: number;
}

export interface TokenTransferInput {
  tokenId: string;
  to: string;
  amount: number;
}

export interface TokenMintInput {
  tokenId: string;
  amount: number;
}

export interface RetireTokenInput {
  tokenId: string;
  amount: number;
  purpose?: string;
  beneficiary?: string;
}

export interface ListTokenInput {
  tokenId: string;
  amount: number;
  price: number;
}

export interface TokenBalance {
  _id: string;
  tokenId: string;
  name: string;
  projectId: string;
  projectName: string;
  amount: number;
  price: number;  
  carbonOffset: number;
  projectType: string;
  image?: string;
  location?: string;
  verified?: boolean;
  status?: TokenStatus;
}

export interface TokenTransaction {
  _id: string;
  tokenId: string;
  type: 'mint' | 'transfer' | 'retire' | 'buy' | 'sell';
  from?: string;
  to?: string;
  amount: number;
  price?: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  hederaTransactionId?: string;
}

export interface TokenFilterOptions {
  projectId?: string;
  owner?: string;
  status?: TokenStatus;
  projectType?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TokenPricePoint {
  date: string;
  price: number;
  volume?: number;
}

export interface TokenCertificate {
  _id: string;
  tokenId: string;
  projectId: string;
  owner: string;
  amount: number;
  carbonOffset: number;
  retirementDate: string;
  purpose?: string;
  beneficiary?: string;
  certificateUrl: string;
  hederaTransactionId: string;
}

export function adaptTokenBalanceToToken(tokenBalance: TokenBalance): Token {
  return {
    _id: tokenBalance._id,
    tokenId: tokenBalance.tokenId,
    name: tokenBalance.name,
    projectId: tokenBalance.projectId,
    projectName: tokenBalance.projectName,
    owner: '',
    amount: tokenBalance.amount,
    price: tokenBalance.price,
    currentPrice: tokenBalance.price,
    carbonOffset: tokenBalance.carbonOffset,
    status: TokenStatus.AVAILABLE,
    image: tokenBalance.image || '',
    projectType: tokenBalance.projectType,
    location: tokenBalance.location || '', 
    verified: tokenBalance.verified || false,
    createdAt: '',
    updatedAt: '',
    seller: ''
  };
}